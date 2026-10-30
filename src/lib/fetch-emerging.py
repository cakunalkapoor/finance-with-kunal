#!/usr/bin/env python3
"""Build the emerging-economy supplement from official feeds and reviewed releases.

python3 src/lib/fetch-emerging.py --reviewed-on 2026-10-30
Release-based observations must be reviewed again before advancing this date.
No credentials, interpolation, forecasts, annual proxies or sample data are used.
"""
import argparse
import calendar
import concurrent.futures
import csv
import io
import json
import math
import pathlib
import re
import subprocess
from datetime import date

ROOT = pathlib.Path(__file__).resolve().parent


def points(rows, decimals=2):
    result = {}
    for period, value in rows:
        if value in (None, '', '.', ':', '...', '-'):
            continue
        date.fromisoformat(period + '-01')
        number = round(float(value), decimals)
        if not math.isfinite(number):
            raise ValueError('Non-finite observation')
        if period in result and result[period] != number:
            raise ValueError('Conflicting observation: ' + period)
        result[period] = number
    return [{'date': key, 'value': value} for key, value in sorted(result.items())]


def rolling_label(period):
    year, month = map(int, period.split('-'))
    start = year * 12 + month - 3
    start_year, start_month = start // 12, start % 12 + 1
    first = calendar.month_abbr[start_month]
    if start_year != year:
        first += ' ' + str(start_year)
    return f'{first}–{calendar.month_abbr[month]} {year} (3-month average)'


def parse_csv(raw, spec):
    rows = list(csv.DictReader(io.StringIO(raw)))
    required = {spec['dateColumn'], spec['valueColumn'], *spec.get('select', {}).keys()}
    if not rows or not required.issubset(rows[0]):
        raise ValueError(spec['id'] + ': unexpected CSV schema')
    selected = [row for row in rows if all(row[key] == value for key, value in spec.get('select', {}).items())]
    return points(((row[spec['dateColumn']][:7], row[spec['valueColumn']]) for row in selected), spec.get('decimals', 2))


def parse_sidra(raw, spec):
    rows = json.loads(raw)
    if not isinstance(rows, list) or len(rows) < 2:
        raise ValueError(spec['id'] + ': empty SIDRA response')
    selected = []
    for row in rows[1:]:
        # Pin national geography, variable, unit and aggregate. Never silently
        # mix sector GDP, regional unemployment or a different growth basis.
        if row.get('D1C') != '1' or row.get('D2C') != spec['variable'] or row.get('MN') != '%':
            raise ValueError(spec['id'] + ': unexpected SIDRA measurement')
        if spec.get('aggregate') and row.get('D4C') != spec['aggregate']:
            raise ValueError(spec['id'] + ': unexpected SIDRA aggregate')
        key = row['D3C']
        if not re.fullmatch(r'\d{6}', key):
            raise ValueError('Invalid SIDRA period')
        month = (int(key[4:]) - 1) * 3 + 1 if spec['frequency'] == 'quarterly' else int(key[4:])
        selected.append((f'{key[:4]}-{month:02d}', row['V']))
    return points(selected, spec.get('decimals', 2))


def fetch(url):
    # HTTP/2 is unreliable on FRED in this environment. Public CSV/JSON
    # sources work with HTTP/1.1; bound both connection and total request time.
    result = subprocess.run(['curl', '--http1.1', '-fsSL', '--connect-timeout', '10',
                             '--max-time', '35', url], capture_output=True, timeout=40)
    if result.returncode:
        raise ValueError('Source download failed: ' + url)
    return result.stdout.decode('utf-8-sig')


