#!/usr/bin/env node
// Patches src/lib/site-data.ts in-place with the latest values from Yahoo, FRED,
// Bank of Canada, and Statistics Canada dumps. Leaves manual PMI fields untouched.

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
let eurostat = { macro: {} };
try { eurostat = JSON.parse(readFileSync(resolve(root, "src/lib/eurostat-data.json"), "utf8")); } catch { /* not fetched */ }
let bondsDump = { bonds: {} };
try { bondsDump = JSON.parse(readFileSync(resolve(root, "src/lib/bonds-data.json"), "utf8")); } catch { /* not fetched */ }
// Committed, not a fetch cache — see the _README inside the file.
let bondsManual = { bonds: {} };
try { bondsManual = JSON.parse(readFileSync(resolve(root, "src/lib/bonds-manual.json"), "utf8")); } catch { /* absent */ }

let src = readFileSync(dataPath, "utf8");

const fetchedTimes = [yahoo.fetchedAt, fred.fetchedAt, boc.fetchedAt, statcan.fetchedAt, bondsDump.fetchedAt]
  .map((value) => Date.parse(value))
  .filter(Number.isFinite);
if (fetchedTimes.length) {
  // Site cadence is anchored to Kunal's local week, so format in site time
  // rather than UTC — a Sunday-evening PT refresh is otherwise labelled Monday.
  const SITE_TZ = "America/Vancouver";
  const fmt = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: SITE_TZ,
  });
  const latest = new Date(Math.max(...fetchedTimes));

  // Next briefing is the following Sunday in site time (never today, so the
  // header can't advertise a date that has already passed).
  const siteParts = new Intl.DateTimeFormat("en-CA", {
    timeZone: SITE_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  }).formatToParts(latest);
  const part = (t) => siteParts.find((p) => p.type === t).value;
  const siteMidnightUTC = Date.parse(`${part("year")}-${part("month")}-${part("day")}T00:00:00Z`);
  const dowIndex = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(part("weekday"));
  const daysUntilSunday = dowIndex === 0 ? 7 : 7 - dowIndex;
  const nextSunday = new Date(siteMidnightUTC + daysUntilSunday * 86400000);

  // nextSunday is a synthetic calendar date anchored at UTC midnight, so it
  // must be formatted in UTC — formatting it in site time would shift it back a day.
  const utcFmt = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

  src = src
    .replace(
      /export const DATA_UPDATED_AT = "[^"]+";/,
      `export const DATA_UPDATED_AT = "${fmt.format(latest)}";`,
    )
    .replace(
      /export const NEXT_BRIEFING_AT = "[^"]+";/,
      `export const NEXT_BRIEFING_AT = "${utcFmt.format(nextSunday)}";`,
    );
}

/* Strings inside an array are QUOTED. Every array this patched until now held
   numbers, so a bare join was fine; `dailyDates` is the first array of strings
   and a bare join would emit [2026-08-11, ...] — an arithmetic expression, not
   a date, and a TypeScript error at build. */
const r = (v) =>
  Array.isArray(v)
    ? `[${v.map((x) => (typeof x === "string" ? JSON.stringify(x) : String(x))).join(", ")}]`
    : String(v);

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
      `(${key}:\\s*)(\\[[\\s\\S]*?\\]|"[^"]*"|[A-Za-z_$][\\w]*\\([^)]*\\)|-?[\\d.]+|null)`,
      "m"
    );
    if (fieldRe.test(body)) {
      body = body.replace(fieldRe, `$1${valStr}`);
      continue;
    }
    /* Key not present yet — APPEND it rather than doing nothing.
       `String.replace` with no match is a silent no-op, and this function still
       reports success, so a genuinely new field used to vanish: the fetcher
       emitted it, the patcher claimed to write it, and the site rendered
       without it. That is how `daily`/`dailyDates` would have shipped — the 1W
       tab simply never appearing, with nothing failing anywhere. */
    const indent = body.match(/\n([ \t]+)[A-Za-z_$][\w]*:/)?.[1] ?? "    ";
    const trimmed = body.replace(/\s*$/, "");
    body = `${trimmed}${trimmed.endsWith(",") ? "" : ","}\n${indent}${key}: ${valStr},`;
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

const stats = { equity: 0, realizedVol: 0, commodity: 0, crypto: 0, etf: 0, forex: 0, bond: 0, macro: 0 };

