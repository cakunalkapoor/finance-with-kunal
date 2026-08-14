#!/usr/bin/env node
/**
 * Fetch euro-area indicators from the Eurostat dissemination API.
 *
 * No API key required. Docs:
 *   https://ec.europa.eu/eurostat/web/query-builder/api-statistics
 *
 * Series pulled (geo = EA21):
 *   - namq_10_gdp    Real GDP, chain-linked, seasonally+calendar adjusted →
 *                    quarter-over-quarter % change (CLV_PCH_PRE). Not annualised,
 *                    matching how the US and Canada GDP cards are stated.
 *   - prc_hicp_minr  HICP annual rate of change (RCH_A), all-items.
 *
 * Three things that are easy to get wrong here, all verified against the API:
 *
 *   1. The euro-area geo code is EA21. EA19/EA20 are earlier compositions and
 *      return an EMPTY result rather than an error, so a wrong code looks like
 *      a transient outage instead of a bug.
 *   2. HICP moved datasets with the Feb 2026 switch to ECOICOP ver.2. The old
 *      `prc_hicp_manr` still answers 200 but is frozen at 2025-12; the live
 *      dataset is `prc_hicp_minr`, whose classification dimension is
 *      `coicop18`, not `coicop`.
 *   3. Several euro-area series on FRED (unemployment, industrial production,
 *      trade) were discontinued in 2023 and likewise still return stale data
 *      happily. Eurostat is the live source for euro-area statistics.
 *
 * Writes: src/lib/eurostat-data.json  (consumed by patch-site-data.mjs)
 * Run:    npm run fetch:eurostat
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT = path.resolve(__dirname, "..", "..");
const OUT = path.join(PROJECT, "src", "lib", "eurostat-data.json");
const BASE =
  "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/";

const round2 = (n) =>
  n == null || !Number.isFinite(n) ? null : Math.round(n * 100) / 100;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const SERIES = [
  {
    key: "ea_gdp",
    dataset: "namq_10_gdp",
    label: "Euro Area GDP Growth",
    unit: "% QoQ",
    // 20 quarters: the 3Y chart window needs 36 months, and a quarterly series
    // needs >= 13 points to reach it.
    periods: 20,
    params: { s_adj: "SCA", unit: "CLV_PCH_PRE", na_item: "B1GQ" },
  },
  {
    key: "ea_hicp",
    dataset: "prc_hicp_minr",
    label: "Euro Area HICP Inflation",
    unit: "% YoY",
    periods: 37,
    params: { unit: "RCH_A", coicop18: "TOTAL" },
  },
];

/** "2026-Q2" → "2026-04"; monthly ids pass through unchanged. */
function normalisePeriod(id) {
  const q = id.match(/^(\d{4})-Q([1-4])$/);
  if (!q) return id;
  const month = (Number(q[2]) - 1) * 3 + 1;
  return `${q[1]}-${String(month).padStart(2, "0")}`;
}

async function fetchSeries(s) {
  const query = new URLSearchParams({
    ...s.params,
    format: "JSON",
    geo: "EA21",
    lastTimePeriod: String(s.periods),
  });
  const url = `${BASE}${s.dataset}?${query}`;
  let lastErr;
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const index = json?.dimension?.time?.category?.index ?? {};
      const byPosition = Object.fromEntries(
        Object.entries(index).map(([period, i]) => [i, period])
      );
      // JSON-stat omits missing cells entirely rather than emitting null, so a
      // period present in the time index may still have no observation — the
      // euro-area aggregate often trails its member states by a few weeks.
      const values = json?.value ?? {};
      const points = Object.entries(values)
        .map(([i, value]) => ({
          date: normalisePeriod(byPosition[Number(i)]),
          value: round2(Number(value)),
        }))
        .filter((p) => p.date && Number.isFinite(p.value))
        .sort((a, b) => a.date.localeCompare(b.date));
      if (!points.length) throw new Error("no observations for EA21");
      return { points, updated: json?.updated ?? null };
    } catch (e) {
      lastErr = e;
      await sleep(700);
    }
  }
  throw lastErr;
}

function buildRecord(points) {
  const last = points[points.length - 1];
  const prev = points[points.length - 2];
  const change = prev ? round2(last.value - prev.value) : 0;
  return {
    value: last.value,
    previousValue: prev ? prev.value : null,
    change,
    direction: change > 0 ? "up" : change < 0 ? "down" : "neutral",
    asOf: last.date,
    timeSeries: points,
  };
}

async function main() {
  console.log("Fetching from Eurostat (euro area, EA21)...\n");
  const macro = {};
  for (const s of SERIES) {
    process.stdout.write(`  ${s.dataset.padEnd(16)} ${s.label.padEnd(26)} `);
    try {
      const { points, updated } = await fetchSeries(s);
      const record = buildRecord(points);
      macro[s.key] = { ...record, unit: s.unit, label: s.label };
      console.log(
        `${String(record.value).padStart(7)}  asOf ${record.asOf}  ${String(points.length).padStart(2)}pts  (Eurostat updated ${String(updated).slice(0, 10)})`
      );
    } catch (e) {
      console.log(`✗ ${e.message}`);
    }
    await sleep(300);
  }

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(
    OUT,
    JSON.stringify(
      {
        fetchedAt: new Date().toISOString(),
        source: "Eurostat dissemination API",
        macro,
      },
      null,
      2
    )
  );
  console.log(
    `\n✓ wrote ${path.relative(PROJECT, OUT)}  ·  ${Object.keys(macro).length}/${SERIES.length} series`
  );
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