def feed_specs(reviewed):
    common = {
        'gdp': ('Real GDP growth', 'growth', '% YoY'),
        'cpi': ('Consumer inflation (CPI)', 'inflation', '% YoY'),
        'unemployment': ('Unemployment rate', 'employment', '%'),
    }
    specs = []
    def add(prefix, country, flag, measure, **fields):
        name, category, unit = common[measure]
        specs.append(dict(id=prefix + '-' + measure, country=country, flag=flag,
                          name=country + ' ' + name, category=category, unit=unit))
        specs[-1].update(fields)
    for measure, filename, column, selection, definition, frequency in [
        ('gdp', 'gdp/gdp_qtr_real.csv', 'value', {'series': 'growth_yoy'},
         'Real GDP at constant 2015 prices, change from the same quarter a year earlier; not seasonally adjusted.', 'quarterly'),
        ('cpi', 'cpi/cpi_2d_inflation.csv', 'inflation_yoy', {'division': 'overall'},
         'National all-items CPI, percentage change from the same month a year earlier.', 'monthly'),
        ('unemployment', 'labour/lfs_month.csv', 'u_rate', {},
         'National Labour Force Survey unemployment rate, not seasonally adjusted. Population weights change from the 2010 Census to the 2020 Census from 2025, creating a potential break in the history.', 'monthly'),
    ]:
        catalog = {'gdp': 'gdp_qtr_real', 'cpi': 'cpi_headline_inflation', 'unemployment': 'lfs_month'}[measure]
        add('my', 'Malaysia', '🇲🇾', measure, kind='csv', frequency=frequency,
            dateColumn='date', valueColumn=column, select=selection, decimals=1,
            apiUrl='https://storage.dosm.gov.my/' + filename,
            sourceUrl='https://open.dosm.gov.my/data-catalogue/' + catalog,
            definition=definition, provider='Department of Statistics Malaysia; CC BY 4.0')
    for measure, table, variable, classification, aggregate, frequency, definition in [
        ('gdp', '5932', '6561', '11255', '90707', 'quarterly',
         'Real GDP at market prices, quarterly volume growth compared with the same quarter a year earlier; not seasonally adjusted. This is neither accumulated year-to-date nor rolling four-quarter growth.'),
        ('cpi', '7060', '2265', '315', '7169', 'monthly',
         'IPCA all-items consumer inflation, accumulated change over the preceding 12 months, national Brazil aggregate.'),
        ('unemployment', '6381', '4099', None, None, 'rolling',
         'National Continuous PNAD unemployment rate, people aged 14+, not seasonally adjusted. Each monthly release describes the three-month moving quarter ending in that month.'),
    ]:
        url = f'https://apisidra.ibge.gov.br/values/t/{table}/n1/all/v/{variable}/p/last%20{16 if frequency == "quarterly" else 37}'
        if classification:
            url += f'/c{classification}/{aggregate}'
        add('br', 'Brazil', '🇧🇷', measure, kind='sidra', frequency=frequency,
            variable=variable, aggregate=aggregate, apiUrl=url,
            sourceUrl='https://sidra.ibge.gov.br/tabela/' + table,
            definition=definition, provider='IBGE / SIDRA')
    add('mx', 'Mexico', '🇲🇽', 'gdp', kind='csv', frequency='quarterly', unit='% QoQ',
        dateColumn='observation_date', valueColumn='NAEXKP01MXQ657S', decimals=1,
        apiUrl='https://fred.stlouisfed.org/graph/fredgraph.csv?id=NAEXKP01MXQ657S&cosd=2022-10-01&coed=' + reviewed,
        sourceUrl='https://fred.stlouisfed.org/series/NAEXKP01MXQ657S', provider='OECD via FRED',
        definition='Real expenditure GDP, seasonally adjusted quarterly growth, not annualized; rounded to one decimal. This OECD/FRED mirror currently ends in Q2 2026 and can lag INEGI’s newer advance releases. Its quarterly basis differs from the annual growth rates in several other country panels.')
    return specs