// EQUITY INDICES — base fields + realized vol
for (const idx of yahoo.indices || []) {
  if (patchBySymbol(idx.symbol, {
    value: idx.value, dailyChange: idx.dailyChange, weekChange: idx.weekChange,
    monthChange: idx.monthChange, ytdChange: idx.ytdChange,
    high52w: idx.high52w, low52w: idx.low52w, sparkline: idx.sparkline,
    daily: idx.daily, dailyDates: idx.dailyDates,
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
    monthChange: c.monthChange, ytdChange: c.ytdChange, sparkline: c.sparkline,
    daily: c.daily, dailyDates: c.dailyDates,
  })) stats.commodity++;
}

// CRYPTO
for (const c of yahoo.crypto || []) {
  if (patchBySymbol(c.symbol, {
    value: c.value, dailyChange: c.dailyChange, weekChange: c.weekChange,
    monthChange: c.monthChange, ytdChange: c.ytdChange, sparkline: c.sparkline,
    daily: c.daily, dailyDates: c.dailyDates,
  })) stats.crypto++;
}

// ETFs — same shape as the equity indices above, sparkline included.
for (const e of yahoo.etfs || []) {
  if (patchBySymbol(e.symbol, {
    value: e.value, dailyChange: e.dailyChange, weekChange: e.weekChange,
    monthChange: e.monthChange, ytdChange: e.ytdChange, sparkline: e.sparkline,
    daily: e.daily, dailyDates: e.dailyDates,
  })) stats.etf++;
}

// FOREX
for (const fx of yahoo.forex || []) {
  if (patchBySymbol(fx.symbol, {
    value: fx.value, dailyChange: fx.dailyChange, weekChange: fx.weekChange,
    monthChange: fx.monthChange, ytdChange: fx.ytdChange, sparkline: fx.sparkline,
    daily: fx.daily, dailyDates: fx.dailyDates,
  })) stats.forex++;
}

// BONDS — three dumps can carry the same country, at very different vintages:
//   bonds-data.json  purpose-built, daily where a free feed exists (US/CA/DE/JP)
//   fred-data.json   OECD monthly, lags 1-3 months
//   boc-data.json    Bank of Canada, daily
// Take the FRESHEST observation per country. Previously this loop read only
// fred+boc, so Germany was pinned to a ~2-month-old OECD print while the daily
// ECB value sat unused in bonds-data.json, and Australia and South Africa were
// never patched at all because FRED carries no series for them.
const bondCandidates = {};
// FRED's monthly series is the only one guaranteed to span 12+ months. Keep it
// aside so a daily source with a short window (SARB holds well under a year)
// can still render a full 12-point sparkline.
const monthlyTrend = {};
// The month each `monthlyTrend` series ENDS on, so the top-up below can work out
// how far it overlaps the shorter daily series instead of assuming they align.
const monthlyTrendAsOf = {};
function considerBond(b, fallbackCadence) {
  // fred/boc dumps use `value`; bonds-data.json uses `yield`.
  const value = b.yield ?? b.value;
  if (!b?.country || value == null || !b.asOf) return;
  // Long-end series (DGS30, BD.CDN.LONG) exist only to draw the yield curve.
  // They carry the same country and asOf as that country's 10Y, so without
  // this guard the last one considered wins the merge and BOND_YIELDS — a
  // table headed "10-Year Benchmark Rates" — publishes the 30-year yield.
  if (b.curveOnly) return;
  const prev = bondCandidates[b.country];
  // ISO dates compare lexically. Strict `>` so that on an equal vintage the
  // LAST dump considered wins — bonds-data.json is applied last and is the only
  // one carrying `source`/`cadence` labels for the UI.
  if (prev && prev.asOf > b.asOf) return;

  /* Keep the trend from the source that won the headline value. A longer trend
     from an older candidate may have more points but ends at the wrong yield;
     that made four sparklines disagree with their own headline. The alignment-
     aware top-up below prepends older monthly history without replacing this
     source's current endpoint. */
  const prevTrend = Array.isArray(prev?.trend) ? prev.trend : [];
  const nextTrend = Array.isArray(b.trend) ? b.trend : [];

  bondCandidates[b.country] = {
    country: b.country,
    value,
    asOf: b.asOf,
    source: b.source || "unknown",
    cadence: b.cadence || fallbackCadence,
    dailyMove: b.dailyMove,
    oneMonthMove: b.oneMonthMove,
    oneYearMove: b.oneYearMove,
    trend: nextTrend.length ? nextTrend : prevTrend,
  };
}
for (const b of Object.values(fred.bonds || {})) {
  if (b?.country && !b.curveOnly && Array.isArray(b.trend)) {
    monthlyTrend[b.country] = b.trend;
    monthlyTrendAsOf[b.country] = b.asOf;
  }
  considerBond(b, "monthly");
}
for (const b of Object.values(boc.bonds || {})) {
  // Canada has no FRED counterpart; retain BoC's 36-point monthly history so
  // the shorter cross-provider trend can be extended without losing windows.
  if (b?.country && !b.curveOnly && Array.isArray(b.trend)) {
    monthlyTrend[b.country] = b.trend;
    monthlyTrendAsOf[b.country] = b.asOf;
  }
  considerBond(b, "daily");
}
for (const b of Object.values(bondsDump.bonds || {})) considerBond(b, "daily");

