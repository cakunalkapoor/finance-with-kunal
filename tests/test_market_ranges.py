import sys
import unittest
from datetime import date, timedelta
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "src/lib"))
from market_ranges import closing_range_52w


class ClosingRangeTests(unittest.TestCase):
    def test_crypto_includes_older_extreme_beyond_252_observations(self):
        end = date(2026, 10, 24)
        rows = [(end - timedelta(days=i), 100) for i in range(500)]
        rows[300] = (end - timedelta(days=300), 250)
        rows[364] = (end - timedelta(days=364), 50)
        rows[365] = (end - timedelta(days=365), 1000)
        self.assertEqual(closing_range_52w(rows), {"low": 50, "high": 250, "asOf": "2026-10-24"})

    def test_exchange_sessions_use_the_same_calendar_window(self):
        end = date(2026, 10, 23)
        rows = [(end - timedelta(days=i), i) for i in range(500) if (end - timedelta(days=i)).weekday() < 5]
        self.assertEqual(closing_range_52w(rows), {"low": 0, "high": 364, "asOf": "2026-10-23"})

    def test_short_crypto_history_is_not_a_52_week_range(self):
        end = date(2026, 10, 24)
        self.assertIsNone(closing_range_52w([(end - timedelta(days=i), 100) for i in range(252)]))

    def test_monthly_snapshots_do_not_establish_daily_extremes(self):
        end = date(2026, 10, 24)
        self.assertIsNone(closing_range_52w([(end - timedelta(days=i * 30), 100) for i in range(24)]))

    def test_missing_values_and_duplicate_dates_do_not_create_coverage(self):
        self.assertIsNone(closing_range_52w([("2026-10-23", 5)] * 300 + [("bad", 2), ("2026-10-22", float("nan"))]))


if __name__ == "__main__":
    unittest.main()
