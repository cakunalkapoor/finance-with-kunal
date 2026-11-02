#!/usr/bin/env python3
"""Refresh reported All-India Combined CPI inflation from official MoSPI data.

Keep published inflation rates on each side of the January 2026 basket change.
Never derive transition-year inflation by joining index levels from two baskets.
Only the Python standard library and curl (secondary official transport) are used.
"""
import argparse
import calendar
import json
import math
import subprocess
import sys
from datetime import date, datetime, timezone
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parent
TARGET = ROOT / 'india-cpi-data.json'
MCP = 'https://mcp.mospi.gov.in/'
API = 'https://api.mospi.gov.in/api/cpi/getCPIData'
PORTAL = 'https://esankhyiki.mospi.gov.in/macroindicators?product=cpi'
METHODOLOGY = 'https://www.pib.gov.in/PressReleasePage.aspx?PRID=2291051&lang=1&reg=1'
BREAK = '2026-01'
MONTHS = {name: index for index, name in enumerate(calendar.month_name) if name}
HISTORY_NOTE = ('Reported headline inflation, with a basket change in January 2026. '
                'Earlier readings use the 2012 basket; readings from January 2026 use the 2024 basket. '
                'The chart separates these series because their baskets and methods differ. '
                'No transition-year inflation is calculated from mismatched index levels.')


def month_number(period):
    parsed = date.fromisoformat(period + '-01')
    return parsed.year * 12 + parsed.month - 1


def read_json_response(body):
    text = body.decode('utf-8')
    if text.lstrip().startswith('{'):
        return json.loads(text)
    # Streamable HTTP MCP can return a bounded SSE response rather than JSON.
    for block in text.replace('\r\n', '\n').split('\n\n'):
        lines = [line[5:].lstrip() for line in block.splitlines() if line.startswith('data:')]
        if lines:
            message = json.loads('\n'.join(lines))
            if message.get('id') == 1:
                return message
    raise ValueError('MoSPI returned no JSON-RPC response')


def mcp_data(filters):
    payload = dict(jsonrpc='2.0', id=1, method='tools/call',
                   params=dict(name='get_data', arguments=dict(dataset='CPI', filters=filters)))
    request = Request(MCP, data=json.dumps(payload).encode(), headers={
        'Content-Type': 'application/json', 'Accept': 'application/json, text/event-stream',
    })
    with urlopen(request, timeout=20) as response:
        body = response.read(2_000_001)
    if len(body) > 2_000_000:
        raise ValueError('Oversized CPI response')
    message = read_json_response(body)
    if 'error' in message:
        raise ValueError('MoSPI RPC error')
    result = message['result']
    if result.get('isError'):
        raise ValueError('MoSPI tool error')
    data = result.get('structuredContent')
    if data is None:
        data = json.loads(next(item['text'] for item in result['content'] if item['type'] == 'text'))
    if 'error' in data:
        raise ValueError('MoSPI upstream API error')
    return data


def direct_data(filters):
    # Keep TLS verification enabled. The public MCP service avoids the legacy
    # renegotiation problem some TLS clients encounter on the direct API host.
    response = subprocess.run(['curl', '--fail', '--silent', '--show-error',
                               '--connect-timeout', '7', '--max-time', '20',
                               API + '?' + urlencode(filters)], capture_output=True, check=True)
    if len(response.stdout) > 2_000_000:
        raise ValueError('Oversized direct CPI response')
    return json.loads(response.stdout)


def filters_for(base, as_of):
    # Codes verified from official get_metadata, not inferred across base years:
    # All India is 99 under 2012 and 1 under 2024; Combined is 3 in both.
    filters = dict(base_year=base, series='Current', sector_code='3',
                   state_code='99' if base == '2012' else '1',
                   year=','.join(str(year) for year in range(2022, 2026)) if base == '2012'
                   else ','.join(str(year) for year in range(2025, as_of.year + 1)),
                   limit=100, page=1, Format='JSON')
    filters['group_code' if base == '2012' else 'division_code'] = '0'
    return filters


