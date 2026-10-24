"""Calendar-based closing ranges for daily market observations."""
from datetime import date, timedelta
from math import isfinite


def closing_range_52w(observations):
    """Return a full 52-week daily-close range, or None for sparse/short history.

    A calendar window works for both exchange sessions and seven-day crypto.
    The coverage checks reject monthly snapshots and recently listed assets.
    """
    rows = {}
    for stamp, value in observations:
        try:
            day = date.fromisoformat(str(stamp)[:10])
            number = float(value)
        except (TypeError, ValueError):
            continue
        if isfinite(number):
            rows[day] = number
    if not rows:
        return None
    end = max(rows)
    start = end - timedelta(weeks=52)
    window = {day: value for day, value in rows.items() if start <= day <= end}
    if min(rows) > start + timedelta(days=7) or len(window) < 200:
        return None
    return {"low": min(window.values()), "high": max(window.values()), "asOf": end.isoformat()}
