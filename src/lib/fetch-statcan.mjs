#!/usr/bin/env node
/**
 * Fetch Canadian indicators from the Statistics Canada Web Data Service (WDS).
 *
 * No API key required. Docs: https://www.statcan.gc.ca/en/developers/wds
 *
 * Series are pinned by permanent StatCan vector IDs:
 *   - 2062811   LFS employment level, both sexes 15+, SA (table 14-10-0287) →
 *               month-over-month change in K ("jobs added").
 *   - 2062815   LFS unemployment rate, both sexes 15+, SA, Canada (table 14-10-0287).
 *   - 87008984  Merchandise trade balance, BoP basis, all countries, SA (table 12-10-0011).
 *   - 62425572  Federal general government revenue, Canada, seasonally adjusted
 *               at annual rates (table 36-10-0477). $millions → $billions.
 *
 * Writes: src/lib/statcan-data.json   (consumed by scripts/patch-site-data.mjs)
 * Run:    npm run fetch:statcan
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT = path.resolve(__dirname, "..", "..");
const OUT = path.join(PROJECT, "src", "lib", "statcan-data.json");

const round1 = (n) => (n == null || !Number.isFinite(n) ? null : Math.round(n * 10) / 10);
const round2 = (n) => (n == null || !Number.isFinite(n) ? null : Math.round(n * 100) / 100);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const SERIES = [
  // LFS unemployment rate, both sexes 15+, seasonally adjusted, Canada (table 14-10-0287).
  // StatCan direct — publishes ~1 month ahead of FRED's OECD-harmonised series.
  { key: "ca_unemployment",     vector: 2062815,    latestN: 37, unit: "%",     round: "one", keep: 36,       label: "Canada Unemployment" },
  // Merchandise trade balance, balance-of-payments basis, all countries, seasonally
  // adjusted (table 12-10-0011). $millions → $billions. StatCan direct.
  { key: "ca_trade",            vector: 87008984,   latestN: 37, unit: "CAD B", scale: 0.001, round: "one", keep: 36, label: "Canada Trade Balance" },
  // Employment LEVEL (K persons) → month-over-month change in K ("jobs added").
  // latestN = keep + 1 (need one extra level to derive the first diff).
  { key: "ca_jobs_added",       vector: 2062811,    latestN: 37, unit: "K MoM", diff: true, keep: 36,        label: "Canada Jobs Added" },
  { key: "ca_govt_revenue",     vector: 62425572,   latestN: 13, unit: "CAD B", scale: 0.001, round: "one",   label: "Canada Govt Revenues" },
  // Total retail trade sales, Canada, seasonally adjusted (table 20-10-0056). LEVEL → YoY %.
  // latestN = keep + 12 (YoY needs 12 extra months of raw levels).
  { key: "ca_retail",           vector: 1446859483, latestN: 48, unit: "% YoY", yoy: true, keep: 36,         label: "Canada Retail Sales" },
  // Real GDP, expenditure-based, chained 2017$, quarterly SA (table 36-10-0104).
  // LEVEL → plain (not annualised) quarter-over-quarter %, which is what the card
  // has always shown. Replaces FRED's OECD mirror NAEXKP01CAQ657S: StatCan
  // released Q1 2026 on May 29 and FRED did not carry it until Jun 15, so the
  // mirror costs ~2.5 weeks on top of StatCan's own two-month schedule.
  // Two decimals — quarterly moves here run to hundredths (Q1 2026 was -0.04%),
  // and one decimal would round that to -0.0.
  { key: "ca_gdp",              vector: 62305752,   latestN: 16, unit: "% QoQ", pct: true, round: "two", keep: 12, label: "Canada GDP (QoQ)" },
  // Real GDP by industry, chained 2017$, monthly SA (table 36-10-0434). LEVEL →
  // month-over-month %. Runs ~4 months ahead of the quarterly series, so this is
  // the fresher read on Canadian growth between quarterly prints.
  { key: "ca_gdp_monthly",      vector: 65201210,   latestN: 37, unit: "% MoM", pct: true, round: "two", keep: 36, label: "Canada GDP (MoM)" },
];

async function fetchVector(vectorId, latestN) {
  const url = "https://www150.statcan.gc.ca/t1/wds/rest/getDataFromVectorsAndLatestNPeriods";
  let lastErr;
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify([{ vectorId, latestN }]),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const j = await res.json();
      const obj = j?.[0]?.object;
      if (j?.[0]?.status !== "SUCCESS" || !obj) throw new Error(`WDS status ${j?.[0]?.status}`);
      return (obj.vectorDataPoint || [])
        .map((p) => ({ date: p.refPer.slice(0, 7), value: Number(p.value) }))
        .filter((p) => Number.isFinite(p.value))
        .sort((a, b) => a.date.localeCompare(b.date));
    } catch (e) {
      lastErr = e;
      await sleep(600);
    }
  }
  throw lastErr;
}

function buildRecord(series, { scale = 1, round = "one", keep = 24 } = {}) {
  const rounder = round === "whole" ? Math.round : round === "two" ? round2 : round1;
  const apply = (v) => rounder(v * scale);
  const s = series.map((p) => ({ date: p.date, value: apply(p.value) }));
  if (s.length === 0) return null;
  const last = s[s.length - 1];
  const prev = s[s.length - 2];
  return {
    value: last.value,
    // Same precision as the values themselves — rounding the delta harder than
    // its operands makes `change` disagree with value minus previousValue.
    change: prev ? rounder(last.value - prev.value) : 0,
    previousValue: prev ? prev.value : null,
    direction: prev ? (last.value > prev.value ? "up" : last.value < prev.value ? "down" : "neutral") : "neutral",
    asOf: last.date,
    timeSeries: s.slice(-keep),
  };
}

// For LEVEL series we can report the month-over-month change (e.g. employment
// level → "jobs added", in K). Rounded to whole thousands.
function deriveDiff(obs, keep = 24) {
  if (obs.length < 2) return null;
  const diff = [];
  for (let i = 1; i < obs.length; i++) {
    diff.push({ date: obs[i].date, value: Math.round(obs[i].value - obs[i - 1].value) });
  }
  return buildRecord(diff, { keep });
}

// For LEVEL series we report the year-over-year % change (e.g. retail sales).
function deriveYoY(obs, keep = 24) {
  if (obs.length < 13) return null;
  const yoy = [];
  for (let i = 12; i < obs.length; i++) {
    yoy.push({ date: obs[i].date, value: round1((obs[i].value / obs[i - 12].value - 1) * 100) });
  }
  return buildRecord(yoy, { keep });
}

// For LEVEL series we report the period-over-period % change — MoM on a monthly
// series, QoQ on a quarterly one. Not annualised: StatCan headlines quarterly
// GDP at an annual rate, but this card has always shown the plain quarterly
// move (and computing it this way reproduces the OECD/FRED figure exactly).
function derivePct(obs, keep = 24, round = "two") {
  if (obs.length < 2) return null;
  const pct = [];
  for (let i = 1; i < obs.length; i++) {
    const prev = obs[i - 1].value;
    if (!prev) continue;
    pct.push({ date: obs[i].date, value: (obs[i].value / prev - 1) * 100 });
  }
  return buildRecord(pct, { keep, round });
}

async function main() {
  console.log("Fetching from Statistics Canada WDS...\n");
  const macro = {};
  for (const s of SERIES) {
    process.stdout.write(`  v${String(s.vector).padEnd(10)} ${s.label.padEnd(24)} `);
    try {
      const obs = await fetchVector(s.vector, s.latestN);
      const d = s.diff ? deriveDiff(obs, s.keep)
        : s.yoy ? deriveYoY(obs, s.keep)
        : s.pct ? derivePct(obs, s.keep, s.round)
        : buildRecord(obs, { scale: s.scale, round: s.round, keep: s.keep });
      macro[s.key] = { ...d, unit: s.unit, label: s.label };
      console.log(`${String(d?.value ?? "—").padStart(8)}  asOf ${d?.asOf}`);
    } catch (e) {
      console.log(`✗ ${e.message}`);
    }
    await sleep(250);
  }

  const out = {
    fetchedAt: new Date().toISOString(),
    source: "Statistics Canada Web Data Service",
    macro,
  };
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(out, null, 2));
  console.log(`\n✓ wrote ${path.relative(PROJECT, OUT)}  ·  ${Object.keys(macro).length} series`);
}

main().catch((e) => { console.error("Fatal:", e); process.exit(1); });
