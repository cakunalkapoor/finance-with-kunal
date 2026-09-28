// Keep calendar months attached while combining providers. Missing observations
// remain gaps; a new headline must never shift an old observation into a new month.
export function monthlyHistory(trend = [], asOf) {
  if (!asOf) return [];
  const end = new Date(`${asOf}T00:00:00Z`);
  return trend.map((value, i) => ({
    date: new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth() - trend.length + 1 + i, 1)).toISOString().slice(0, 10),
    value,
  }));
}

export function mergeMonthlyHistory(asOf, ...histories) {
  const months = new Map();
  for (const history of histories) {
    for (const point of [...history].sort((a, b) => a.date.localeCompare(b.date))) {
      if (point.date <= asOf && Number.isFinite(point.value)) months.set(point.date.slice(0, 7), point.value);
    }
  }
  return monthlyHistory(Array(36).fill(null), asOf).map(p => months.get(p.date.slice(0, 7)) ?? null);
}

export function periodMoves(observations, cadence = "daily") {
  const rows = [...observations].filter(p => Number.isFinite(p.value)).sort((a, b) => b.date.localeCompare(a.date));
  const latest = rows[0];
  if (!latest || cadence !== "daily") return { dailyMove: null, oneMonthMove: null, oneYearMove: null };
  const end = new Date(`${latest.date}T00:00:00Z`);
  const delta = (anchor, target) => {
    if (!anchor || (target - Date.parse(anchor.date)) / 86400000 > 7) return null;
    return Math.round((latest.value - anchor.value) * 10000) / 10000;
  };
  const prior = (months) => {
    const lastDay = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth() - months + 1, 0)).getUTCDate();
    const target = Date.UTC(end.getUTCFullYear(), end.getUTCMonth() - months, Math.min(end.getUTCDate(), lastDay));
    return delta(rows.find(p => Date.parse(p.date) <= target), target);
  };
  return { dailyMove: delta(rows[1], end.getTime()), oneMonthMove: prior(1), oneYearMove: prior(12) };
}
