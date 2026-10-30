import importlib.util
import sys
import unittest
from pathlib import Path

import pandas as pd

LIB = Path(__file__).resolve().parents[1] / "src/lib"
sys.path.insert(0, str(LIB))
spec = importlib.util.spec_from_file_location("fetch_yahoo", LIB / "fetch-yahoo.py")
yahoo = importlib.util.module_from_spec(spec)
spec.loader.exec_module(yahoo)


class DatedWeeklyHistoryTests(unittest.TestCase):
    def test_weekly_points_keep_the_actual_session_in_a_holiday_week(self):
        dates = pd.bdate_range("2026-03-23", "2026-05-08").difference(pd.DatetimeIndex(["2026-05-01"]))
        history = pd.DataFrame({"Close": range(100, 100 + len(dates))}, index=dates)
        result = yahoo.derive(history)
        source = {date.strftime("%Y-%m-%d"): float(value) for date, value in history.Close.items()}
        self.assertTrue(all(source[p["date"]] == p["value"] for p in result["weeklyHistory"]))
        self.assertIn("2026-04-30", [p["date"] for p in result["weeklyHistory"]])
        self.assertNotIn("2026-05-01", [p["date"] for p in result["weeklyHistory"]])
        self.assertEqual(result["sparkline"], [p["value"] for p in result["weeklyHistory"]])

    def test_partial_week_cannot_be_assigned_a_future_friday(self):
        dates = pd.bdate_range("2026-09-01", "2026-10-29")
        result = yahoo.derive(pd.DataFrame({"Close": range(100, 100 + len(dates))}, index=dates))
        self.assertEqual(result["weeklyHistory"][-1], {"date": "2026-10-29", "value": result["value"]})


if __name__ == "__main__":
    unittest.main()
