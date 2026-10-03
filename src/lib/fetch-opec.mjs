import { readFile, writeFile } from "node:fs/promises";

// OPEC's legacy chart feed contains Date.UTC expressions, not valid JSON.
// Parse its numeric records without evaluating remote JavaScript.
const path = new URL("./opec-data.json", import.meta.url);
const current = JSON.parse(await readFile(path, "utf8"));
const response = await fetch(current.source);
if (!response.ok) throw new Error(`OPEC fetch failed: HTTP ${response.status}; saved prices unchanged`);
const text = await response.text();
const asOf = process.env.REFRESH_AS_OF ?? new Date().toISOString().slice(0, 10);
const observations = [];
for (const match of text.matchAll(/\[Date\.UTC\((\d{4}),(\d{1,2}),(\d{1,2})\),([\d.]+)\]/g)) {
  const date = new Date(Date.UTC(+match[1], +match[2], +match[3])).toISOString().slice(0, 10);
  const value = Number(match[4]);
  if (date >= "2023-09-01" && date <= asOf && Number.isFinite(value) && value > 0) observations.push({ date, value });
}
observations.sort((a, b) => a.date.localeCompare(b.date));
if (observations.length < 500) throw new Error("OPEC feed has insufficient history; saved prices unchanged");
if (observations.at(-1).date < current.timeSeries.at(-1).date) throw new Error("OPEC feed is older than the saved snapshot; saved prices unchanged");
const months = new Map();
for (const point of observations) months.set(point.date.slice(0, 7), point);
await writeFile(path, JSON.stringify({ ...current, supplement: null, reviewedAt: asOf, timeSeries: [...months.values()] }, null, 2) + "\n");
console.log(`OPEC: ${months.size} monthly snapshots through ${observations.at(-1).date}`);