def fetch_data(base, as_of, primary=mcp_data, secondary=direct_data):
    filters = filters_for(base, as_of)
    rows, expected = [], None
    for page in range(1, 11):
        filters['page'] = page
        try:
            response = primary(filters)
        except (OSError, ValueError, KeyError, StopIteration):
            response = secondary(filters)
        if not isinstance(response, dict) or response.get('statusCode') is not True or not isinstance(response.get('data'), list):
            raise ValueError('Invalid CPI response schema')
        meta = response['meta_data']
        total = int(meta['totalRecords'])
        if expected is not None and expected != total:
            raise ValueError('CPI data changed during pagination; retry the refresh')
        expected = total
        if int(meta['page']) != page or total <= 0 or int(meta['totalPages']) > 10:
            raise ValueError('Invalid CPI pagination')
        rows.extend(response['data'])
        if page == int(meta['totalPages']):
            if len(rows) != total:
                raise ValueError('Incomplete CPI pagination')
            return rows
    raise ValueError('CPI pagination exceeded its bound')


def parse_rows(rows, base, as_of):
    if not isinstance(rows, list) or not rows:
        raise ValueError('Empty or invalid CPI records')
    result, indices = {}, {}
    for row in rows:
        if not isinstance(row, dict):
            raise ValueError('Invalid CPI record')
        if str(row.get('base_year', row.get('baseyear'))) != base:
            raise ValueError('Unexpected CPI base year')
        if row.get('state') != 'All India' or row.get('sector') != 'Combined':
            raise ValueError('CPI query is not national combined coverage')
        if base == '2012':
            if row.get('group') != 'General' or row.get('subgroup') != 'General-Overall':
                raise ValueError('Expected all-items CPI, not food or a subgroup')
        elif row.get('division') != 'CPI (General)' or any(row.get(key) is not None for key in ['group', 'class', 'sub_class', 'item']):
            raise ValueError('Expected headline CPI division only')
        month = MONTHS[row['month']]
        period = f"{int(row['year']):04}-{month:02}"
        if period > as_of.strftime('%Y-%m'):
            raise ValueError('Future CPI observation')
        index = float(row['index'])
        if not math.isfinite(index) or index <= 0 or period in indices:
            raise ValueError('Invalid or duplicate CPI index')
        indices[period] = index
        if row.get('inflation') is None:
            if base == '2024' and period.startswith('2025-'):
                continue  # New basket has 2025 indices, but no reported 2025 YoY rates.
            raise ValueError('Missing published CPI inflation')
        value = float(row['inflation'])
        if not math.isfinite(value) or not -100 < value < 1000:
            raise ValueError('Invalid CPI inflation')
        if (base == '2012' and period >= BREAK) or (base == '2024' and period < BREAK):
            raise ValueError('CPI basket transition changed; review the source contract')
        result[period] = round(value, 2)
    # Reconcile published rates against exact prior-year indices within each
    # basket only. Published index rounding allows small numeric differences.
    for period, value in result.items():
        prior = f'{int(period[:4]) - 1}{period[4:]}'
        if prior in indices and abs((indices[period] / indices[prior] - 1) * 100 - value) > (0.12 if base == '2012' else 0.03):
            raise ValueError('Published CPI rate does not reconcile with its own-basket index')
    return [{'date': period, 'value': value} for period, value in sorted(result.items())]


def validate_history(points):
    if len(points) < 37 or month_number(points[-1]['date']) - month_number(points[0]['date']) < 36:
        raise ValueError('India CPI requires at least three full years of sourced headline history')
    for previous, current in zip(points, points[1:]):
        if month_number(current['date']) - month_number(previous['date']) != 1:
            raise ValueError('Missing or duplicate CPI month; do not interpolate')