// Read-and-verify overlay (src/lib/bonds-manual.json) — the UK, India, South
// Korea and Australia have no free machine-readable daily feed, so those values
// are read from published pages during the refresh and cross-checked against a
// second provider. Only the headline value is taken by hand; the sparkline
// stays on the lagging FRED monthly series. Period moves are unavailable because
// comparing a September headline with (for example) a June monthly observation
// would publish a three-month gap under a 1M label.
for (const m of Object.values(bondsManual.bonds || {})) {
  const base = bondCandidates[m.country];
  if (!base || m.value == null || !m.asOf) continue;
  if (base.asOf >= m.asOf) continue;             // an automated feed is fresher — keep it
  const monthly = Array.isArray(base.trend) ? base.trend : [];
  // Append the fresh reading as the newest point so the sparkline ends at the
  // value actually shown. It provides context, not exact period-return inputs.
  const trend = monthly.length ? [...monthly.slice(1), m.value] : undefined;
  bondCandidates[m.country] = {
    ...base,
    value: m.value,
    asOf: m.asOf,
    source: m.source || base.source,
    cadence: "daily",
    trend,
    /* NOT base.dailyMove. These four countries have no free daily feed, so
       `base` is FRED's MONTHLY series, where the fetcher's "dailyMove" is just
       the month-over-month change (it equals oneMonthMove in the dump). Carrying
       it through published a monthly delta in a column labelled 1D — the UK read
       -0.146 there while its recomputed 1M read +0.244, two different periods
       sitting one above the other. There is no daily history to compute from, so
       the honest answer is no figure; the table renders a dash. */
    dailyMove: null,
    // The monthly fallback currently lags the manual reading by several months,
    // so neither 1M nor 1Y can be labelled honestly from this mixed series.
    oneMonthMove: null,
    oneYearMove: null,
  };
}

// Bond trends carry 36 monthly points so the table can offer the same window
// ladder as every other chart (3M/6M/YTD/2Y/3Y). This was 12, which capped the
// column at a single fixed window even though every fetcher already returns 36.
// Top up anything shorter from the older monthly history, so a daily feed with
// a short window doesn't render a stub chart.
const BOND_TREND_POINTS = 36;

/** Whole months from ISO date `a` to ISO date `b`; positive when `b` is later. */
function monthsBetween(a, b) {
  const [ay, am] = String(a).split("-").map(Number);
  const [by, bm] = String(b).split("-").map(Number);
  return (by - ay) * 12 + (bm - am);
}

for (const b of Object.values(bondCandidates)) {
  const have = Array.isArray(b.trend) ? b.trend : [];
  const monthly = monthlyTrend[b.country] ?? [];
  if (have.length < BOND_TREND_POINTS && monthly.length) {
    /* The two series OVERLAP — both run up to (roughly) the current month, so
       the newest `have.length` points of `monthly` describe the same months
       `have` already covers, at coarser precision. Splicing the NEWEST points
       of `monthly` in front of `have` therefore replayed a year of history:
       the sparkline climbed to today's yield, fell a year backwards in one
       step, then climbed again. Every row showed that phantom cliff, and the
       2Y/3Y windows sliced straight into the duplicated stretch.

       Take the points that PRECEDE `have`'s window instead. `gap` is how far
       the daily series runs past the end of the monthly one, so a lagging FRED
       series (India sits ~3 months behind) still lines up. */
    const gap = monthlyTrendAsOf[b.country] && b.asOf
      ? Math.max(0, monthsBetween(monthlyTrendAsOf[b.country], b.asOf))
      : 0;
    const older = monthly.slice(0, Math.max(0, monthly.length - have.length + gap));
    const need = BOND_TREND_POINTS - have.length;
    b.trend = [...older.slice(-need), ...have].slice(-BOND_TREND_POINTS);
  }
  // The type contract and chart both treat the last point as the current
  // headline. Pin it exactly so provider rounding cannot create a visible
  // endpoint mismatch, and let validate-bonds.mjs enforce the invariant.
  if (Array.isArray(b.trend) && b.trend.length && Number.isFinite(b.value)) {
    b.trend[b.trend.length - 1] = b.value;
  }
}

