/** Derive changes against an exact calendar month, never an array offset.
 * Missing releases stay missing: neither interpolate nor substitute another month.
 * Return unrounded results so each provider rounds once at its stated precision.
 */
export function calendarChanges(observations, months, { difference = false } = {}) {
  if (!Number.isInteger(months) || months < 1) throw new Error("Expected a positive month interval");
  const byMonth = new Map();
  for (const point of observations) {
    if (point.value == null || point.value === "" || !Number.isFinite(Number(point.value))) continue;
    const month = point.date.slice(0, 7);
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) throw new Error(`Invalid month: ${point.date}`);
    const value = Number(point.value);
    if (byMonth.has(month) && byMonth.get(month) !== value) throw new Error(`Conflicting observations: ${month}`);
    byMonth.set(month, value);
  }
  const result = [];
  for (const [date, value] of [...byMonth].sort(([a], [b]) => a.localeCompare(b))) {
    const [year, month] = date.split("-").map(Number);
    const anchor = year * 12 + month - 1 - months;
    const key = `${Math.floor(anchor / 12)}-${String(anchor % 12 + 1).padStart(2, "0")}`;
    const baseline = byMonth.get(key);
    if (baseline == null || (!difference && baseline === 0)) continue;
    result.push({ date, value: difference ? value - baseline : (value / baseline - 1) * 100 });
  }
  return result;
}

/** Keep each month's last actual observation, including its original date. */
export function monthlyLastObservations(observations, asOf = "9999-12-31") {
  const months = new Map();
  for (const point of [...observations].sort((a, b) => a.date.localeCompare(b.date))) {
    if (point.date <= asOf && point.value != null && Number.isFinite(point.value)) months.set(point.date.slice(0, 7), point);
  }
  return [...months.values()];
}
