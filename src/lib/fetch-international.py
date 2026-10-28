#!/usr/bin/env python3
"""Refresh the reviewed international economy supplement from official public APIs.

Run: python3 src/lib/fetch-international.py --reviewed-on YYYY-MM-DD
The ABS CPI release cap is deliberately reviewed separately from its observation
month: September 2026 was not due for publication until October 28.
Writes atomically only after every configured series passes validation.
"""
import argparse
import csv
import io
import json
import math
import pathlib
import re
import urllib.request
from datetime import date, datetime

ROOT = pathlib.Path(__file__).resolve().parent
JAPAN_CREDIT = ('This service uses the API feature of Statistics Dashboard, but the contents '
                'of this service are not guaranteed by the Statistics Bureau of Japan.')


def period_date(value):
    q = re.fullmatch(r'(\d{4})[- ]?Q([1-4])', value)
    if q:
        return f'{q[1]}-{(int(q[2])-1)*3+1:02d}'
    jq = re.fullmatch(r'(\d{4})([1-4])Q00', value)
    if jq:
        return f'{jq[1]}-{(int(jq[2])-1)*3+1:02d}'
    if re.fullmatch(r'\d{8}', value):
        return value[:4]+'-'+value[4:6]
    if re.fullmatch(r'\d{4} [A-Z]{3}', value):
        return datetime.strptime(value, '%Y %b').strftime('%Y-%m')
    return value[:7]


def finite_points(rows, decimals=2):
    result = {}
    for raw_date, value in rows:
        if value in (None, '', '.', ':'):
            continue
        number = float(value)
        if not math.isfinite(number):
            raise ValueError('non-finite observation')
        key = period_date(raw_date)
        date.fromisoformat(key+'-01')
        if key in result and result[key] != round(number, decimals):
            raise ValueError('conflicting duplicate observation '+key)
        result[key] = round(number, decimals)
    return [{'date': k, 'value': result[k]} for k in sorted(result)]


def parse_ons(data, quarterly=False):
    rows = data['quarters' if quarterly else 'months']
    return finite_points((p['date'], p['value']) for p in rows)


def parse_eurostat(data):
    # Require one selected series: an unfiltered dimension would silently mix countries.
    if any(size != 1 for key, size in zip(data['id'], data['size']) if key != 'time'):
        raise ValueError('Eurostat query must resolve to exactly one series')
    positions = {int(v): k for k, v in data['dimension']['time']['category']['index'].items()}
    return finite_points((positions[int(i)], value) for i, value in data['value'].items())


def parse_japan(data):
    stats = data['GET_STATS']
    if stats['RESULT']['status'] != '0':
        raise ValueError(stats['RESULT'].get('errorMsg', 'Japan API error'))
    rows = stats['STATISTICAL_DATA']['DATA_INF']['DATA_OBJ']
    return finite_points((r['VALUE']['@time'], r['VALUE']['$']) for r in rows)


def parse_csv(body, value_key=None, decimals=2):
    rows = list(csv.DictReader(io.StringIO(body)))
    if not rows:
        raise ValueError('empty CSV')
    return finite_points(((r.get('TIME_PERIOD', r.get('observation_date', r.get('DATE'))),
                           r[value_key or 'OBS_VALUE']) for r in rows), decimals)


def source(kind, url, **extra):
    return dict(kind=kind, url=url, **extra)


