/** @typedef {{date: string, value: number}} PricePoint */
const DAY = 86400000;

/** Validate daily observations without evaluating feed content.
 * @param {PricePoint[]} observations */
function dailyPrices(observations) {
  const dates = new Map();
  for (const point of observations) {
    const stamp = Date.parse(`${point.date}T00:00:00Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(point.date) || !Number.isFinite(stamp)
      || new Date(stamp).toISOString().slice(0, 10) !== point.date
      || !Number.isFinite(point.value) || point.value <= 0) throw new Error("Invalid OPEC daily observation");
    if (dates.has(point.date) && dates.get(point.date) !== point.value) throw new Error(`Conflicting OPEC prices for ${point.date}`);
    dates.set(point.date, point.value);
  }
  return [...dates].map(([date, value]) => ({ date, value })).sort((a, b) => a.date.localeCompare(b.date));
}

/** Accept the official BasketList export and the legacy Date.UTC chart feed.
 * @param {string} text @param {string} asOf */
export function parseOpecPrices(text, asOf) {
  /** @type {PricePoint[]} */
  const rows = [];
  const tags = [...text.matchAll(/<BasketList\b([^>]*)\/?\s*>/g)];
  if (tags.length) {
    for (const tag of tags) {
      const date = /\bdata=["']([^"']+)["']/.exec(tag[1])?.[1];
      const value = /\bval=["']([^"']+)["']/.exec(tag[1])?.[1];
      rows.push({ date: date ?? "", value: Number(value) });
    }
  } else {
    for (const m of text.matchAll(/\[Date\.UTC\((\d{4}),\s*(\d{1,2}),\s*(\d{1,2})\),\s*([\d.]+)\]/g)) {
      rows.push({ date: `${m[1]}-${String(Number(m[2]) + 1).padStart(2, "0")}-${m[3].padStart(2, "0")}`, value: Number(m[4]) });
    }
  }
  return dailyPrices(rows).filter(point => point.date <= asOf);
}

/** @param {PricePoint[]} observations */
export function opecSnapshot(observations) {
  const rows = dailyPrices(observations);
  const latest = rows.at(-1);
  if (!latest) throw new Error("OPEC daily history is empty");
  const end = Date.parse(`${latest.date}T00:00:00Z`);
  const start = end - 52 * 7 * DAY;
  const range = rows.filter(point => Date.parse(point.date) >= start);
  if (Date.parse(rows[0].date) > start + 7 * DAY || range.length < 200) throw new Error("OPEC daily history cannot establish a full 52-week range");
  const anchor = (target) => {
    const point = rows.findLast(point => Date.parse(point.date) <= target);
    if (!point || target - Date.parse(point.date) > 7 * DAY) throw new Error("OPEC period comparison lacks a dated anchor");
    return point;
  };
  const pct = (point) => (latest.value / point.value - 1) * 100;
  const date = new Date(end);
  const year = date.getUTCFullYear(), month = date.getUTCMonth();
  const monthDay = Math.min(date.getUTCDate(), new Date(Date.UTC(year, month, 0)).getUTCDate());
  return {
    asOf: latest.date, value: latest.value,
    dailyChange: pct(anchor(end - DAY)),
    weekChange: pct(anchor(end - 7 * DAY)),
    monthChange: pct(anchor(Date.UTC(year, month - 1, monthDay))),
    ytdChange: pct(anchor(Date.UTC(year, 0, 1) - DAY)),
    high52w: Math.max(...range.map(point => point.value)),
    low52w: Math.min(...range.map(point => point.value)),
  };
}