def build_indicator(spec, observations, reviewed):
    retained = [p for p in observations if '2022-10' <= p['date'] <= reviewed[:7]]
    if len(retained) < 2:
        raise ValueError(spec['id'] + ': need at least two verified observations')
    last, previous = retained[-1], retained[-2]
    expected_months = 3 if spec['frequency'].startswith('quarterly') else 1
    interval = (int(last['date'][:4]) - int(previous['date'][:4])) * 12 + int(last['date'][5:7]) - int(previous['date'][5:7])
    if interval != expected_months:
        raise ValueError(spec['id'] + ': preceding reporting period is not verified')
    lag = (int(reviewed[:4]) - int(last['date'][:4])) * 12 + int(reviewed[5:7]) - int(last['date'][5:7])
    if lag > spec.get('maxLagMonths', 9 if spec['category'] == 'growth' else 4):
        raise ValueError(spec['id'] + ': stale observation')
    if any(p['date'] > reviewed[:7] for p in observations):
        raise ValueError(spec['id'] + ': future observation')
    labels = dict(spec.get('observationLabels', {}))
    if spec['frequency'] == 'rolling':
        labels.update({p['date']: rolling_label(p['date']) for p in retained})
    elif spec['frequency'] == 'quarterly':
        for p in retained:
            labels.setdefault(p['date'], f'Q{(int(p["date"][5:7]) - 1) // 3 + 1} {p["date"][:4]}')
    change = round(last['value'] - previous['value'], 2)
    result = {key: spec[key] for key in ['id', 'name', 'country', 'flag', 'category', 'unit']}
    month = int(last['date'][5:7])
    period = labels.get(last['date'], f'{calendar.month_abbr[month]} {last["date"][:4]}')
    context = spec.get('context') or {
        'growth': 'Real GDP growth measures output rather than price changes. Check the displayed annual or quarterly basis before comparing countries.',
        'inflation': 'This annual inflation rate compares consumer prices with the same month a year earlier. A lower rate means prices are rising more slowly; it does not necessarily mean prices fell.',
        'employment': 'This is a survey-based unemployment rate. Population coverage, seasonal adjustment and reference windows can differ between countries.',
    }[spec['category']]
    result.update(value=last['value'], previousValue=previous['value'], change=change,
                  direction='up' if change > 0 else 'down' if change < 0 else 'neutral',
                  isPositiveGood=spec['category'] == 'growth', period=period, timeSeries=retained,
                  context=context, sourceUrl=spec['sourceUrl'], reviewedAt=reviewed,
                  description=spec['definition'] + ' Source: ' + spec['provider'] + '. Reviewed ' + reviewed + '.')
    if spec.get('apiUrl'):
        result['apiUrl'] = spec['apiUrl']
    if labels:
        result['observationLabels'] = {p['date']: labels[p['date']] for p in retained if p['date'] in labels}
    if spec.get('sourceReferences'):
        result['sourceReferences'] = spec['sourceReferences']
    if spec.get('historyNote'):
        result['historyNote'] = spec['historyNote']
    return result


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--reviewed-on', required=True)
    args = parser.parse_args()
    date.fromisoformat(args.reviewed_on)
    releases = json.loads((ROOT / 'emerging-economy-reviewed.json').read_text())
    if releases['reviewedAt'] != args.reviewed_on:
        raise SystemExit('Review the curated official releases before advancing their review date.')
    def load(spec):
        raw = fetch(spec['apiUrl'])
        data = parse_sidra(raw, spec) if spec['kind'] == 'sidra' else parse_csv(raw, spec)
        return build_indicator(spec, data, args.reviewed_on)
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
        result = list(pool.map(load, feed_specs(args.reviewed_on)))
    for spec in releases['indicators']:
        for reference in spec['sourceReferences']:
            if reference.get('releaseDate', args.reviewed_on) > args.reviewed_on:
                raise ValueError('Unpublished release')
        result.append(build_indicator(spec, points((p['date'], p['value']) for p in spec['observations']), args.reviewed_on))
    if len({r['id'] for r in result}) != len(result):
        raise ValueError('Duplicate indicator identity')
    snapshot = dict(reviewedAt=args.reviewed_on, indicators=result, unavailable=releases['unavailable'])
    target = ROOT / 'emerging-economy-data.json'
    temporary = target.with_suffix('.tmp')
    temporary.write_text(json.dumps(snapshot, ensure_ascii=False, indent=2) + '\n')
    temporary.replace(target)
    for row in result:
        print(row['id'], row['period'], row['value'], len(row['timeSeries']), 'verified observations')


if __name__ == '__main__':
    main()
