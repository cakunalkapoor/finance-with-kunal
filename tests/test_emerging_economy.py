import importlib.util
import json
import pathlib
import unittest

PATH = pathlib.Path(__file__).resolve().parents[1] / 'src/lib/fetch-emerging.py'
spec = importlib.util.spec_from_file_location('emerging', PATH)
source = importlib.util.module_from_spec(spec)
spec.loader.exec_module(source)


class EmergingSources(unittest.TestCase):
    def test_missing_values_and_conflicting_dates_cannot_create_observations(self):
        self.assertEqual(source.points([('2026-01', None), ('2026-02', '.'), ('2026-03', 0)]), [{'date': '2026-03', 'value': 0}])
        for values in [[('2026-01', 1), ('2026-01', 2)], [('2026-13', 1)], [('2026-01', 'NaN')]]:
            with self.assertRaises(ValueError):
                source.points(values)

    def test_brazil_requires_national_gdp_and_the_exact_growth_basis(self):
        feed = next(row for row in source.feed_specs('2026-10-30') if row['id'] == 'br-gdp')
        record = {'D1C': '1', 'D2C': '6561', 'D3C': '202602', 'D4C': '90707', 'MN': '%', 'V': '2.0'}
        self.assertEqual(source.parse_sidra(json.dumps([{}, record]), feed), [{'date': '2026-04', 'value': 2.0}])
        for key, wrong in [('D1C', '35'), ('D2C', '6562'), ('D4C', '123'), ('MN', 'Pessoas')]:
            with self.assertRaises(ValueError):
                source.parse_sidra(json.dumps([{}, {**record, key: wrong}]), feed)

    def test_malaysian_sector_and_monthly_inflation_are_not_headline_annual_inflation(self):
        feed = next(row for row in source.feed_specs('2026-10-30') if row['id'] == 'my-cpi')
        raw = 'date,division,inflation_yoy,inflation_mom\n2026-08-01,overall,1.9,0.3\n2026-09-01,01,8.0,0.5\n2026-09-01,overall,1.8,0.1\n'
        self.assertEqual(source.parse_csv(raw, feed), [{'date': '2026-08', 'value': 1.9}, {'date': '2026-09', 'value': 1.8}])

    def test_rolling_period_labels_preserve_year_boundaries(self):
        self.assertEqual(source.rolling_label('2026-09'), 'Jul–Sep 2026 (3-month average)')
        self.assertEqual(source.rolling_label('2026-01'), 'Nov 2025–Jan 2026 (3-month average)')

    def test_stale_future_and_nonadjacent_comparisons_are_rejected(self):
        feed = next(row for row in source.feed_specs('2026-10-30') if row['id'] == 'my-cpi')
        for observations in [
            [{'date': '2024-01', 'value': 1}, {'date': '2024-02', 'value': 2}],
            [{'date': '2026-10', 'value': 1}, {'date': '2026-11', 'value': 2}],
            [{'date': '2026-07', 'value': 1}, {'date': '2026-09', 'value': 2}],
        ]:
            with self.assertRaises(ValueError):
                source.build_indicator(feed, observations, '2026-10-30')

    def test_requested_country_coverage_keeps_the_unverified_labour_gap_explicit(self):
        snapshot = json.loads(PATH.with_name('emerging-economy-data.json').read_text())
        self.assertEqual(len(snapshot['indicators']), 20)
        self.assertEqual(len({row['id'] for row in snapshot['indicators']}), 20)
        countries = {'Vietnam', 'Indonesia', 'Bangladesh', 'Malaysia', 'Brazil', 'Mexico', 'Chile'}
        self.assertEqual({row['country'] for row in snapshot['indicators']}, countries)
        for country in countries:
            categories = {row['category'] for row in snapshot['indicators'] if row['country'] == country}
            self.assertEqual(categories, {'growth', 'inflation'} if country == 'Bangladesh' else {'growth', 'inflation', 'employment'})
        self.assertEqual(snapshot['unavailable'][0]['country'], 'Bangladesh')
        self.assertEqual(snapshot['unavailable'][0]['measure'], 'unemployment')
        reviewed = json.loads(PATH.with_name('emerging-economy-reviewed.json').read_text())
        by_id = {row['id']: row for row in snapshot['indicators']}
        for release in reviewed['indicators']:
            rebuilt = source.build_indicator(release, source.points((point['date'], point['value']) for point in release['observations']), reviewed['reviewedAt'])
            self.assertEqual(rebuilt, by_id[release['id']])
        for row in snapshot['indicators']:
            points = row['timeSeries']
            self.assertEqual([p['date'] for p in points], sorted({p['date'] for p in points}))
            self.assertEqual(row['value'], points[-1]['value'])
            self.assertEqual(row['previousValue'], points[-2]['value'])
            self.assertAlmostEqual(row['change'], row['value'] - row['previousValue'])
            self.assertTrue(row['sourceUrl'].startswith('https://'))
            if 'apiUrl' not in row:
                self.assertTrue(row['sourceReferences'])
                self.assertTrue(row['historyNote'])
        fiscal = next(row for row in snapshot['indicators'] if row['id'] == 'bd-gdp')
        self.assertIn('Q3 FY2025–26', fiscal['period'])
        brazil = next(row for row in snapshot['indicators'] if row['id'] == 'br-unemployment')
        self.assertIn('3-month average', brazil['period'])


if __name__ == '__main__':
    unittest.main()
