#!/usr/bin/env node
// Patches src/lib/site-data.ts in-place with the latest values from
// yahoo-data.json and fred-data.json. Matches entries by `symbol` (Yahoo) or
// `country` (FRED bonds). Leaves PMI and other curated mock-only fields untouched.

import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..", "..");
const dataPath = resolve(root, "src/lib/site-data.ts");
const yahoo = JSON.parse(readFileSync(resolve(root, "src/lib/yahoo-data.json"), "utf8"));
const fred = JSON.parse(readFileSync(resolve(root, "src/lib/fred-data.json"), "utf8"));
// boc-data.json (Bank of Canada Valet) and statcan-data.json (StatCan WDS) are
// optional; tolerate their absence so the patch still runs from yahoo + fred.
let boc = { macro: {} };
try { boc = JSON.parse(readFileSync(resolve(root, "src/lib/boc-data.json"), "utf8")); } catch { /* not fetched */ }
let statcan = { macro: {} };
try { statcan = JSON.parse(readFileSync(resolve(root, "src/lib/statcan-data.json"), "utf8")); } catch { /* not fetched */ }
let src = readFileSync(dataPath, "utf8");

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

const stats = { equity: 0, realizedVol: 0, commodity: 0, crypto: 0, forex: 0, bond: 0, macro: 0 };