for (const b of Object.values(bondCandidates)) {
  if (patchBondByCountry(b.country, {
    yield: b.value,
    // patchObject skips null/undefined so a missing field can't blank a good
    // one — but here the ABSENCE is the fact to publish, so write it literally.
    dailyMove: b.dailyMove ?? "null",
    oneMonthMove: b.oneMonthMove ?? "null",
    oneYearMove: b.oneYearMove ?? "null",
    trend: b.trend,
    // patchObject passes strings through verbatim — quote them here.
    asOf: `"${b.asOf}"`,
    source: `"${b.source}"`,
    cadence: `"${b.cadence}"`,
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
function patchEconomicIndicator(id, macroRec, { weekly = false } = {}) {
  if (!macroRec || macroRec.value == null) return false;
  let timeSeries = macroRec.timeSeries;
  // Older FRED dumps collapsed weekly ICSA dates to YYYY-MM. Reconstruct the
  // weekly observation dates from the authoritative final asOf date so chart
  // keys remain unique. New dumps already retain the full FRED date.
  if (weekly && Array.isArray(timeSeries) && timeSeries.some((point) => point.date.length < 10)) {
    const end = new Date(`${macroRec.asOf}T00:00:00Z`);
    timeSeries = timeSeries.map((point, index, all) => {
      const date = new Date(end);
      date.setUTCDate(date.getUTCDate() - (all.length - 1 - index) * 7);
      return { ...point, date: date.toISOString().slice(0, 10) };
    });
  }
  return patchIndicatorObject(id, {
    value: macroRec.value,
    previousValue: macroRec.previousValue,
    change: macroRec.change,
    direction: `"${macroRec.direction}"`,
    period: `"${weekly ? asOfToFullDate(macroRec.asOf) : asOfToPeriod(macroRec.asOf)}"`,
  }, tsLiteral(timeSeries));
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
    // EconomicChart labels `change` in the card's price unit. Store the
    // absolute move here; the percentage remains available in the prose and
    // the dedicated commodities table.
    change: +(rec.value - prev).toFixed(3),
    direction: `"${wk >= 0 ? "up" : "down"}"`,
    period: `"${asOfToFullDate(rec.asOf)}"`,
  }, weeklyTsFromSparkline(rec.sparkline, rec.asOf));
}
if (patchEconomicIndicator("us-cpi", m.us_cpi)) stats.macro++;
if (patchEconomicIndicator("us-ppi", m.us_ppi)) stats.macro++;
if (patchEconomicIndicator("us-jobless-claims", m.us_jobless, { weekly: true })) stats.macro++;
if (patchEconomicIndicator("us-unemployment", m.us_unemployment)) stats.macro++;
if (patchEconomicIndicator("us-gdp", m.us_gdp_growth)) stats.macro++;
// US & Canada dashboard — FRED-backed cards
if (patchEconomicIndicator("us-payrolls", m.us_payrolls)) stats.macro++;
if (patchEconomicIndicator("us-fed-funds", m.us_fed_funds)) stats.macro++;
if (patchEconomicIndicator("us-trade-balance", m.us_trade)) stats.macro++;
if (patchEconomicIndicator("us-tax-receipts", m.us_tax)) stats.macro++;
// ca-gdp moved off FRED's OECD mirror to StatCan direct — same figure (both
// give -0.04% for Q1 2026), ~2.5 weeks sooner. See the Canada block below.
if (patchEconomicIndicator("us-retail-sales", m.us_retail)) stats.macro++;
// The standalone us-10y / ca-10y cards were removed: the yield curve chart on
// each country page carries the 10Y alongside the long end, and keeping a
// separate card meant two 10Y figures on one page from different providers.
// BOND_YIELDS on /markets still uses bondCandidates.
// US & Canada dashboard — Bank of Canada Valet cards
const cm = boc.macro || {};
if (patchEconomicIndicator("ca-policy-rate", cm.ca_policy_rate)) stats.macro++;
if (patchEconomicIndicator("ca-cpi", cm.ca_cpi)) stats.macro++;
// US & Canada dashboard — Statistics Canada WDS cards
const sc = statcan.macro || {};
if (patchEconomicIndicator("ca-unemployment", sc.ca_unemployment)) stats.macro++;
if (patchEconomicIndicator("ca-trade-balance", sc.ca_trade)) stats.macro++;
if (patchEconomicIndicator("ca-payrolls", sc.ca_jobs_added)) stats.macro++;
if (patchEconomicIndicator("ca-tax-receipts", sc.ca_govt_revenue)) stats.macro++;
if (patchEconomicIndicator("ca-retail-sales", sc.ca_retail)) stats.macro++;
if (patchEconomicIndicator("ca-gdp", sc.ca_gdp)) stats.macro++;
if (patchEconomicIndicator("ca-gdp-monthly", sc.ca_gdp_monthly)) stats.macro++;
// Euro area — Eurostat direct. FRED's euro-area unemployment, industrial
// production and trade series were discontinued in 2023 but still answer with
// stale data, so Eurostat is the live source for anything euro-area.
const eu = eurostat.macro || {};
if (patchEconomicIndicator("ea-gdp", eu.ea_gdp)) stats.macro++;
if (patchEconomicIndicator("ea-hicp", eu.ea_hicp)) stats.macro++;
const brentCommodity = (yahoo.commodities || []).find((c) => c.symbol === "BZ=F");
const natgasCommodity = (yahoo.commodities || []).find((c) => c.symbol === "NG=F");
if (patchCommodityIndicator("brent-oil", brentCommodity)) stats.macro++;
if (patchCommodityIndicator("natural-gas", natgasCommodity)) stats.macro++;

// ── YIELD CURVES ─────────────────────────────────────────────────────────────
// Both legs of a curve MUST come from one provider on one observation date.
// The spread is a difference between the two, so pairing a Yahoo 10Y with a
// FRED 30Y would report a spread neither source published — the same failure
// the bondCandidates merge exists to prevent, but worse, because the error
// lands in a derived number rather than a quoted one.
//   US     → FRED DGS10 / DGS30
//   Canada → BoC Valet 10YR / LONG. Canada has no 30Y constant maturity; the
//            long-end benchmark is "long-term" (currently ~30Y, not fixed), so
//            it is labelled "Long" rather than asserted to be 30Y.
const CURVES = [
  {
    country: "United States", flag: "🇺🇸",
    short: { key: "us10y", label: "10Y", name: "the 10-year Treasury", from: fred.bonds },
    long:  { key: "us30y", label: "30Y", name: "the 30-year Treasury", from: fred.bonds },
    source: "Source: FRED (DGS10, DGS30), daily.",
  },
  {
    country: "Canada", flag: "🇨🇦",
    short: { key: "ca10y", label: "10Y",  name: "the 10-year benchmark", from: boc.bonds },
    long:  { key: "ca30y", label: "Long", name: "the long-term benchmark", from: boc.bonds },
    source: "Source: Bank of Canada Valet (10-year and long-term benchmark bond yields), daily.",
  },
];

/** Monthly labels ending at `asOf`'s month, one per trend point. */
function monthLabels(asOf, count) {
  const end = new Date(`${asOf.slice(0, 7)}-01T00:00:00Z`);
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(end);
    d.setUTCMonth(d.getUTCMonth() - (count - 1 - i));
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
  });
}

