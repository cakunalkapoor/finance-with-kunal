#!/usr/bin/env node
/**
 * Fetch Canadian indicators from the Statistics Canada Web Data Service (WDS).
 *
 * No API key required. Docs: https://www.statcan.gc.ca/en/developers/wds
 *
 * Series are pinned by permanent StatCan vector IDs:
 *   - 64549350  EI beneficiaries, regular benefits, Canada, both sexes 15+,
 *               seasonally adjusted (table 14-10-0011). Persons → thousands.
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
const PROJECT = path.resolve(__dirname, "..");
const OUT = path.join(PROJECT, "src", "lib", "statcan-data.json");

const round1 = (n) => (n == null || !Number.isFinite(n) ? null : Math.round(n * 10) / 10);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const SERIES = [
  { key: "ca_ei_beneficiaries", vector: 64549350, latestN: 24, unit: "K",     scale: 0.001, round: "whole", label: "Canada EI Beneficiaries" },
  { key: "ca_govt_revenue",     vector: 62425572, latestN: 13, unit: "CAD B", scale: 0.001, round: "one",   label: "Canada Govt Revenues" },
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

function buildRecord(series, { scale = 1, round = "one" } = {}) {
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
    timeSeries: s.slice(-24),
  };
}

async function main() {
  console.log("Fetching from Statistics Canada WDS...\n");
  const macro = {};
  for (const s of SERIES) {
    process.stdout.write(`  v${String(s.vector).padEnd(10)} ${s.label.padEnd(24)} `);
    try {
      const obs = await fetchVector(s.vector, s.latestN);
      const d = buildRecord(obs, { scale: s.scale, round: s.round });
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
