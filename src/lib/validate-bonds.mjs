#!/usr/bin/env node
/**
 * Gate for the sovereign-bond pipeline. Run AFTER patch-site-data.mjs and before
 * any commit:  node src/lib/validate-bonds.mjs
 *
 * Exists because bond yields failed silently for months: Germany sat on a stale
 * OECD print while a daily feed went unread, and Australia and South Africa were
 * never patched at all. Nothing was wrong on screen — the numbers just stopped
 * moving. Every check below turns one of those silent failures into a loud one.
 *
 * Exit code 0 = safe to push, 1 = do not push.
 */

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const site = readFileSync(resolve(root, "src/lib/site-data.ts"), "utf8");

// Countries that MUST come from an automated daily feed. If one of these ever
// reports `monthly`, fetch:bonds failed or was skipped.
const MUST_BE_DAILY = ["United States", "Canada", "Germany", "Japan", "South Africa"];
// Countries served by the read-and-verify tier (bonds-manual.json).
const MANUAL_TIER   = ["United Kingdom", "India", "South Korea", "Australia"];

const MAX_CROSSCHECK_GAP_BP = 25;   // two providers disagreeing more than this = suspect
const MAX_AGE_DAYS          = 10;   // a "daily" series older than this is stale
const PLAUSIBLE             = { min: -2, max: 25 };

const problems = [];
const notes    = [];

const block = site.match(/export const BOND_YIELDS[\s\S]*?\n\];/)?.[0];
if (!block) {
  console.error("FAIL: could not locate BOND_YIELDS in site-data.ts");
  process.exit(1);
}

const bonds = [...block.matchAll(
  /country: "([^"]+)"[\s\S]*?asOf: "([^"]+)"[\s\S]*?source: "([^"]+)"[\s\S]*?cadence: "([^"]+)"[\s\S]*?yield: (-?[\d.]+)/g
)].map(m => ({ country: m[1], asOf: m[2], source: m[3], cadence: m[4], yield: parseFloat(m[5]) }));

if (bonds.length !== 9) problems.push(`expected 9 bonds, found ${bonds.length}`);

const updatedAt = /DATA_UPDATED_AT = "([^"]+)"/.exec(site)?.[1];
const refAt = Date.parse(updatedAt ?? "");
const ageDays = (asOf) => Math.round((refAt - Date.parse(`${asOf}T00:00:00Z`)) / 86_400_000);

for (const b of bonds) {
  if (!Number.isFinite(b.yield) || b.yield < PLAUSIBLE.min || b.yield > PLAUSIBLE.max) {
    problems.push(`${b.country}: implausible yield ${b.yield}%`);
  }
  if (/^(unknown|pending|)$/.test(b.source)) {
    problems.push(`${b.country}: no source label ("${b.source}") — the merge lost provenance`);
  }
  if (MUST_BE_DAILY.includes(b.country)) {
    if (b.cadence !== "daily") {
      problems.push(`${b.country}: cadence "${b.cadence}", expected daily — fetch:bonds skipped or failed`);
    }
    const age = ageDays(b.asOf);
    if (Number.isFinite(age) && age > MAX_AGE_DAYS) {
      problems.push(`${b.country}: daily feed but asOf ${b.asOf} is ${age}d old`);
    }
  }
}

// Read-and-verify tier: every entry must have been re-read this run and must
// agree with an independent provider.
let manual = { bonds: {} };
try { manual = JSON.parse(readFileSync(resolve(root, "src/lib/bonds-manual.json"), "utf8")); }
catch { problems.push("bonds-manual.json missing — UK/India/Korea/Australia will silently fall back to stale monthly data"); }

for (const key of Object.keys(manual.bonds ?? {})) {
  const m = manual.bonds[key];
  const live = bonds.find(b => b.country === m.country);
  if (!live) { problems.push(`${m.country}: in bonds-manual.json but not in BOND_YIELDS`); continue; }

  if (!m.crossCheck || m.crossCheck.value == null) {
    problems.push(`${m.country}: no crossCheck — a single unverified reading is not acceptable`);
  } else {
    const gapBp = Math.abs(m.value - m.crossCheck.value) * 100;
    if (gapBp > MAX_CROSSCHECK_GAP_BP) {
      problems.push(`${m.country}: ${m.source} says ${m.value}% but ${m.crossCheck.source} says ${m.crossCheck.value}% (${gapBp.toFixed(1)}bp apart)`);
    } else {
      notes.push(`${m.country}: ${m.value}% confirmed within ${gapBp.toFixed(1)}bp by ${m.crossCheck.source}`);
    }
  }

  const age = ageDays(m.asOf);
  if (Number.isFinite(age) && age > MAX_AGE_DAYS) {
    problems.push(`${m.country}: manual reading dated ${m.asOf} is ${age}d old — re-read it, do not carry it forward`);
  }
  if (Math.abs(live.yield - m.value) > 0.001) {
    problems.push(`${m.country}: site shows ${live.yield}% but bonds-manual.json says ${m.value}% — patch did not apply`);
  }
}

for (const c of MANUAL_TIER) {
  if (!Object.values(manual.bonds ?? {}).some(m => m.country === c)) {
    problems.push(`${c}: missing from bonds-manual.json — it has no automated daily feed`);
  }
}

console.log("Sovereign bond validation\n");
for (const b of bonds) {
  const age = ageDays(b.asOf);
  console.log(`  ${b.country.padEnd(16)} ${String(b.yield).padEnd(7)} ${b.asOf}  ${b.cadence.padEnd(8)} ${Number.isFinite(age) ? `${age}d` : "?"}  ${b.source}`);
}
if (notes.length) {
  console.log("\nCross-checks:");
  for (const n of notes) console.log(`  ✓ ${n}`);
}
if (problems.length) {
  console.log(`\n✗ ${problems.length} problem(s) — DO NOT PUSH:`);
  for (const p of problems) console.log(`  - ${p}`);
  process.exit(1);
}
console.log(`\n✓ all ${bonds.length} bonds valid — ${bonds.filter(b => b.cadence === "daily").length} daily`);