def definitions(reviewed):
    ons='https://www.ons.gov.uk/'
    euro='https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/'
    absbase='https://data.api.abs.gov.au/rest/data/'
    jp='https://dashboard.e-stat.go.jp/api/1.0/Json/getData?Lang=EN&RegionalRank=2&RegionCode=00000&MetaGetFlg=Y&SectionHeaderFlg=1'
    rows=[]
    def add(id, country, flag, name, category, unit, definition, src, context):
        rows.append(dict(id=id,country=country,flag=flag,name=name,category=category,unit=unit,
                         definition=definition,source=src,context=context))
    for id, series, dataset, path, cat, unit, definition, context in [
        ('uk-gdp','ihyq','qna','economy/grossdomesticproductgdp','growth','% QoQ','Real GDP, chain-volume measure, seasonally adjusted; quarterly growth, not annualized.', 'Quarterly real growth measures output momentum. It is not annualized, so compare its basis before comparing it with the US GDP headline.'),
        ('uk-cpi','d7g7','mm23','economy/inflationandpriceindices','inflation','% YoY','All-items CPI, percentage change over 12 months; not seasonally adjusted.', 'This is annual consumer-price inflation, not the monthly price change. A lower rate means slower price increases, not necessarily falling prices.'),
        ('uk-unemployment','mgsx','lms','employmentandlabourmarket/peoplenotinwork/unemployment','employment','%','ILO unemployment rate, age 16+, seasonally adjusted, rolling three-month average. The API dates observations by the middle month of each window.', 'The labour-market reading is a rolling three-month estimate, so it should not be treated as a single-month rate. Overlapping windows smooth short-term changes.')]:
        u=f'{ons}{path}/timeseries/{series}/{dataset}/data'
        add(id,'United Kingdom','🇬🇧','UK '+('Real GDP growth' if cat=='growth' else 'Consumer inflation (CPI)' if cat=='inflation' else 'Unemployment rate'),cat,unit,definition,source('ons',u,quarterly=cat=='growth'),' '.join([context]))
    for code,country,flag,prefix in [('DE','Germany','🇩🇪','de'),('FR','France','🇫🇷','fr')]:
        for suffix,name,cat,unit,dataset,params,definition,context in [
            ('gdp','Real GDP growth','growth','% QoQ','namq_10_gdp','s_adj=SCA&unit=CLV_PCH_PRE&na_item=B1GQ&lastTimePeriod=16','Chain-linked real GDP, seasonally and calendar adjusted, quarterly growth; not annualized.','Real quarterly GDP tracks output rather than prices. Compare this non-annualized growth rate with other countries on the same basis.'),
            ('hicp','Consumer inflation (HICP)','inflation','% YoY','prc_hicp_minr','unit=RCH_A&coicop18=TOTAL&lastTimePeriod=37','All-items harmonised consumer-price inflation, COICOP 2018; annual rate of change. HICP is not the national CPI.','HICP provides a harmonised European measure of consumer-price inflation. Its coverage and weights can differ from the national CPI.'),
            ('unemployment','Unemployment rate','employment','%','une_rt_m','sex=T&age=TOTAL&unit=PC_ACT&s_adj=SA&lastTimePeriod=37','Total unemployment rate, both sexes, seasonally adjusted, percentage of the labour force. Eurostat total covers ages 15–74.','This is the harmonised survey-based unemployment rate, rather than the count of people registered for unemployment benefits.')]:
            add(prefix+'-'+suffix,country,flag,country+' '+name,cat,unit,definition,source('eurostat',euro+dataset+'?format=JSON&geo='+code+'&'+params),context)
    for suffix,name,cat,unit,code,cycle,season,start,definition,context in [
        ('gdp','Real GDP growth','growth','% QoQ','0705020501000040000','2','2','20231Q00','Real expenditure GDP, 2020 base, seasonally adjusted quarterly percentage change; not annualized.','This is quarterly real GDP growth on a non-annualized basis. It measures output momentum rather than the annual pace often quoted in Japanese GDP headlines.'),
        ('cpi','Consumer inflation (CPI)','inflation','% YoY','0703010601010030000','1','1','20230100','All-items consumer price inflation, 2025 base, change from the same month a year earlier; original series.','All-items inflation includes fresh food and energy. It should not be confused with Japan’s commonly quoted CPI excluding fresh food.'),
        ('unemployment','Unemployment rate','employment','%','0301010000020020010','1','2','20230100','Unemployment rate, both sexes, seasonally adjusted, monthly Labour Force Survey.','The seasonally adjusted unemployment rate helps distinguish labour-market changes from recurring seasonal patterns.')]:
        add('jp-'+suffix,'Japan','🇯🇵','Japan '+name,cat,unit,definition+' '+JAPAN_CREDIT,source('japan',jp+f'&IndicatorCode={code}&Cycle={cycle}&IsSeasonalAdjustment={season}&TimeFrom={start}'),context)
    for suffix,name,cat,unit,query,definition,context,decimals in [
        ('gdp','Real GDP growth','growth','% QoQ','ANA_AGG/M2.GPM.20.AUS.Q?startPeriod=2022-Q3&format=csv','Real GDP, chain volume measures, seasonally adjusted quarterly percentage change; not annualized.','Quarterly real GDP measures the change in Australian output. The non-annualized basis differs from the US headline convention.',1),
        ('cpi','Consumer inflation (CPI)','inflation','% YoY','CPI/3.10001.10.50.M?startPeriod=2023-01&endPeriod=2026-08&format=csv','All-groups monthly CPI annual percentage change, weighted average of eight capital cities, original series. August is the latest included release: September CPI was scheduled for October 28, after this review.','This is monthly all-groups inflation. Earlier observations include the monthly CPI indicator; the move to the complete monthly CPI in late 2025 is a measurement change to bear in mind when reading the history.',1),
        ('unemployment','Unemployment rate','employment','%','LF/M13.3.1599.20.AUS.M?startPeriod=2023-01&format=csv','Unemployment rate, persons age 15+, Australia, seasonally adjusted monthly Labour Force Survey; rounded to the published one decimal place.','Use the seasonally adjusted reading to assess labour-market direction. Small monthly changes can reflect sampling variability as well as changes in employment conditions.',1)]:
        add('au-'+suffix,'Australia','🇦🇺','Australia '+name,cat,unit,definition,source('abs',absbase+query,decimals=decimals),context)
    for suffix,name,cat,unit,series,definition,context in [
        ('gdp','Real GDP growth','growth','% QoQ','NAEXKP01KRQ657S','Real GDP, expenditure approach, seasonally adjusted quarterly growth; not annualized. OECD Main Economic Indicators, retrieved through FRED.','This series measures real quarterly output growth. OECD/FRED can lag the Bank of Korea’s newest release; retain the observation date when comparing it with the manufacturing survey.'),
        ('unemployment','Unemployment rate','employment','%','LRHUTTTTKRM156S','Unemployment rate, total age 15+, seasonally adjusted. OECD Infra-Annual Labour Statistics, retrieved through FRED.','The harmonised unemployment rate supports international comparisons, with a reporting lag relative to Statistics Korea’s national release. It measures a different part of the economy from manufacturing PMI.')]:
        add('kr-'+suffix,'South Korea','🇰🇷','South Korea '+name,cat,unit,definition,source('fred',f'https://fred.stlouisfed.org/graph/fredgraph.csv?id={series}&cosd=2022-10-01&coed={reviewed}',series=series),context)
    return rows


