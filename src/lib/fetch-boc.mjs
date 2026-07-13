#!/usr/bin/env node
/**
 * Fetch Canadian macro indicators from the Bank of Canada Valet API.
 *
 * No API key required. Docs: https://www.bankofcanada.ca/valet/docs
 *
 * Used for the Canada series whose FRED equivalents lag badly:
 *   - V39079               Target for the overnight rate (BoC policy rate)
 *   - V41690973            Total CPI index → year-over-year % change
 *   - BD.CDN.10YR.DQ.YLD   Government of Canada 10-year benchmark bond yield (daily)
 *
 * Writes: src/lib/boc-data.json   (consumed by scripts/patch-site-data.mjs)
 * Run:    npm run fetch:boc
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT = path.resolve(__dirname, "..", "..");
const OUT = path.join(PROJECT, "src", "lib", "boc-data.json");

const round2 = (n) => (n == null || !Number.isFinite(n) ? null : Math.round(n * 100) / 100);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── Series catalogue ─────────────────────────────────────────────────────────
// `daily` series are downsampled to one point per month (last obs of the month).
const SERIES = [
  { key: "ca_policy_rate", id: "V39079",     label: "Canada Policy Rate", unit: "%", positiveGood: false, daily: true, months: 37 },
  // Total CPI INDEX (2002=100). We compute the YoY % change ourselves — the
  // STATIC_TOTALCPICHANGE series is not chronologically ordered and is unreliable.
  { key: "ca_cpi",         id: "V41690973",  label: "Canada CPI Inflation", unit: "% YoY", positiveGood: false, yoy: true, months: 52 },
];

// 10Y sovereign yield — bond-shaped record (value + moves + 36-pt monthly trend),
// matching the FRED bonds dump so patch-site-data.mjs treats both identically.
const BONDS = [
  { key: "ca10y", id: "BD.CDN.10YR.DQ.YLD", country: "Canada", flag: "🇨🇦", months: 37 },
];

async function valetFetch(seriesId, { months = 25, daily = false } = {}) {
  const base = `https://www.bankofcanada.ca/valet/observations/${seriesId}/json`;
  // Daily series: pull a date range so monthly downsampling has history to chew on.
  let url;
  if (daily) {
    const start = new Date();
    start.setMonth(start.getMonth() - months);
    url = `${base}?start_date=${start.toISOString().slice(0, 10)}`;
  } else {
    url = `${base}?recent=${months}`;
  }
  let lastErr;
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const j = await res.json();
      // Valet returns observations newest-first; sort ascending (chronological).
      return (j.observations || [])
        .map((o) => ({ date: o.d, value: o[seriesId] != null ? Number(o[seriesId].v) : null }))
        .filter((o) => o.value != null && Number.isFinite(o.value))
        .sort((a, b) => a.date.localeCompare(b.date));
    } catch (e) {
      lastErr = e;
      await sleep(600);
    }
  }
  throw lastErr;
}

// Collapse a daily series to one value per month (the last observation in each month).
function downsampleMonthly(obs) {
  const byMonth = new Map();
  for (const o of obs) byMonth.set(o.date.slice(0, 7), o.value); // later date overwrites → last wins
  return [...byMonth.entries()].map(([date, value]) => ({ date, value }));
}

// Build a derived record from a chronological [{date,value}] series. The shape
// matches the FRED dump so patch-site-data.mjs can treat both identically.
function buildRecord(series) {
  if (series.length === 0) return null;
  const last = series[series.length - 1];
  const prev = series[series.length - 2];
  return {
    value: round2(last.value),
    previousValue: prev ? round2(prev.value) : null,
    change: prev ? round2(last.value - prev.value) : 0,
    direction: prev ? (last.value > prev.value ? "up" : last.value < prev.value ? "down" : "neutral") : "neutral",
    asOf: last.date,
    timeSeries: series.slice(-36).map((o) => ({ date: o.date.slice(0, 7), value: round2(o.value) })),
  };
}

function derive(obs) {
  return buildRecord(obs.map((o) => ({ date: o.date, value: o.value })));
}

// Bond record from a daily yield series (ascending). Mirrors fetch-fred.mjs deriveBond.
function deriveBond(obs, { country, flag }) {
  if (obs.length === 0) return null;
  const last = obs[obs.length - 1];
  const prev = obs[obs.length - 2];
  const back = (n) => obs[obs.length - 1 - n];
  const monthAgo = back(21) ?? obs[0];
  const yearAgo = back(252) ?? obs[0];
  const monthly = downsampleMonthly(obs).slice(-36);
  return {
    country,
    flag,
    value: round2(last.value),
    asOf: last.date,
    dailyMove: prev ? round2(last.value - prev.value) : 0,
    oneMonthMove: monthAgo ? round2(last.value - monthAgo.value) : 0,
    oneYearMove: yearAgo ? round2(last.value - yearAgo.value) : 0,
    trend: monthly.map((o) => round2(o.value)),
  };
}

function deriveYoY(obs) {
  // obs is a monthly INDEX series (ascending). Compute YoY % change.
  if (obs.length < 13) return null;
  const yoy = [];
  for (let i = 12; i < obs.length; i++) {
    yoy.push({ date: obs[i].date, value: round2((obs[i].value / obs[i - 12].value - 1) * 100) });
  }
  return buildRecord(yoy);
}

async function main() {
  console.log("Fetching from Bank of Canada Valet...\n");
  const macro = {};
  for (const s of SERIES) {
    process.stdout.write(`  ${s.id.padEnd(24)} ${s.label.padEnd(22)} `);
    try {
      let obs = await valetFetch(s.id, { months: s.months ?? 25, daily: s.daily });
      if (s.daily) obs = downsampleMonthly(obs);
      const d = s.yoy ? deriveYoY(obs) : derive(obs);
      macro[s.key] = { ...d, unit: s.unit, label: s.label };
      console.log(`${String(d?.value ?? "—").padStart(8)}  asOf ${d?.asOf}`);
    } catch (e) {
      console.log(`✗ ${e.message}`);
    }
    await sleep(250);
  }

  const bonds = {};
  for (const b of BONDS) {
    process.stdout.write(`  ${b.id.padEnd(24)} ${(b.country + " 10Y").padEnd(22)} `);
    try {
      const obs = await valetFetch(b.id, { months: b.months ?? 37, daily: true });
      const d = deriveBond(obs, b);
      bonds[b.key] = d;
      console.log(`${String(d?.value ?? "—").padStart(8)}%  asOf ${d?.asOf}  trend ${d?.trend.length}pt`);
    } catch (e) {
      console.log(`✗ ${e.message}`);
    }
    await sleep(250);
  }

  const out = {
    fetchedAt: new Date().toISOString(),
    source: "Bank of Canada Valet API",
    macro,
    bonds,
  };
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(out, null, 2));
  console.log(`\n✓ wrote ${path.relative(PROJECT, OUT)}  ·  ${Object.keys(macro).length} series`);
}

main().catch((e) => { console.error("Fatal:", e); process.exit(1); });