// EQUITY INDICES — base fields + realized vol
for (const idx of yahoo.indices || []) {
  if (patchBySymbol(idx.symbol, {
    value: idx.value, dailyChange: idx.dailyChange, weekChange: idx.weekChange,
    monthChange: idx.monthChange, ytdChange: idx.ytdChange,
    high52w: idx.high52w, low52w: idx.low52w, sparkline: idx.sparkline,
  })) stats.equity++;

  if (typeof idx.realizedVol === "number" &&
      patchBySymbol(idx.symbol, { realizedVol: idx.realizedVol })) {
    stats.realizedVol++;
  }
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
function asOfToFullDate(asOf) {
  if (!asOf) return null;
  const [y, mo, d] = asOf.split("-");
  return `${monthNames[Number(mo) - 1]} ${Number(d)}, ${y}`;
}
function tsLiteral(series) {
  return `[\n      ${series
    .map((p) => `{ date: "${p.date}", value: ${p.value} }`)
    .join(",\n      ")}\n    ]`;
}
// Build a weekly history (date,value) from a 52-pt Yahoo sparkline ending at asOf.
function weeklyTsFromSparkline(sparkline, asOf) {
  const end = new Date(`${asOf}T00:00:00Z`);
  const pts = (sparkline || []).map((v, i, arr) => {
    const d = new Date(end);
    d.setUTCDate(d.getUTCDate() - (arr.length - 1 - i) * 7);
    return { date: d.toISOString().slice(0, 10), value: v };
  });
  return tsLiteral(pts);
}
// Patch one ECONOMIC_INDICATORS card. Brace-safe: the indicator object contains a
// nested `timeSeries` array (or a genTimeSeries(...) call), so we split the match
// into [scalar-field head][`timeSeries:`][value] rather than using a [^{}] anchor
// (the old anchor silently failed to match, leaving every card stale).
function patchIndicatorObject(id, fields, tsLit) {
  const re = new RegExp(
    `(\\{[^{}]*id:\\s*"${id}"[\\s\\S]*?)(timeSeries:\\s*)(\\[[\\s\\S]*?\\]|genTimeSeries\\([^)]*\\))`
  );
  const match = src.match(re);
  if (!match) return false;
  let head = match[1];
  for (const [key, val] of Object.entries(fields)) {
    if (val == null) continue;
    const fieldRe = new RegExp(`(${key}:\\s*)("[^"]*"|-?[\\d.]+)`);
    // Function replacement so `$`-sequences in field values aren't treated as backrefs.
    head = head.replace(fieldRe, (_m, p1) => p1 + r(val));
  }
  // Function replacement is REQUIRED here: `head` contains description prose that can
  // include "$3"/"$5" etc., which a string replacement would expand as capture-group
  // backreferences (e.g. "$3.19" -> injects group 3). A function returns text verbatim.
  const replacement = head + match[2] + (tsLit != null ? tsLit : match[3]);
  src = src.replace(re, () => replacement);
  return true;
}
// FRED-backed cards (monthly/quarterly history straight from the dump).
function patchEconomicIndicator(id, macroRec) {
  if (!macroRec || macroRec.value == null) return false;
  return patchIndicatorObject(id, {
    value: macroRec.value,
    previousValue: macroRec.previousValue,
    change: macroRec.change,
    direction: `"${macroRec.direction}"`,
    period: `"${asOfToPeriod(macroRec.asOf)}"`,
  }, tsLiteral(macroRec.timeSeries));
}
// Yahoo-backed energy cards (Brent, NatGas): live weekly value + sparkline history.
// NOTE: these cards' `description` prose is NOT patched here — the weekly task
// rewrites it to match the new direction/value.
function patchCommodityIndicator(id, rec) {
  if (!rec || rec.value == null) return false;
  const wk = Number(rec.weekChange ?? 0);
  const prev = +(rec.value / (1 + wk / 100)).toFixed(2);
  return patchIndicatorObject(id, {
    value: rec.value,
    previousValue: prev,
    change: +wk.toFixed(2),
    direction: `"${wk >= 0 ? "up" : "down"}"`,
    period: `"${asOfToFullDate(rec.asOf)}"`,
  }, weeklyTsFromSparkline(rec.sparkline, rec.asOf));
}
// 10Y yield cards source the bonds dump (value + 12-pt trend, no dates). Build a
// dated monthly series ending at the bond's asOf month so the chart has an x-axis.
function patchBondIndicator(id, bond) {
  if (!bond || bond.value == null || !Array.isArray(bond.trend)) return false;
  const [y, mo] = bond.asOf.split("-").map(Number);
  const series = bond.trend.map((v, i) => {
    const d = new Date(Date.UTC(y, mo - 1 - (bond.trend.length - 1 - i), 1));
    return { date: d.toISOString().slice(0, 7), value: v };
  });
  const last = bond.trend[bond.trend.length - 1];
  const prev = bond.trend[bond.trend.length - 2] ?? last;
  const change = +(last - prev).toFixed(2);
  return patchIndicatorObject(id, {
    value: bond.value,
    previousValue: prev,
    change,
    direction: `"${change > 0 ? "up" : change < 0 ? "down" : "neutral"}"`,
    period: `"${asOfToPeriod(bond.asOf)}"`,
  }, tsLiteral(series));
}

if (patchEconomicIndicator("us-cpi", m.us_cpi)) stats.macro++;
if (patchEconomicIndicator("us-ppi", m.us_ppi)) stats.macro++;
if (patchEconomicIndicator("us-jobless-claims", m.us_jobless)) stats.macro++;
if (patchEconomicIndicator("us-unemployment", m.us_unemployment)) stats.macro++;
if (patchEconomicIndicator("us-gdp", m.us_gdp_growth)) stats.macro++;
// US & Canada dashboard — FRED-backed cards
if (patchEconomicIndicator("us-payrolls", m.us_payrolls)) stats.macro++;
if (patchEconomicIndicator("us-fed-funds", m.us_fed_funds)) stats.macro++;
if (patchEconomicIndicator("us-trade-balance", m.us_trade)) stats.macro++;
if (patchEconomicIndicator("us-tax-receipts", m.us_tax)) stats.macro++;
if (patchEconomicIndicator("ca-unemployment", m.ca_unemployment)) stats.macro++;
if (patchEconomicIndicator("ca-gdp", m.ca_gdp_growth)) stats.macro++;
if (patchEconomicIndicator("ca-trade-balance", m.ca_trade)) stats.macro++;
if (patchEconomicIndicator("us-retail-sales", m.us_retail)) stats.macro++;
// US & Canada dashboard — 10Y yields from the bonds dump
if (patchBondIndicator("us-10y", (fred.bonds || {}).us10y)) stats.macro++;
if (patchBondIndicator("ca-10y", (fred.bonds || {}).ca10y)) stats.macro++;
// US & Canada dashboard — Bank of Canada Valet cards
const cm = boc.macro || {};
if (patchEconomicIndicator("ca-policy-rate", cm.ca_policy_rate)) stats.macro++;
if (patchEconomicIndicator("ca-cpi", cm.ca_cpi)) stats.macro++;
// US & Canada dashboard — Statistics Canada WDS cards
const sc = statcan.macro || {};
if (patchEconomicIndicator("ca-payrolls", sc.ca_jobs_added)) stats.macro++;
if (patchEconomicIndicator("ca-tax-receipts", sc.ca_govt_revenue)) stats.macro++;
if (patchEconomicIndicator("ca-retail-sales", sc.ca_retail)) stats.macro++;
const brentCommodity = (yahoo.commodities || []).find((c) => c.symbol === "BZ=F");
const natgasCommodity = (yahoo.commodities || []).find((c) => c.symbol === "NG=F");
if (patchCommodityIndicator("brent-oil", brentCommodity)) stats.macro++;
if (patchCommodityIndicator("natural-gas", natgasCommodity)) stats.macro++;

writeFileSync(dataPath, src);
console.log("patched site-data.ts:", stats);
