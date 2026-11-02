import copy
import importlib.util
import json
import tempfile
import unittest
from datetime import date, timedelta
from pathlib import Path

PATH = Path(__file__).resolve().parents[1] / 'src/lib/fetch-india-cpi.py'
SPEC = importlib.util.spec_from_file_location('india_cpi', PATH)
source = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(source)


def current_sample():
    common = dict(base_year='2024', series='Current', state='All India', sector='Combined',
                  division='CPI (General)', group=None, **{'class': None, 'sub_class': None, 'item': None})
    return [{**common, 'year': year, 'month': month, 'index': index, 'inflation': inflation}
            for year, month, index, inflation in [
                ('2025', 'August', '103.74', None), ('2025', 'September', '103.74', None),
                ('2026', 'August', '108.74', '4.83'), ('2026', 'September', '109.49', '5.54')]]


class IndiaCPI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.snapshot = json.loads(PATH.with_name('india-cpi-data.json').read_text())
        cls.reviewed = date.fromisoformat(cls.snapshot['reviewedAt'])

    def test_official_headline_field_is_used_without_inventing_transition_year_inflation(self):
        points = source.parse_rows(current_sample(), '2024', date(2026, 11, 2))
        self.assertEqual(points, [{'date': '2026-08', 'value': 4.83}, {'date': '2026-09', 'value': 5.54}])

    def test_geography_sector_basket_and_subgroups_cannot_be_mixed(self):
        for field, value in [('base_year', '2012'), ('state', 'Maharashtra'), ('sector', 'Rural'),
                             ('division', 'Food and beverages'), ('group', 'Food'), ('item', 'Rice')]:
            rows = current_sample()
            rows[-1][field] = value
            with self.subTest(field=field), self.assertRaises(ValueError):
                source.parse_rows(rows, '2024', date(2026, 11, 2))

    def test_duplicates_nulls_nonfinite_rates_and_unit_errors_are_rejected(self):
        cases = []
        rows = current_sample(); rows.append(copy.deepcopy(rows[-1])); cases.append(rows)
        for value in [None, 'NaN', '55.4', '0.0554']:
            rows = current_sample(); rows[-1]['inflation'] = value; cases.append(rows)
        for rows in cases:
            with self.subTest(value=rows[-1].get('inflation')), self.assertRaises(ValueError):
                source.parse_rows(rows, '2024', date(2026, 11, 2))

    def test_future_observations_and_incomplete_monthly_history_are_rejected(self):
        rows = current_sample(); rows[-1]['year'] = '2027'
        with self.assertRaises(ValueError):
            source.parse_rows(rows, '2024', date(2026, 11, 2))
        data = copy.deepcopy(self.snapshot['sourceData'])
        data['2012'] = [row for row in data['2012'] if not (row['year'] == 2025 and row['month'] == 'June')]
        with self.assertRaisesRegex(ValueError, 'Missing or duplicate'):
            source.build_snapshot(data, self.reviewed)

    def test_saved_snapshot_reconciles_with_its_sources_and_has_three_full_years(self):
        rebuilt = source.build_snapshot(self.snapshot['sourceData'], self.reviewed)
        self.assertEqual(rebuilt['indicators'], self.snapshot['indicators'])
        row = rebuilt['indicators'][0]
        self.assertEqual(len(row['timeSeries']), 48)
        source.validate_history(row['timeSeries'])
        self.assertEqual(row['value'], row['timeSeries'][-1]['value'])
        self.assertEqual(row['previousValue'], row['timeSeries'][-2]['value'])
        self.assertAlmostEqual(row['change'], row['value'] - row['previousValue'])
        self.assertEqual(row['seriesBreaks'][0]['date'], '2026-01')
        self.assertIn('not a constant-basket', row['description'])

    def test_network_failure_preserves_the_successful_review_date_and_values(self):
        def unavailable(*args):
            raise OSError('temporary upstream outage')
        with tempfile.TemporaryDirectory() as folder:
            target = Path(folder) / 'snapshot.json'
            target.write_text(json.dumps(self.snapshot))
            refreshed = source.refresh(target, self.reviewed + timedelta(days=1), True, unavailable)
            self.assertEqual(refreshed['reviewedAt'], self.snapshot['reviewedAt'])
            self.assertEqual(refreshed['sourceStatus'], 'cached')
            self.assertEqual(refreshed['indicators'], self.snapshot['indicators'])
            self.assertIn(self.snapshot['reviewedAt'], refreshed['cacheNote'])
            previous = target.read_bytes()
            with self.assertRaisesRegex(ValueError, 'too old'):
                source.refresh(target, self.reviewed + timedelta(days=46), True, unavailable)
            self.assertEqual(target.read_bytes(), previous)

    def test_invalid_new_data_cannot_overwrite_the_verified_snapshot(self):
        def incomplete(base, as_of):
            rows = copy.deepcopy(self.snapshot['sourceData'][base])
            rows[0]['sector'] = 'Rural'
            return rows
        with tempfile.TemporaryDirectory() as folder:
            target = Path(folder) / 'snapshot.json'
            target.write_text(json.dumps(self.snapshot))
            previous = target.read_bytes()
            with self.assertRaises(ValueError):
                source.refresh(target, self.reviewed, False, incomplete)
            self.assertEqual(target.read_bytes(), previous)

    def test_secondary_official_transport_and_complete_pagination(self):
        def unavailable(filters):
            raise OSError('MCP temporarily unavailable')
        def secondary(filters):
            return dict(statusCode=True, data=[{'page': filters['page']}],
                        meta_data=dict(page=filters['page'], totalRecords=2, totalPages=2))
        rows = source.fetch_data('2024', date(2026, 11, 2), unavailable, secondary)
        self.assertEqual(rows, [{'page': 1}, {'page': 2}])
        def incomplete(filters):
            return dict(statusCode=True, data=[], meta_data=dict(page=1, totalRecords=2, totalPages=1))
        with self.assertRaisesRegex(ValueError, 'Incomplete'):
            source.fetch_data('2024', date(2026, 11, 2), incomplete, secondary)

    def test_release_calendar_and_streamable_http_envelope(self):
        self.assertEqual(source.expected_period(date(2026, 11, 2)), '2026-09')
        self.assertEqual(source.expected_period(date(2026, 11, 16)), '2026-10')
        self.assertEqual(source.expected_period(date(2027, 1, 2)), '2026-11')
        result = source.read_json_response(b'event: message\r\ndata: {"id":1,"result":{"data":[]}}\r\n\r\n')
        self.assertEqual(result['result']['data'], [])


if __name__ == '__main__':
    unittest.main()
