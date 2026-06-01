#!/usr/bin/env node
// Patches src/lib/mock-data.ts in-place with the latest values from
// yahoo-data.json and fred-data.json. Matches entries by `symbol` (Yahoo) or
// `country` (FRED bonds). Leaves PMI and other curated mock-only fields untouched.

import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const mockPath = resolve(root, "src/lib/mock-data.ts");
const yahoo = JSON.parse(readFileSync(resolve(root, "src/lib/yahoo-data.json"), "utf8"));
const fred = JSON.parse(readFileSync(resolve(root, "src/lib/fred-data.json"), "utf8"));
let src = readFileSync(mockPath, "utf8");

const r = (v) => Array.isArray(v) ? `[${v.join(", ")}]` : String(v);

// Patch fields inside the FIRST object that contains `marker` after `marker_anchor`.
// Value semantics:
//   - Array  → rendered as "[a, b, c]"
//   - Number → rendered as "<n>"
//   - String → passed through as-is (caller is responsible for quoting / formatting)
function patchObject(anchorRegex, fields) {
  // anchorRegex must capture: $1 = body up to fields, $2 = closing }
  const match = src.match(anchorRegex);
  if (!match) return false;
  let body = match[1];
  for (const [key, val] of Object.entries(fields)) {
    if (val == null) continue;
    const valStr = r(val);
    // Match field assignment. Handles: arrays (single or multi-line), numbers,
    // and quoted strings. [\s\S] makes the array branch span newlines.
    const fieldRe = new RegExp(
      `(${key}:\\s*)(\\[[\\s\\S]*?\\]|"[^"]*"|[A-Za-z_$][\\w]*\\([^)]*\\)|-?[\\d.]+)`,
      "m"
    );
    body = body.replace(fieldRe, `$1${valStr}`);
  }
  src = src.replace(anchorRegex, body + match[2]);
  return true;
}

function patchBySymbol(symbol, fields) {
  const escSym = symbol.replace(/[$^]/g, "\\$&");
  const re = new RegExp(`(\\{[^{}]*symbol:\\s*"${escSym}"[^{}]*?)(\\n\\s*\\})`, "s");
  return patchObject(re, fields);
}

function patchBondByCountry(country, fields) {
  const re = new RegExp(
    `(\\{[^{}]*country:\\s*"${country}"[^{}]*?maturity:\\s*"10Y"[^{}]*?)(\\n\\s*\\})`,
    "s"
  );
  return patchObject(re, fields);
}

const stats = { equity: 0, commodity: 0, crypto: 0, forex: 0, bond: 0, macro: 0 };

// EQUITY INDICES
for (const idx of yahoo.indices || []) {
  if (patchBySymbol(idx.symbol, {
    value: idx.value, dailyChange: idx.dailyChange, weekChange: idx.weekChange,
    monthChange: idx.monthChange, ytdChange: idx.ytdChange,
    high52w: idx.high52w, low52w: idx.low52w, sparkline: idx.sparkline,
  })) stats.equity++;
}

// COMMODITIES
for (const c of yahoo.commodities || []) {
  if (patchBySymbol(c.symbol, {
    value: c.value, dailyChange: c.dailyChange, weekChange: c.weekChange,
    monthChange: c.monthChange, ytdChange: c.ytdChange,
  })) stats.commodity++;
}

// CRYPTO
for (const c of yahoo.crypto || []) {
  if (patchBySymbol(c.symbol, {
    value: c.value, dailyChange: c.dailyChange, weekChange: c.weekChange,
    monthChange: c.monthChange, ytdChange: c.ytdChange,
  })) stats.crypto++;
}

// FOREX
for (const fx of yahoo.forex || []) {
  if (patchBySymbol(fx.symbol, {
    value: fx.value, dailyChange: fx.dailyChange, weekChange: fx.weekChange,
    monthChange: fx.monthChange, ytdChange: fx.ytdChange,
  })) stats.forex++;
}

// BONDS (FRED) — bonds is an object keyed by us10y, ca10y, etc.
for (const [, b] of Object.entries(fred.bonds || {})) {
  if (patchBondByCountry(b.country, {
    yield: b.value,
    dailyMove: b.dailyMove,
    oneMonthMove: b.oneMonthMove,
    oneYearMove: b.oneYearMove,
    trend: b.trend,
  })) stats.bond++;
}

// MACRO_SNAPSHOT — only update `value` fields; leave trend strings alone.
function patchMacro(key, value) {
  if (value == null) return false;
  const re = new RegExp(`(${key}:\\s*\\{\\s*value:\\s*)(-?[\\d.]+)`, "m");
  if (!re.test(src)) return false;
  src = src.replace(re, `$1${value}`);
  return true;
}
const m = fred.macro || {};
if (patchMacro("gdp", m.us_gdp_growth?.value)) stats.macro++;
if (patchMacro("inflation", m.us_cpi?.value)) stats.macro++;
if (patchMacro("jobs", m.us_unemployment?.value)) stats.macro++;
if (patchMacro("claims", m.us_jobless?.value)) stats.macro++;
const brent = (yahoo.commodities || []).find((c) => c.symbol === "BZ=F");
if (brent && patchMacro("oil", brent.value)) stats.macro++;

// ECONOMIC_INDICATORS — patch individual indicator cards by id.
const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function asOfToPeriod(asOf) {
  if (!asOf) return null;
  const [y, mo] = asOf.split("-");
  return `${monthNames[Number(mo) - 1]} ${y}`;
}
function patchEconomicIndicator(id, macroRec) {
  if (!macroRec || macroRec.value == null) return false;
  const re = new RegExp(`(\\{[^{}]*id:\\s*"${id}"[^{}]*?)(\\n\\s*\\})`, "s");
  const tsLine = `[\n      ${macroRec.timeSeries
    .map((p) => `{ date: "${p.date}", value: ${p.value} }`)
    .join(",\n      ")}\n    ]`;
  const fields = {
    value: macroRec.value,
    previousValue: macroRec.previousValue,
    change: macroRec.change,
    direction: `"${macroRec.direction}"`,
    period: `"${asOfToPeriod(macroRec.asOf)}"`,
    timeSeries: tsLine,
  };
  return patchObject(re, fields);
}
if (patchEconomicIndicator("us-cpi", m.us_cpi)) stats.macro++;
if (patchEconomicIndicator("us-ppi", m.us_ppi)) stats.macro++;
if (patchEconomicIndicator("us-jobless-claims", m.us_jobless)) stats.macro++;
if (patchEconomicIndicator("us-unemployment", m.us_unemployment)) stats.macro++;
if (patchEconomicIndicator("us-gdp", m.us_gdp_growth)) stats.macro++;

writeFileSync(mockPath, src);
console.log("patched mock-data.ts:", stats);