def build_snapshot(source_data, as_of):
    old = parse_rows(source_data['2012'], '2012', as_of)
    current = parse_rows(source_data['2024'], '2024', as_of)
    if len(current) < 2 or old[-1]['date'] != '2025-12' or current[0]['date'] != BREAK:
        raise ValueError('Incomplete CPI basket transition')
    points = (old + current)[-48:]
    validate_history(points)
    last, previous = points[-1], points[-2]
    change = round(last['value'] - previous['value'], 2)
    indicator = dict(id='india-cpi', name='India Consumer inflation (CPI)', category='inflation',
                     country='India', flag='🇮🇳', value=last['value'], unit='% YoY',
                     previousValue=previous['value'], change=change,
                     direction='up' if change > 0 else 'down' if change < 0 else 'neutral',
                     isPositiveGood=False,
                     period=datetime.strptime(last['date'], '%Y-%m').strftime('%b %Y'),
                     timeSeries=points, sourceUrl=PORTAL,
                     apiUrl=API + '?' + urlencode(filters_for('2024', as_of)),
                     historyNote=HISTORY_NOTE,
                     seriesBreaks=[dict(date=BREAK, label='CPI basket changed')],
                     context='This is published all-items retail inflation for rural and urban India combined. '
                             'It compares prices with the same month a year earlier. A lower positive rate means '
                             'prices are rising more slowly. Compare readings within the same CPI basket; '
                             'the latest two readings use the 2024 basket and may be revised.',
                     description='MoSPI/NSO All-India Combined CPI (General), published year-on-year inflation, '
                                 'not CPI-IW, food inflation or a monthly price change. The historical section '
                                 'through December 2025 retains the published 2012-basket headline rates. '
                                 'The 2024-basket headline rates begin in January 2026. This is a history of '
                                 'reported headline rates, not a constant-basket reconstructed series.',
                     sourceReferences=[dict(label='Official CPI data service', url=MCP),
                                       dict(label='MoSPI basket revision and comparability', url=METHODOLOGY),
                                       dict(label='Predecessor headline CPI source', url=API + '?' + urlencode(filters_for('2012', as_of)))])
    return dict(reviewedAt=as_of.isoformat(), lastAttemptAt=as_of.isoformat(), sourceStatus='verified', cacheNote='',
                indicators=[indicator], sourceData=source_data)


def expected_period(as_of):
    # CPI is normally published on the 12th of the following month; allow a
    # short holiday/publication grace period before flagging a delayed feed.
    offset = 2 if as_of.day < 16 else 1
    serial = as_of.year * 12 + as_of.month - 1 - offset
    return f'{serial // 12:04}-{serial % 12 + 1:02}'


def refresh(target, as_of, allow_cached=False, fetcher=fetch_data):
    try:
        source_data = {base: fetcher(base, as_of) for base in ['2012', '2024']}
        snapshot = build_snapshot(source_data, as_of)
        if snapshot['indicators'][0]['timeSeries'][-1]['date'] < expected_period(as_of):
            raise ValueError('Official CPI feed has not reached the expected published month')
        if target.exists():
            saved = json.loads(target.read_text())
            if snapshot['indicators'][0]['timeSeries'][-1]['date'] < saved['indicators'][0]['timeSeries'][-1]['date']:
                raise ValueError('CPI feed regressed to an older observation')
    except (OSError, ValueError, KeyError, IndexError, subprocess.SubprocessError) as error:
        if not allow_cached or not target.exists():
            raise
        saved = json.loads(target.read_text())
        verified_on = date.fromisoformat(saved['reviewedAt'])
        if not 0 <= (as_of - verified_on).days <= 45:
            raise ValueError('CPI source failed and the verified cache is too old') from error
        snapshot = build_snapshot(saved['sourceData'], verified_on)
        snapshot.update(sourceStatus='cached', lastAttemptAt=as_of.isoformat(),
                        cacheNote=f'Source check unavailable; showing the observation last verified {verified_on.isoformat()}.')
        print(f'WARNING: India CPI source check failed ({type(error).__name__}: {error}); retaining verified dated data.', file=sys.stderr)
    temporary = target.with_suffix('.tmp')
    temporary.write_text(json.dumps(snapshot, ensure_ascii=False, indent=2) + '\n')
    temporary.replace(target)
    return snapshot


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--as-of', default=datetime.now(timezone.utc).date().isoformat())
    parser.add_argument('--allow-cached', action='store_true')
    args = parser.parse_args()
    result = refresh(TARGET, date.fromisoformat(args.as_of), args.allow_cached)
    row = result['indicators'][0]
    print(f"India headline CPI: {row['value']}% YoY, {row['period']}; {len(row['timeSeries'])} sourced readings; {result['sourceStatus']}")


if __name__ == '__main__':
    main()
