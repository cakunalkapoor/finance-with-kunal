import { readFile, writeFile } from "node:fs/promises";
import { parseOpecPrices, opecSnapshot } from "./opec-history.mjs";

// OPEC's legacy chart feed contains Date.UTC expressions, not valid JSON.
// Parse its numeric records without evaluating remote JavaScript.
const path = new URL("./opec-data.json", import.meta.url);
const current = JSON.parse(await readFile(path, "utf8"));
const fileIndex = process.argv.indexOf("--file");
const inputFile = fileIndex >= 0 ? process.argv[fileIndex + 1] : null;
if (fileIndex >= 0 && !inputFile) throw new Error("--file requires an OPEC export path");
let text;
if (inputFile) text = await readFile(inputFile, "utf8");
else {
  const response = await fetch(current.source);
  if (!response.ok) throw new Error(`OPEC fetch failed: HTTP ${response.status}; saved prices unchanged`);
  text = await response.text();
}
const asOf = process.env.REFRESH_AS_OF ?? new Date().toISOString().slice(0, 10);
const observations = parseOpecPrices(text, asOf);
if (observations.length < 500) throw new Error("OPEC feed has insufficient history; saved prices unchanged");
if (observations.at(-1).date < current.timeSeries.at(-1).date) throw new Error("OPEC feed is older than the saved snapshot; saved prices unchanged");
opecSnapshot(observations); // Require full daily coverage and comparison anchors before writing.
const months = new Map();
for (const point of observations) months.set(point.date.slice(0, 7), point);
await writeFile(path, JSON.stringify({ ...current, supplement: null, refreshNote: null, reviewedAt: asOf,
  sourceLabel: inputFile ? "OPEC daily basket-price export supplied by the site owner" : "OPEC official daily basket-price feed",
  sourceUrl: "https://www.opec.org/opec-basket-price.html",
  dailyObservations: observations, timeSeries: [...months.values()],
}, null, 2) + "\n");
console.log(`OPEC: ${observations.length} daily prices and ${months.size} monthly snapshots through ${observations.at(-1).date}`);