function tenorTs(t, rec, indent) {
  const labels = monthLabels(rec.asOf, rec.trend.length);
  const pts = rec.trend
    .map((v, i) => `${indent}    { date: "${labels[i]}", value: ${v} }`)
    .join(",\n");
  return `{
${indent}  label: "${t.label}",
${indent}  name: "${t.name}",
${indent}  value: ${rec.value},
${indent}  series: [
${pts},
${indent}  ],
${indent}}`;
}

const curveBlocks = [];
for (const cfg of CURVES) {
  const s = (cfg.short.from || {})[cfg.short.key];
  const l = (cfg.long.from || {})[cfg.long.key];
  // Skip rather than half-render: a curve card missing a leg would show a
  // spread computed against nothing.
  if (!s?.trend?.length || !l?.trend?.length || s.value == null || l.value == null) {
    console.warn(`  yield curve ${cfg.country}: skipped (missing leg)`);
    continue;
  }
  const asOf = s.asOf < l.asOf ? s.asOf : l.asOf;
  curveBlocks.push(`  {
    country: ${JSON.stringify(cfg.country)},
    flag: "${cfg.flag}",
    asOf: "${asOf}",
    spreadBps: ${Math.round((l.value - s.value) * 100)},
    short: ${tenorTs(cfg.short, s, "    ")},
    long: ${tenorTs(cfg.long, l, "    ")},
    source: ${JSON.stringify(cfg.source)},
  }`);
  stats.yieldCurve = (stats.yieldCurve || 0) + 1;
}

if (curveBlocks.length) {
  src = src.replace(
    /export const YIELD_CURVES: YieldCurve\[\] = \[[\s\S]*?\n?\];/,
    `export const YIELD_CURVES: YieldCurve[] = [\n${curveBlocks.join(",\n")},\n];`
  );
}

writeFileSync(dataPath, src);
console.log("patched site-data.ts:", stats);
