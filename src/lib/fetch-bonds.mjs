#!/usr/bin/env node
/**
 * Fetch sovereign 10Y bond yields — daily where a free source exists.
 *
 * Sources, all keyless except the FRED fallback:
 *   US    Yahoo Finance ^TNX            daily
 *   CA    Bank of Canada Valet          daily
 *   DE    ECB Data Warehouse            daily (euro-area AAA 10Y par yield)
 *   JP    Japan MoF JGB CSV             daily
 *   UK/IN/KR/AU/ZA  FRED (OECD)         MONTHLY — see note below
 *
 * Nasdaq Data Link (Quandl) was the original first choice for every country but
 * now returns nothing for all nine — its WAF blocks us and several of the
 * referenced datasets are retired. It has been removed rather than left in as
 * nine pairs of guaranteed-failing calls.
 *
 * KNOWN GAP — UK, India, South Korea have no free DAILY source we can use:
 *   • UK   the BoE's free daily series (IUDSNPY) is a *nominal par* yield that
 *          runs ~50bp below the benchmark redemption yield the site quotes and
 *          links to, so adopting it would introduce a visible level error.
 *          The DMO's D4H export returns HTML, not CSV.
 *   • IN   neither RBI nor FBIL publishes a free daily G-sec yield API.
 *   • KR   Bank of Korea ECOS is free but requires a registered API key.
 * These three stay on FRED's monthly OECD series and will read 1-3 months old.
 * That lag is now surfaced in the UI via each bond's `asOf`, so a stale number
 * is visible rather than silently wrong.
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

const env      = fs.readFileSync(path.join(PROJECT, ".env.local"), "utf-8");
const FRED_KEY = env.match(/^FRED_API_KEY=(.+)$/m)?.[1]?.trim() ?? "";

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

// ── Japan Ministry of Finance — daily JGB yields ─────────────────────────────
// Shift-JIS CSV, full history since 1974. Columns are 基準日,1年,2年,…,10年,…
// so the 10Y yield is field index 10. Dates use Japanese era notation:
// R8.8.6 = Reiwa 8 = 2026-08-06 (Reiwa 1 = 2019, i.e. year = 2018 + n).
const JP_ERA_BASE = { R: 2018, H: 1988, S: 1925 };

async function mofJapan10Y() {
  // Two files: the all-history archive is only refreshed monthly, so on its own
  // it lags by up to a month. jgbcm.csv carries the CURRENT month, updated daily.
  // Fetch both and let the current-month rows win.
  const [current, archive] = await Promise.all([
    mofCsv("https://www.mof.go.jp/jgbs/reference/interest_rate/jgbcm.csv"),
    mofCsv("https://www.mof.go.jp/jgbs/reference/interest_rate/data/jgbcm_all.csv"),
  ]);
  if (!current && !archive) return null;

  const byDate = new Map();
  for (const r of archive ?? []) byDate.set(r.date, r.value);
  for (const r of current ?? []) byDate.set(r.date, r.value); // current month wins

  const rows = [...byDate].map(([date, value]) => ({ date, value }));
  if (!rows.length) return null;
  rows.sort((a, b) => b.date.localeCompare(a.date)); // newest first
  return rows.slice(0, 400);
}

async function mofCsv(url) {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(20000),
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  if (!res.ok) return null;
  const csv = new TextDecoder("shift-jis").decode(await res.arrayBuffer());

  const rows = [];
  for (const line of csv.split(/\r?\n/)) {
    const f = line.split(",");
    const m = /^([RHS])(\d+)\.(\d+)\.(\d+)$/.exec(f[0]?.trim() ?? "");
    if (!m) continue;                       // header / blank / preamble
    const raw = f[10]?.trim();              // 10年 column
    if (!raw || raw === "-") continue;      // no auction that day
    const value = parseFloat(raw);
    if (!Number.isFinite(value)) continue;
    const year = JP_ERA_BASE[m[1]] + Number(m[2]);
    const date = `${year}-${m[3].padStart(2, "0")}-${m[4].padStart(2, "0")}`;
    rows.push({ date, value });
  }
  return rows.length ? rows : null;
}

// ── Bank of Canada Valet — daily GoC benchmark 10Y ───────────────────────────
async function bocCanada10Y() {
  const url = "https://www.bankofcanada.ca/valet/observations/BD.CDN.10YR.DQ.YLD/json?recent=400";
  const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) return null;
  const json = await res.json();
  const rows = (json?.observations ?? [])
    .map(o => ({ date: o.d, value: parseFloat(o["BD.CDN.10YR.DQ.YLD"]?.v) }))
    .filter(r => r.date && Number.isFinite(r.value))
    .sort((a, b) => b.date.localeCompare(a.date)); // Valet returns oldest-first
  return rows.length ? rows : null;
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

function buildBond(rows, country, flag, source, cadence = "daily") {
  // Row spacing depends on the series: ~21 trading days per month for a daily
  // feed, but exactly 1 row per month for FRED's monthly OECD series. Using the
  // daily offsets on a monthly series silently reported a 21-MONTH change as
  // the 1-month move (Australia read +0.909 that way).
  const perMonth = cadence === "monthly" ? 1  : 21;
  const perYear  = cadence === "monthly" ? 12 : 252;

  const latest  = rows[0];
  const day1    = rows[1]  ?? latest;
  const month1  = rows[Math.min(perMonth, rows.length - 1)];
  const year1   = rows[Math.min(perYear,  rows.length - 1)];

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
    cadence,
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
    key: "us10y", country: "United States", flag: "🇺🇸", cadence: "daily",
    sources: [
      { label: "Yahoo Finance ^TNX",          fn: () => yahoo("^TNX") },
      { label: "FRED DGS10",                  fn: () => fred("DGS10") },
    ],
  },
  {
    key: "ca10y", country: "Canada", flag: "🇨🇦", cadence: "daily",
    sources: [
      { label: "BoC Valet BD.CDN.10YR.DQ.YLD", fn: () => bocCanada10Y() },
    ],
  },
  {
    key: "de10y", country: "Germany", flag: "🇩🇪", cadence: "daily",
    sources: [
      { label: "ECB euro-area AAA 10Y",       fn: () => ecbEuroArea10Y() },
    ],
  },
  {
    key: "jp10y", country: "Japan", flag: "🇯🇵", cadence: "daily",
    sources: [
      { label: "Japan MoF JGB 10Y",           fn: () => mofJapan10Y() },
      { label: "FRED IRLTLT01JPM156N",        fn: () => fred("IRLTLT01JPM156N") },
    ],
  },
  // ── No free daily source available; monthly OECD via FRED. See header note. ──
  {
    key: "uk10y", country: "United Kingdom", flag: "🇬🇧", cadence: "monthly",
    sources: [{ label: "FRED IRLTLT01GBM156N", fn: () => fred("IRLTLT01GBM156N") }],
  },
  {
    key: "in10y", country: "India", flag: "🇮🇳", cadence: "monthly",
    sources: [{ label: "FRED INDIRLTLT01STM",  fn: () => fred("INDIRLTLT01STM") }],
  },
  {
    key: "kr10y", country: "South Korea", flag: "🇰🇷", cadence: "monthly",
    sources: [{ label: "FRED IRLTLT01KRM156N", fn: () => fred("IRLTLT01KRM156N") }],
  },
  {
    key: "au10y", country: "Australia", flag: "🇦🇺", cadence: "monthly",
    sources: [{ label: "FRED IRLTLT01AUM156N", fn: () => fred("IRLTLT01AUM156N") }],
  },
  {
    key: "za10y", country: "South Africa", flag: "🇿🇦", cadence: "monthly",
    sources: [{ label: "FRED IRLTLT01ZAM156N", fn: () => fred("IRLTLT01ZAM156N") }],
  },
];

async function main() {
  console.log("Fetching sovereign 10Y bond yields (Yahoo · BoC · ECB · MoF · FRED)...\n");
  const bonds = {};
  const failed = [];

  for (const { key, country, flag, sources, cadence } of COUNTRIES) {
    process.stdout.write(`  ${country.padEnd(18)} `);
    let found = false;
    for (const { label, fn } of sources) {
      try {
        const rows = await fn();
        if (rows?.length) {
          const bond = buildBond(rows, country, flag, label, cadence);
          bonds[key] = bond;
          process.stdout.write(`✓ ${cadence.padEnd(7)} [${label}]  ${bond.yield.toFixed(3)}%  (${bond.asOf})\n`);
          found = true;
          break;
        }
      } catch { /* try next */ }
      await new Promise(r => setTimeout(r, 300));
    }
    if (!found) {
      failed.push(country);
      process.stdout.write("✗ no source returned data\n");
    }
  }

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify({
    fetchedAt: new Date().toISOString(),
    bonds,
  }, null, 2));

  const n = Object.keys(bonds).length;
  const daily = Object.values(bonds).filter(b => b.cadence === "daily").length;
  console.log(`\n✓ wrote ${path.relative(PROJECT, OUT)}  (${n}/${COUNTRIES.length} countries · ${daily} daily)`);
  if (failed.length) {
    console.log(`  Failed: ${failed.join(", ")} — the card keeps its previous value.`);
    process.exitCode = 1;
  }
}

main().catch(e => { console.error(e); process.exit(1); });
