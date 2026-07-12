#!/usr/bin/env node
/**
 * Fetch Canadian indicators from the Statistics Canada Web Data Service (WDS).
 *
 * No API key required. Docs: https://www.statcan.gc.ca/en/developers/wds
 *
 * Series are pinned by permanent StatCan vector IDs:
 *   - 2062811   Employment level, Canada, both sexes 15+, seasonally adjusted
 *               (table 14-10-0287). Thousands of persons → month-over-month
 *               change in K ("jobs added"), Canada's analog to US nonfarm payrolls.
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
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const SERIES = [
  // Employment LEVEL (K persons) → month-over-month change in K ("jobs added").
  // keep 36 months of history (needs latestN = keep + 1 levels to derive the diffs).
  { key: "ca_jobs_added",       vector: 2062811,    latestN: 37, unit: "K MoM", diff: true, keep: 36,        label: "Canada Jobs Added" },
  { key: "ca_govt_revenue",     vector: 62425572,   latestN: 13, unit: "CAD B", scale: 0.001, round: "one",   label: "Canada Govt Revenues" },
  // Total retail trade sales, Canada, seasonally adjusted (table 20-10-0056). LEVEL → YoY %.
  { key: "ca_retail",           vector: 1446859483, latestN: 30, unit: "% YoY", yoy: true,                    label: "Canada Retail Sales" },
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
  const apply = (v) => (round === "whole" ? Math.round(v * scale) : round1(v * scale));
  const s = series.map((p) => ({ date: p.date, value: apply(p.value) }));
  if (s.length === 0) return null;
  const last = s[s.length - 1];
  const prev = s[s.length - 2];
  return {
    value: last.value,
    previousValue: prev ? prev.value : null,
    change: prev ? round1(last.value - prev.value) : 0,
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
function deriveYoY(obs) {
  if (obs.length < 13) return null;
  const yoy = [];
  for (let i = 12; i < obs.length; i++) {
    yoy.push({ date: obs[i].date, value: round1((obs[i].value / obs[i - 12].value - 1) * 100) });
  }
  return buildRecord(yoy);
}

async function main() {
  console.log("Fetching from Statistics Canada WDS...\n");
  const macro = {};
  for (const s of SERIES) {
    process.stdout.write(`  v${String(s.vector).padEnd(10)} ${s.label.padEnd(24)} `);
    try {
      const obs = await fetchVector(s.vector, s.latestN);
      const d = s.diff ? deriveDiff(obs, s.keep) : s.yoy ? deriveYoY(obs) : buildRecord(obs, { scale: s.scale, round: s.round });
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
