import importlib.util
import json
import pathlib
import unittest

PATH = pathlib.Path(__file__).resolve().parents[1] / 'src/lib/fetch-international.py'
spec = importlib.util.spec_from_file_location('international', PATH)
source = importlib.util.module_from_spec(spec)
spec.loader.exec_module(source)

class InternationalSources(unittest.TestCase):
    def test_reporting_periods_retain_quarters_and_months(self):
        self.assertEqual(source.period_date('2026-Q2'), '2026-04')
        self.assertEqual(source.period_date('20262Q00'), '2026-04')
        self.assertEqual(source.period_date('2026 SEP'), '2026-09')
        self.assertEqual(source.period_date('20260800'), '2026-08')

    def test_missing_values_are_not_zero_and_conflicting_duplicates_fail(self):
        self.assertEqual(source.finite_points([('2026-01', None), ('2026-02', ':'), ('2026-03', 0)]), [{'date':'2026-03','value':0}])
        with self.assertRaises(ValueError): source.finite_points([('2026-01',1), ('2026-01',2)])
        with self.assertRaises(ValueError): source.finite_points([('2026-01','NaN')])

    def test_unfiltered_or_missing_eurostat_dimension_cannot_mix_series(self):
        for size in [0, 2]:
            with self.assertRaises(ValueError):
                source.parse_eurostat({'id':['geo','time'], 'size':[size,2]})
        result=source.parse_eurostat({'id':['geo','time'],'size':[1,2], 'dimension':{'time':{'category':{'index':{'2026-01':0,'2026-02':1}}}},'value':{'1':0}})
        self.assertEqual(result,[{'date':'2026-02','value':0}])

    def test_abs_published_precision_controls_previous_and_current_values(self):
        raw='TIME_PERIOD,OBS_VALUE\n2026-08,4.71834873\n2026-09,4.731234\n'
        self.assertEqual(source.parse_csv(raw,decimals=1),[{'date':'2026-08','value':4.7},{'date':'2026-09','value':4.7}])

    def test_snapshot_endpoints_dates_deltas_and_sources_reconcile(self):
        snapshot=json.loads(PATH.with_name('international-economy-data.json').read_text())
        self.assertEqual(len(snapshot['indicators']),17)
        self.assertEqual(len({r['id'] for r in snapshot['indicators']}),17)
        for row in snapshot['indicators']:
            points=row['timeSeries']; dates=[p['date'] for p in points]
            self.assertEqual(dates,sorted(set(dates)))
            self.assertEqual(row['value'],points[-1]['value'])
            self.assertEqual(row['previousValue'],points[-2]['value'])
            self.assertAlmostEqual(row['change'],round(row['value']-row['previousValue'],2))
            self.assertTrue(row['sourceUrl'].startswith('https://'))
            self.assertTrue(row['context'])
        australia=next(r for r in snapshot['indicators'] if r['id']=='au-cpi')
        self.assertEqual(australia['timeSeries'][-1]['date'],'2026-08')
        germany=next(r for r in snapshot['indicators'] if r['id']=='de-gdp')
        self.assertIn('provisional',germany['observationLabels'][germany['timeSeries'][-1]['date']])

if __name__ == '__main__': unittest.main()
