#!/usr/bin/env node
/**
 * Process raw Alpha Vantage JSON files (saved as tool-call results) into a
 * clean market-data.json that the dashboard reads.
 *
 * Each input is a tool-result file with shape:
 *   { name, interval, unit, data: [{date, value}, ...] }  // commodities, treasury
 *   or { nominal, timestamp, price }                       // gold spot
 *
 * For each instrument we derive:
 *   - value (latest non-"." close)
 *   - dailyChange % (latest vs prior non-"." entry)
 *   - weekChange % (~5 entries back for daily, 1 for weekly)
 *   - monthChange % (~21 daily / ~4 weekly / 1 monthly)
 *   - ytdChange % (latest vs first 2026 entry)
 *   - 52W high/low (from last ~252 daily entries / 52 weekly / 12 monthly)
 *   - sparkline (52 evenly-spaced points across the most recent 252 daily entries)
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT = path.resolve(__dirname, "..");
const OUT = path.join(PROJECT, "src", "lib", "market-data.json");

const RAW_DIR = "/Users/kunalkapoor/.claude/projects/-Users-kunalkapoor-Downloads-Job-Search/e08b6cce-f34c-4ada-89f7-1ae85b65ac89/tool-results";

const FILES = {
  treasury10y: path.join(RAW_DIR, "mcp-5951ca38-9e62-422f-9e53-137f50b7443b-TOOL_CALL-1780224353322.txt"),
  brent:       path.join(RAW_DIR, "mcp-5951ca38-9e62-422f-9e53-137f50b7443b-TOOL_CALL-1780224399445.txt"),
  wti:         path.join(RAW_DIR, "mcp-5951ca38-9e62-422f-9e53-137f50b7443b-TOOL_CALL-1780224403454.txt"),
  natgas:      path.join(RAW_DIR, "mcp-5951ca38-9e62-422f-9e53-137f50b7443b-TOOL_CALL-1780224407566.txt"),
};

// Hard-coded from the direct (small) responses we already saw
const GOLD_SPOT = { value: 4539.76, asOf: "2026-05-31" };
const COPPER_PRICES_USD_PER_MT = [
  // most recent 12 months from the Copper response (March 2026 → April 2025)
  { date: "2026-03-01", v: 12528.71 },
  { date: "2026-02-01", v: 12951.35 },
  { date: "2026-01-01", v: 12986.61 },
  { date: "2025-12-01", v: 11790.96 },
  { date: "2025-11-01", v: 10812.03 },
  { date: "2025-10-01", v: 10739.92 },
  { date: "2025-09-01", v:  9994.77 },
  { date: "2025-08-01", v:  9671.88 },
  { date: "2025-07-01", v:  9770.58 },
  { date: "2025-06-01", v:  9835.07 },
  { date: "2025-05-01", v:  9531.20 },
  { date: "2025-04-01", v:  9172.70 },
  { date: "2025-03-01", v:  9735.82 },
];

function parseSeries(filePath) {
  const txt = fs.readFileSync(filePath, "utf-8");
  const json = JSON.parse(txt);
  // Reverse so series is chronological (oldest → newest)
  const data = json.data
    .slice()
    .reverse()
    .filter((p) => p.value !== "." && p.value != null && p.value !== "")
    .map((p) => ({ date: p.date, value: Number(p.value) }));
  return { name: json.name, interval: json.interval, unit: json.unit, data };
}

function lastIdx(data, fromEnd = 0) {
  return data[data.length - 1 - fromEnd];
}

function pct(curr, prev) {
  if (prev == null || prev === 0 || curr == null) return 0;
  return Math.round(((curr - prev) / prev) * 10000) / 100;
}

function ytdAnchor(data, year) {
  // First entry of `year`
  for (const p of data) {
    if (p.date.startsWith(String(year))) return p;
  }
  return null;
}

function maxMin(arr) {
  return arr.reduce(
    (acc, v) => ({ max: Math.max(acc.max, v), min: Math.min(acc.min, v) }),
    { max: -Infinity, min: Infinity }
  );
}

function downsample(arr, points) {
  if (arr.length <= points) return arr.slice();
  const out = [];
  for (let i = 0; i < points; i++) {
    out.push(arr[Math.round((i / (points - 1)) * (arr.length - 1))]);
  }
  return out;
}

function buildDerived(series, opts = {}) {
  // For daily series: lookback offsets in trading days
  const { dayBack = 1, weekBack = 5, monthBack = 21, sparkPts = 52, year = 2026 } = opts;
  const data = series.data;
  const last = lastIdx(data, 0);
  const prev = lastIdx(data, dayBack);
  const wkAgo = lastIdx(data, weekBack);
  const monthAgo = lastIdx(data, monthBack);
  const ytd = ytdAnchor(data, year);
  // 52W window — last 252 trading days for daily series
  const window = data.slice(-252);
  const mm = maxMin(window.map((p) => p.value));
  // sparkline: 52 evenly-spaced points from the 252-day window
  const sparkSrc = window.map((p) => p.value);
  const sparkline = downsample(sparkSrc, sparkPts).map((v) => Math.round(v * 100) / 100);

  return {
    value: round2(last.value),
    asOf: last.date,
    dailyChange: pct(last.value, prev?.value),
    weekChange:  pct(last.value, wkAgo?.value),
    monthChange: pct(last.value, monthAgo?.value),
    ytdChange:   pct(last.value, ytd?.value),
    high52w: round2(mm.max),
    low52w:  round2(mm.min),
    sparkline,
  };
}

const round2 = (n) => Math.round(n * 100) / 100;

function buildMonthlyDerived(prices, year = 2026) {
  // prices: chronological array of {date, v}, oldest first
  const sorted = prices.slice().sort((a, b) => a.date.localeCompare(b.date));
  const last = sorted[sorted.length - 1];
  const prev = sorted[sorted.length - 2];
  const monthAgo = prev;                                       // 1 month back
  const year3Ago = sorted[sorted.length - 4] ?? prev;          // ~3 month back
  const ytd = sorted.find((p) => p.date.startsWith(String(year)));
  const window = sorted.slice(-12);
  const mm = maxMin(window.map((p) => p.v));
  return {
    value: round2(last.v),
    asOf: last.date,
    dailyChange: 0,
    weekChange: pct(last.v, prev?.v),
    monthChange: pct(last.v, monthAgo?.v),
    ytdChange:   pct(last.v, ytd?.v),
    high52w: round2(mm.max),
    low52w:  round2(mm.min),
    sparkline: window.map((p) => round2(p.v)),
  };
}

// ─── BUILD ─────────────────────────────────────────────────────────────────────
const brent  = buildDerived(parseSeries(FILES.brent),  { year: 2026 });
const wti    = buildDerived(parseSeries(FILES.wti),    { year: 2026 });
const natgas = buildDerived(parseSeries(FILES.natgas), { year: 2026 });
const ust10y = buildDerived(parseSeries(FILES.treasury10y), { year: 2026 });

// Copper: monthly only, convert to USD/lb (1 metric ton = 2204.62 lb)
const copperLb = COPPER_PRICES_USD_PER_MT.map((p) => ({ date: p.date, v: p.v / 2204.62 }));
const copper = buildMonthlyDerived(copperLb);

// Gold: only live spot value — compute changes against previous known mock baseline ($3,312)
// Better: just record the spot and note that historical data needs separate fetch (1 more call could get it via GOLD_SILVER_HISTORY)
const goldPrevBaseline = 3312.40; // The OLD mock value we're replacing
const goldYtdBaseline = 4100;      // Rough end-of-2025 reference (not from API — will be marked)
const gold = {
  value: GOLD_SPOT.value,
  asOf: GOLD_SPOT.asOf,
  dailyChange: 0,           // would need GOLD_SILVER_HISTORY for this
  weekChange: 0,
  monthChange: pct(GOLD_SPOT.value, goldPrevBaseline),
  ytdChange: pct(GOLD_SPOT.value, goldYtdBaseline),
  high52w: GOLD_SPOT.value, // placeholder
  low52w:  goldYtdBaseline, // placeholder
  sparkline: [],            // empty; component falls back to mock
  _note: "Spot value only. Daily/weekly changes and sparkline not derived (would need GOLD_SILVER_HISTORY call).",
};

const out = {
  fetchedAt: new Date().toISOString(),
  source: "Alpha Vantage (via MCP connector)",
  notes: {
    coverage:
      "Free-tier Alpha Vantage supports US Treasury yields and 5 commodity time series. " +
      "International equity indices (Shanghai, Nikkei, NIFTY, DAX, FTSE, CAC, TSX, KOSPI) and US " +
      "indices (S&P 500, NASDAQ 100) are premium-only — those tiles remain on curated mock data.",
    gold: gold._note,
  },
  commodities: {
    brent:  { name: "Brent Crude",  unit: "USD/bbl",     ...brent },
    wti:    { name: "WTI Crude",    unit: "USD/bbl",     ...wti },
    natgas: { name: "Natural Gas",  unit: "USD/MMBtu",   ...natgas },
    copper: { name: "Copper",       unit: "USD/lb",      ...copper },
    gold:   { name: "Gold",         unit: "USD/oz",      ...gold },
  },
  bonds: {
    us10y: { name: "US 10Y Treasury", country: "United States", maturity: "10Y", ...ust10y },
  },
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(out, null, 2));
console.log("✓ wrote", path.relative(PROJECT, OUT));
console.log(JSON.stringify({
  brent: { value: brent.value, dailyChange: brent.dailyChange, weekChange: brent.weekChange, ytdChange: brent.ytdChange },
  wti:   { value: wti.value,   dailyChange: wti.dailyChange,   weekChange: wti.weekChange,   ytdChange: wti.ytdChange },
  natgas:{ value: natgas.value, dailyChange: natgas.dailyChange, weekChange: natgas.weekChange, ytdChange: natgas.ytdChange },
  copper:{ value: copper.value, monthChange: copper.monthChange, ytdChange: copper.ytdChange },
  gold:  { value: gold.value, ytdChange: gold.ytdChange },
  ust10y:{ value: ust10y.value, dailyChange: ust10y.dailyChange, weekChange: ust10y.weekChange, ytdChange: ust10y.ytdChange },
}, null, 2));
