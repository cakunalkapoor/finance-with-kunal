#!/usr/bin/env node
/**
 * Fetch daily sovereign 10Y bond yields.
 *
 * Priority chain per country (first source that returns data wins):
 *  1. Nasdaq Data Link (Quandl)  — daily, broad coverage
 *  2. Yahoo Finance internal API — daily, US only (^TNX confirmed working)
 *  3. ECB Data Warehouse         — daily, Germany only (euro-area AAA proxy)
 *
 * FRED is intentionally excluded — its international series are monthly and stale.
 *
 * Run:    npm run fetch:bonds
 * Output: src/lib/bonds-data.json
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT   = path.resolve(__dirname, "..", "..");
const OUT       = path.join(PROJECT, "src", "lib", "bonds-data.json");

const env        = fs.readFileSync(path.join(PROJECT, ".env.local"), "utf-8");
const QUANDL_KEY = env.match(/^QUANDL_API_KEY=(.+)$/m)?.[1]?.trim() ?? "";
const FRED_KEY   = env.match(/^FRED_API_KEY=(.+)$/m)?.[1]?.trim() ?? "";

// ── FRED (monthly fallback for emerging markets) ─────────────────────────────
async function fred(seriesId) {
  const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${FRED_KEY}&file_type=json&observation_start=2024-01-01&sort_order=desc`;
  const res  = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) return null;
  const json = await res.json();
  return (json?.observations ?? [])
    .filter(o => o.value !== ".")
    .map(o => ({ date: o.date, value: parseFloat(o.value) }));
}

// ── Quandl / Nasdaq Data Link ─────────────────────────────────────────────────
async function quandl(db, ds, column = null) {
  const url = `https://data.nasdaq.com/api/v3/datasets/${db}/${ds}/data.json?rows=300&order=desc&api_key=${QUANDL_KEY}`;
  const res  = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) return null;
  const json = await res.json();
  const cols = json?.dataset_data?.column_names ?? [];
  const rows = json?.dataset_data?.data         ?? [];
  if (!rows.length) return null;
  const colIdx = column ? cols.indexOf(column) : 1;
  if (colIdx < 0) return null;
  return rows
    .filter(r => r[colIdx] != null)
    .map(r => ({ date: String(r[0]), value: parseFloat(r[colIdx]) }));
}

// ── Yahoo Finance internal chart API ─────────────────────────────────────────
async function yahoo(symbol) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1y`;
  const res  = await fetch(url, {
    signal: AbortSignal.timeout(10000),
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  if (!res.ok) return null;
  const json   = await res.json();
  const result = json?.chart?.result?.[0];
  if (!result) return null;
  const timestamps = result.timestamp ?? [];
  const closes     = result.indicators?.quote?.[0]?.close ?? [];
  const rows = timestamps
    .map((ts, i) => ({
      date:  new Date(ts * 1000).toISOString().slice(0, 10),
      value: closes[i],
    }))
    .filter(r => r.value != null)
    .reverse(); // newest first
  return rows.length ? rows : null;
}

// ── ECB Statistical Data Warehouse ───────────────────────────────────────────
// Euro-area AAA sovereign 10Y par yield — best daily proxy for German Bund
async function ecbEuroArea10Y() {
  const url = "https://data-api.ecb.europa.eu/service/data/YC/B.U2.EUR.4F.G_N_A.SV_C_YM.SR_10Y?lastNObservations=300&format=jsondata";
  const res  = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) return null;
  const json    = await res.json();
  const series  = json?.dataSets?.[0]?.series;
  const periods = json?.structure?.dimensions?.observation?.[0]?.values;
  if (!series || !periods) return null;
  const obs = Object.values(series)[0]?.observations ?? {};
  return Object.entries(obs)
    .map(([i, v]) => ({ date: periods[parseInt(i)]?.id, value: v[0] }))
    .filter(r => r.date && r.value != null)
    .sort((a, b) => b.date.localeCompare(a.date));
}

// ── Build bond object ─────────────────────────────────────────────────────────
function round3(n) { return Math.round(n * 1000) / 1000; }

function buildBond(rows, country, flag, source) {
  const latest  = rows[0];
  const day1    = rows[1]  ?? latest;
  const month1  = rows[Math.min(21, rows.length - 1)];
  const year1   = rows[Math.min(252, rows.length - 1)];

  // 12-point monthly trend: last value per calendar month
  const byMonth = {};
  for (const r of rows) {
    const ym = r.date.slice(0, 7);
    if (!byMonth[ym]) byMonth[ym] = r.value;
  }
  const trend = Object.values(byMonth).slice(0, 12).reverse();

  return {
    country,
    flag,
    maturity:     "10Y",
    source,
    yield:        round3(latest.value),
    asOf:         latest.date,
    dailyMove:    round3(latest.value - day1.value),
    oneMonthMove: round3(latest.value - month1.value),
    oneYearMove:  round3(latest.value - year1.value),
    trend,
  };
}

// ── Country fetch plan ────────────────────────────────────────────────────────
const COUNTRIES = [
  {
    key: "us10y", country: "United States", flag: "🇺🇸",
    sources: [
      { label: "Quandl USTREASURY/YIELD",   fn: () => quandl("USTREASURY", "YIELD", "10 YR") },
      { label: "Yahoo Finance ^TNX",         fn: () => yahoo("^TNX") },
    ],
  },
  {
    key: "uk10y", country: "United Kingdom", flag: "🇬🇧",
    sources: [
      { label: "Quandl BOE/IUDMNZC",        fn: () => quandl("BOE", "IUDMNZC") },
      { label: "Quandl BOE/IUDMZZC",        fn: () => quandl("BOE", "IUDMZZC") },
    ],
  },
  {
    key: "de10y", country: "Germany", flag: "🇩🇪",
    sources: [
      { label: "Quandl BUNDESBANK WT1010",   fn: () => quandl("BUNDESBANK", "BBK01_WT1010") },
      { label: "ECB euro-area AAA 10Y",      fn: () => ecbEuroArea10Y() },
    ],
  },
  {
    key: "ca10y", country: "Canada", flag: "🇨🇦",
    sources: [
      { label: "Quandl BOC/V39051",          fn: () => quandl("BOC", "V39051") },
      { label: "Quandl BOC/V80691311",       fn: () => quandl("BOC", "V80691311") },
    ],
  },
  {
    key: "jp10y", country: "Japan", flag: "🇯🇵",
    sources: [
      { label: "Quandl MOFJ JGB 10Y",        fn: () => quandl("MOFJ", "INTEREST_RATE_JAPAN_GOVERNMENT_BOND_10Y") },
    ],
  },
  {
    key: "in10y", country: "India", flag: "🇮🇳",
    sources: [
      { label: "Quandl RBI GSEC 10Y",        fn: () => quandl("RBI", "FBIL_GSEC_10Y") },
      { label: "Quandl RBI/RB_10Y",          fn: () => quandl("RBI", "RB_10Y") },
    ],
  },
  {
    key: "kr10y", country: "South Korea", flag: "🇰🇷",
    sources: [
      { label: "Quandl OECD Korea 10Y",      fn: () => quandl("OECD", "KEI_IRLT_KOR_ST_M") },
      { label: "Quandl OECD Korea 2",        fn: () => quandl("OECD", "MEI_FIN_IRLT_KOR_M") },
    ],
  },
  {
    key: "au10y", country: "Australia", flag: "🇦🇺",
    sources: [
      { label: "Quandl RBA F2.1 10Y",        fn: () => quandl("RBA", "F02_1") },
      { label: "FRED IRLTLT01AUM156N",        fn: () => fred("IRLTLT01AUM156N") },
    ],
  },
  {
    key: "za10y", country: "South Africa", flag: "🇿🇦",
    sources: [
      { label: "Quandl SARB 10Y",            fn: () => quandl("SARB", "BAGOVR086") },
      { label: "FRED IRLTLT01ZAM156N",        fn: () => fred("IRLTLT01ZAM156N") },
    ],
  },
];

async function main() {
  console.log("Fetching sovereign 10Y bond yields (Quandl → Yahoo → ECB)...\n");
  const bonds = {};

  for (const { key, country, flag, sources } of COUNTRIES) {
    process.stdout.write(`  ${country.padEnd(18)} `);
    let found = false;
    for (const { label, fn } of sources) {
      try {
        const rows = await fn();
        if (rows?.length) {
          const bond = buildBond(rows, country, flag, label);
          bonds[key] = bond;
          process.stdout.write(`✓ [${label}]  ${bond.yield.toFixed(3)}%  (${bond.asOf})\n`);
          found = true;
          break;
        }
      } catch (e) { /* try next */ }
      await new Promise(r => setTimeout(r, 300));
    }
    if (!found) process.stdout.write("✗ no source returned data\n");
  }

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify({
    fetchedAt: new Date().toISOString(),
    bonds,
  }, null, 2));

  const n = Object.keys(bonds).length;
  console.log(`\n✓ wrote ${path.relative(PROJECT, OUT)}  (${n}/${COUNTRIES.length} countries)`);
  if (n < COUNTRIES.length) {
    console.log("  Some countries failed — Quandl WAF may be blocking this IP.");
    console.log("  Run 'npm run fetch:bonds' from a different network or VPN to retry.");
  }
}

main().catch(e => { console.error(e); process.exit(1); });