def fetch_text(url):
    request=urllib.request.Request(url,headers={'User-Agent':'Finance with Kunal economic data refresh'})
    with urllib.request.urlopen(request,timeout=40) as response:
        return response.read().decode('utf-8-sig')


def build_indicator(spec, raw, reviewed):
    src=spec['source']; kind=src['kind']; data=None; labels={}
    if kind in ['ons','japan','eurostat']:
        data=json.loads(raw)
    if kind=='ons':
        points=parse_ons(data,src.get('quarterly',False))
        if spec['id']=='uk-unemployment':
            labels={period_date(r['date']):r['label']+' (3-month average)' for r in data['months']}
    elif kind=='japan':points=parse_japan(data)
    elif kind=='eurostat':
        points=parse_eurostat(data)
        periods={int(v): k for k,v in data['dimension']['time']['category']['index'].items()}
        for position, flag in data.get('status',{}).items():
            if 'p' not in flag:
                continue
            raw_period=periods[int(position)]; key=period_date(raw_period)
            label=f'Q{raw_period[-1]} {raw_period[:4]}' if '-Q' in raw_period else datetime.strptime(key,'%Y-%m').strftime('%b %Y')
            labels[key]=label+' (provisional)'
    else:points=parse_csv(raw,src.get('series'),src.get('decimals',2))
    points=[p for p in points if '2022-10'<=p['date']<=reviewed[:7]]
    if len(points)<2:raise ValueError(spec['id']+': less than two observations')
    last,prev=points[-1],points[-2]
    # A discontinued mirror must never silently become the current headline.
    lag=(int(reviewed[:4])-int(last['date'][:4]))*12+int(reviewed[5:7])-int(last['date'][5:7])
    if lag>(9 if spec['category']=='growth' else 4):raise ValueError(spec['id']+': stale series')
    change=round(last['value']-prev['value'],2)
    source_url=src['url'].removesuffix('/data') if kind=='ons' else ('https://fred.stlouisfed.org/series/'+src['series'] if kind=='fred' else 'https://ec.europa.eu/eurostat/databrowser/view/'+('namq_10_gdp' if spec['category']=='growth' else 'prc_hicp_minr' if spec['category']=='inflation' else 'une_rt_m')+'/default/table?lang=en' if kind=='eurostat' else 'https://dashboard.e-stat.go.jp/en/' if kind=='japan' else 'https://www.abs.gov.au/statistics/'+('economy/national-accounts/australian-national-accounts-national-income-expenditure-and-product/latest-release' if spec['category']=='growth' else 'economy/price-indexes-and-inflation/consumer-price-index-australia/latest-release' if spec['category']=='inflation' else 'labour/employment-and-unemployment/labour-force-australia/latest-release'))
    provider={'ons':'Office for National Statistics','eurostat':'Eurostat','japan':'Statistics Bureau / Cabinet Office of Japan','abs':'Australian Bureau of Statistics','fred':'OECD Main Economic Indicators via FRED'}[kind]
    period=labels.get(last['date'],datetime.strptime(last['date'],'%Y-%m').strftime('%b %Y'))
    result={k:spec[k] for k in ['id','country','flag','name','category','unit','context']}
    result.update(value=last['value'],previousValue=prev['value'],change=change,direction='up' if change>0 else 'down' if change<0 else 'neutral',isPositiveGood=spec['category']=='growth',period=period,timeSeries=points,description=spec['definition']+' Source: '+provider+'. Reviewed '+reviewed+'.',sourceUrl=source_url,apiUrl=src['url'])
    if labels:result['observationLabels']={p['date']:labels[p['date']] for p in points if p['date'] in labels}
    return result


def main():
    parser=argparse.ArgumentParser();parser.add_argument('--reviewed-on',required=True)
    args=parser.parse_args();date.fromisoformat(args.reviewed_on)
    if args.reviewed_on!='2026-10-27':
        raise SystemExit('Review the ABS CPI publication cap before refreshing a new review date.')
    result=[]
    for spec in definitions(args.reviewed_on):
        raw=fetch_text(spec['source']['url'])
        indicator=build_indicator(spec,raw,args.reviewed_on);result.append(indicator)
        print(indicator['id'],indicator['period'],indicator['value'],len(indicator['timeSeries']),'observations')
    target=ROOT/'international-economy-data.json';temporary=target.with_suffix('.tmp')
    temporary.write_text(json.dumps({'reviewedAt':args.reviewed_on,'indicators':result},ensure_ascii=False,indent=2)+'\n')
    temporary.replace(target)
    print('Saved',len(result),'verified supplemental indicators')

if __name__=='__main__':main()
