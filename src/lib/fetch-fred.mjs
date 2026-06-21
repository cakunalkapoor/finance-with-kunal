#!/usr/bin/env node
/**
 * Fetch macro indicators + foreign 10Y bond yields from FRED.
 *
 * API key is loaded from .env.local (gitignored). Get a free key at:
 *   https://fred.stlouisfed.org/docs/api/api_key.html
 *
 * Writes: src/lib/fred-data.json
 * Run:    npm run fetch:fred
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT = path.resolve(__dirname, "..", "..");
const OUT = path.join(PROJECT, "src", "lib", "fred-data.json");

// ── Load FRED_API_KEY from .env.local ──────────────────────────────────────────
function loadEnv() {
  const envPath = path.join(PROJECT, ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
loadEnv();
const API_KEY = process.env.FRED_API_KEY;
if (!API_KEY) {
  console.error("Missing FRED_API_KEY. Add it to .env.local:");
  console.error("  echo 'FRED_API_KEY=your_key_here' >> .env.local");
  process.exit(1);
}

// ── Series catalogue ───────────────────────────────────────────────────────────
const BONDS = [
  // key            FRED ID              country         flag   limit (months of history)
  { key: "us10y",   id: "DGS10",         country: "United States", flag: "🇺🇸", limit: 365, daily: true },
  { key: "ca10y",   id: "IRLTLT01CAM156N", country: "Canada",       flag: "🇨🇦", limit: 24 },
  { key: "de10y",   id: "IRLTLT01DEM156N", country: "Germany",      flag: "🇩🇪", limit: 24 },
  { key: "in10y",   id: "INDIRLTLT01STM",  country: "India",         flag: "🇮🇳", limit: 24 },
  { key: "jp10y",   id: "IRLTLT01JPM156N", country: "Japan",         flag: "🇯🇵", limit: 24 },
  { key: "kr10y",   id: "IRLTLT01KRM156N", country: "South Korea",   flag: "🇰🇷", limit: 24 },
  { key: "uk10y",   id: "IRLTLT01GBM156N", country: "United Kingdom",flag: "🇬🇧", limit: 24 },
  // China 10Y is NOT available in FRED (PBoC doesn't share with OECD).
];

const MACRO = [
  // US Unemployment Rate — monthly
  { key: "us_unemployment", id: "UNRATE",  limit: 24, label: "US Unemployment", unit: "%", positiveGood: false },
  // US Initial Jobless Claims — weekly
  { key: "us_jobless",      id: "ICSA",    limit: 52, label: "US Initial Jobless Claims", unit: "K", positiveGood: false, scale: 0.001 },
  // US Real GDP — quarterly (level $B)
  { key: "us_real_gdp",     id: "GDPC1",   limit: 12, label: "US Real GDP", unit: "USD B" },
  // US GDP growth (annualised quarterly %)
  { key: "us_gdp_growth",   id: "A191RL1Q225SBEA", limit: 12, label: "US GDP Growth", unit: "% QoQ", positiveGood: true },
  // US CPI All Items (1982-84=100) — monthly. We compute YoY % change.
  { key: "us_cpi_index",    id: "CPIAUCSL", limit: 30, label: "US CPI Index", unit: "Index" },
  // US PPI Final Demand (Nov 2009=100) — monthly. We compute YoY % change.
  { key: "us_ppi_index",    id: "PPIFIS",   limit: 30, label: "US PPI Index", unit: "Index" },

  // ── US & Canada dashboard series (added for the US & Canada page) ────────────
  // US Nonfarm Payrolls — monthly LEVEL in thousands. We emit month-over-month change.
  { key: "us_payrolls",     id: "PAYEMS",   limit: 25, label: "US Nonfarm Payrolls", unit: "K MoM", positiveGood: true, momChange: true },
  // US Effective Fed Funds Rate — monthly %
  { key: "us_fed_funds",    id: "FEDFUNDS", limit: 24, label: "US Fed Funds Rate", unit: "%", positiveGood: false },
  // US Trade Balance (goods + services) — monthly $M. Scale to $B.
  { key: "us_trade",        id: "BOPGSTB",  limit: 24, label: "US Trade Balance", unit: "USD B", positiveGood: true, scale: 0.001 },
  // US Federal Government current tax receipts — quarterly, $B (annualised).
  { key: "us_tax",          id: "W006RC1Q027SBEA", limit: 12, label: "US Federal Tax Receipts", unit: "USD B", positiveGood: true },
  // US Advance Retail Sales (Retail + Food Services) — monthly $M LEVEL. YoY % computed.
  { key: "us_retail",       id: "RSAFS",    limit: 40, label: "US Retail Sales", unit: "% YoY", positiveGood: true, yoy: true },

  // Canada Unemployment Rate — monthly %
  { key: "ca_unemployment", id: "LRUNTTTTCAM156S", limit: 24, label: "Canada Unemployment", unit: "%", positiveGood: false },
  // Canada Real GDP — already a quarterly QoQ growth %; pass through.
  { key: "ca_gdp_growth",   id: "NAEXKP01CAQ657S", limit: 12, label: "Canada GDP Growth", unit: "% QoQ", positiveGood: true },
  // Canada Employment Rate — monthly %
  { key: "ca_employment",   id: "LREM64TTCAM156S", limit: 24, label: "Canada Employment Rate", unit: "%", positiveGood: true },
  // Canada Net Trade (goods, national currency) — monthly. Scale to $B.
  { key: "ca_trade",        id: "XTNTVA01CAM664N", limit: 24, label: "Canada Trade Balance", unit: "CAD B", positiveGood: true, scale: 1e-9 },
  // NOTE: Canada CPI + policy rate come from Bank of Canada Valet (FRED's CA CPI/
  // policy-rate series lag badly). See scripts/fetch-boc.mjs.
];

// ── HTTP helpers ───────────────────────────────────────────────────────────────
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fredFetch(seriesId, limit) {
  const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${API_KEY}&file_type=json&sort_order=desc&limit=${limit}`;
  let lastErr;
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const res = await fetch(url);
      if (res.status === 429) {
        await sleep(800 * (attempt + 1));
        continue;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const j = await res.json();
      // Returned in descending date order — reverse to chronological
      const obs = (j.observations || [])
        .filter((o) => o.value !== "." && o.value != null && o.value !== "")
        .map((o) => ({ date: o.date, value: Number(o.value) }))
        .reverse();
      return obs;
    } catch (e) {
      lastErr = e;
      await sleep(600);
    }
  }
  throw lastErr;
}

// ── Derivations ────────────────────────────────────────────────────────────────
const round2 = (n) => (n == null || !Number.isFinite(n) ? null : Math.round(n * 100) / 100);
const pct = (a, b) => (b == null || b === 0 || a == null ? 0 : round2((a - b) / b * 100));

function deriveBond(obs) {
  if (obs.length === 0) return null;
  const last = obs[obs.length - 1];
  const prev = obs[obs.length - 2];
  // For monthly: ~1 month back = prev, 1 year back = 12 entries back
  const yearAgo = obs[obs.length - 13] ?? obs[0];
  const sparkPts = obs.slice(-12).map((o) => round2(o.value));
  return {
    value: round2(last.value),
    asOf: last.date,
    dailyMove: prev ? round2(last.value - prev.value) : 0,
    oneMonthMove: prev ? round2(last.value - prev.value) : 0,  // monthly cadence → daily == monthly
    oneYearMove: round2(last.value - yearAgo.value),
    trend: sparkPts,
  };
}

function deriveBondDaily(obs) {
  if (obs.length === 0) return null;
  const last = obs[obs.length - 1];
  const prev = obs[obs.length - 2];
  const monthAgo = obs[obs.length - 22] ?? obs[0];
  const yearAgo = obs[obs.length - 252] ?? obs[0];
  // 12-pt sparkline: sample evenly from the last 252 trading days
  const window = obs.slice(-252);
  const trend = [];
  for (let i = 0; i < 12; i++) {
    const idx = Math.round((i / 11) * (window.length - 1));
    trend.push(round2(window[idx].value));
  }
  return {
    value: round2(last.value),
    asOf: last.date,
    dailyMove: prev ? round2(last.value - prev.value) : 0,
    oneMonthMove: monthAgo ? round2(last.value - monthAgo.value) : 0,
    oneYearMove: yearAgo ? round2(last.value - yearAgo.value) : 0,
    trend,
  };
}

function deriveMacro(obs, scale = 1) {
  if (obs.length === 0) return null;
  const last = obs[obs.length - 1];
  const prev = obs[obs.length - 2];
  return {
    value: round2(last.value * scale),
    previousValue: prev ? round2(prev.value * scale) : null,
    change: prev ? round2((last.value - prev.value) * scale) : 0,
    direction: prev ? (last.value > prev.value ? "up" : last.value < prev.value ? "down" : "neutral") : "neutral",
    asOf: last.date,
    timeSeries: obs.map((o) => ({ date: o.date.slice(0, 7), value: round2(o.value * scale) })),
  };
}

function deriveMoMChange(obs, scale = 1) {
  // For LEVEL series (e.g. payrolls) we chart the month-over-month CHANGE.
  if (obs.length < 2) return null;
  const out = [];
  for (let i = 1; i < obs.length; i++) {
    out.push({ date: obs[i].date.slice(0, 7), value: round2((obs[i].value - obs[i - 1].value) * scale) });
  }
  const last = out[out.length - 1];
  const prev = out[out.length - 2];
  return {
    value: last.value,
    previousValue: prev?.value ?? null,
    change: prev ? round2(last.value - prev.value) : 0,
    direction: prev ? (last.value > prev.value ? "up" : last.value < prev.value ? "down" : "neutral") : "neutral",
    asOf: obs[obs.length - 1].date,
    timeSeries: out,
  };
}

function deriveCPI_YoY(obs) {
  // CPIAUCSL is an index level. Compute YoY % change from last 13 months.
  if (obs.length < 13) return null;
  const out = [];
  for (let i = 12; i < obs.length; i++) {
    out.push({ date: obs[i].date.slice(0, 7), value: round2((obs[i].value / obs[i - 12].value - 1) * 100) });
  }
  const last = out[out.length - 1];
  const prev = out[out.length - 2];
  return {
    value: last.value,
    previousValue: prev?.value ?? null,
    change: prev ? round2(last.value - prev.value) : 0,
    direction: prev ? (last.value > prev.value ? "up" : last.value < prev.value ? "down" : "neutral") : "neutral",
    asOf: obs[obs.length - 1].date,
    timeSeries: out,
  };
}

// ── Main ───────────────────────────────────────────────────────────────────────
async function main() {
  console.log("Fetching from FRED...\n");
  const bonds = {};
  for (const b of BONDS) {
    process.stdout.write(`  ${b.id.padEnd(22)} ${b.country.padEnd(18)} `);
    try {
      const obs = await fredFetch(b.id, b.limit);
      const d = b.daily ? deriveBondDaily(obs) : deriveBond(obs);
      console.log(`${String(d?.value ?? "—").padStart(8)}%  asOf ${d?.asOf}`);
      bonds[b.key] = { country: b.country, flag: b.flag, ...d };
    } catch (e) {
      console.log(`✗ ${e.message}`);
    }
    await sleep(350); // friendly rate-limit gap
  }

  console.log("");
  const macro = {};
  for (const m of MACRO) {
    process.stdout.write(`  ${m.id.padEnd(22)} ${m.label.padEnd(28)} `);
    try {
      const obs = await fredFetch(m.id, m.limit);
      let derived;
      if (m.key === "us_cpi_index") {
        derived = deriveCPI_YoY(obs);
        macro["us_cpi"] = { ...derived, unit: "% YoY", label: "US CPI Inflation" };
      } else if (m.key === "us_ppi_index") {
        derived = deriveCPI_YoY(obs);
        macro["us_ppi"] = { ...derived, unit: "% YoY", label: "US PPI Inflation" };
      } else if (m.yoy) {
        derived = deriveCPI_YoY(obs);
        macro[m.key] = { ...derived, unit: m.unit, label: m.label };
      } else if (m.momChange) {
        derived = deriveMoMChange(obs, m.scale ?? 1);
        macro[m.key] = { ...derived, unit: m.unit, label: m.label };
      } else {
        derived = deriveMacro(obs, m.scale ?? 1);
        macro[m.key] = { ...derived, unit: m.unit, label: m.label };
      }
      console.log(`${String(derived?.value ?? "—").padStart(10)}  asOf ${derived?.asOf}`);
    } catch (e) {
      console.log(`✗ ${e.message}`);
    }
    await sleep(350);
  }

  const out = {
    fetchedAt: new Date().toISOString(),
    source: "FRED (Federal Reserve Economic Data, St. Louis Fed)",
    bonds,
    macro,
    notes: {
      missing: "China 10Y yield is NOT available via FRED (PBoC doesn't share with OECD). Stays mock.",
    },
  };
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(out, null, 2));
  console.log(`\n✓ wrote ${path.relative(PROJECT, OUT)}`);
  console.log(`  ${Object.keys(bonds).length}/${BONDS.length} bonds · ${Object.keys(macro).length} macro series`);
}

main().catch((e) => { console.error("Fatal:", e); process.exit(1); });
