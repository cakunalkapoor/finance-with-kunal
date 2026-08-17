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

const round3 = (n) => Math.round(n * 1000) / 1000;
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

const stats = { equity: 0, realizedVol: 0, commodity: 0, crypto: 0, etf: 0, forex: 0, bond: 0, macro: 0 };

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
    monthChange: c.monthChange, ytdChange: c.ytdChange, sparkline: c.sparkline,
  })) stats.commodity++;
}

// CRYPTO
for (const c of yahoo.crypto || []) {
  if (patchBySymbol(c.symbol, {
    value: c.value, dailyChange: c.dailyChange, weekChange: c.weekChange,
    monthChange: c.monthChange, ytdChange: c.ytdChange, sparkline: c.sparkline,
  })) stats.crypto++;
}

// ETFs — same shape as the equity indices above, sparkline included.
for (const e of yahoo.etfs || []) {
  if (patchBySymbol(e.symbol, {
    value: e.value, dailyChange: e.dailyChange, weekChange: e.weekChange,
    monthChange: e.monthChange, ytdChange: e.ytdChange, sparkline: e.sparkline,
  })) stats.etf++;
}

// FOREX
for (const fx of yahoo.forex || []) {
  if (patchBySymbol(fx.symbol, {
    value: fx.value, dailyChange: fx.dailyChange, weekChange: fx.weekChange,
    monthChange: fx.monthChange, ytdChange: fx.ytdChange, sparkline: fx.sparkline,
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

  /* ...but winning the VALUE must not cost us HISTORY. bonds-data.json carries
     12-point trends for every country; the BoC and FRED dumps carry 36. Since
     it is applied last and ties on asOf, its 12 points used to overwrite the 36
     — and the sparkline column offers only the windows EVERY row can fill, so
     one short row silently capped the whole table at 3M/6M/YTD.

     Eight countries were rescued by accident: the top-up below refills anything
     short from FRED's monthly series. Canada has no FRED series (BoC Valet is
     its source), so nothing refilled it and it sat at 12 points, holding 2Y and
     3Y off the table for all nine rows.

     Keeping whichever trend is longer fixes it at the source. This can only
     ever retain more real history — it never fabricates a point. */
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
    trend: nextTrend.length >= prevTrend.length ? nextTrend : prevTrend,
  };
}
for (const b of Object.values(fred.bonds || {})) {
  if (b?.country && Array.isArray(b.trend)) monthlyTrend[b.country] = b.trend;
  considerBond(b, "monthly");
}
for (const b of Object.values(boc.bonds || {}))   considerBond(b, "daily");
for (const b of Object.values(bondsDump.bonds || {})) considerBond(b, "daily");

// Read-and-verify overlay (src/lib/bonds-manual.json) — the UK, India, South
// Korea and Australia have no free machine-readable daily feed, so those values
// are read from published pages during the refresh and cross-checked against a
// second provider. Only the headline value is taken by hand; the 12-point
// sparkline stays on the FRED monthly series and the 1M/1Y moves are recomputed
// against it, so no history has to be transcribed.
for (const m of Object.values(bondsManual.bonds || {})) {
  const base = bondCandidates[m.country];
  if (!base || m.value == null || !m.asOf) continue;
  if (base.asOf >= m.asOf) continue;             // an automated feed is fresher — keep it
  const monthly = Array.isArray(base.trend) ? base.trend : [];
  // Append the fresh reading as the newest monthly point so the sparkline ends
  // at the value actually shown, and measure 1M/1Y against that same series.
  const trend = monthly.length ? [...monthly.slice(1), m.value] : undefined;
  bondCandidates[m.country] = {
    ...base,
    value: m.value,
    asOf: m.asOf,
    source: m.source || base.source,
    cadence: "daily",
    trend,
    dailyMove: base.dailyMove,
    oneMonthMove: monthly.length ? round3(m.value - monthly[monthly.length - 1]) : base.oneMonthMove,
    oneYearMove:  monthly.length ? round3(m.value - monthly[0])                  : base.oneYearMove,
  };
}

// Bond trends carry 36 monthly points so the table can offer the same window
// ladder as every other chart (3M/6M/YTD/2Y/3Y). This was 12, which capped the
// column at a single fixed window even though every fetcher already returns 36.
// Top up anything shorter from the older monthly history, so a daily feed with
// a short window doesn't render a stub chart.
const BOND_TREND_POINTS = 36;
for (const b of Object.values(bondCandidates)) {
  const have = Array.isArray(b.trend) ? b.trend : [];
  const monthly = monthlyTrend[b.country] ?? [];
  if (have.length < BOND_TREND_POINTS && monthly.length) {
    const need = BOND_TREND_POINTS - have.length;
    b.trend = [
      ...monthly.slice(Math.max(0, monthly.length - need)),
      ...have,
    ].slice(-BOND_TREND_POINTS);
  }
}

for (const b of Object.values(bondCandidates)) {
  if (patchBondByCountry(b.country, {
    yield: b.value,
    dailyMove: b.dailyMove,
    oneMonthMove: b.oneMonthMove,
    oneYearMove: b.oneYearMove,
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
    period: `"${asOfToPeriod(macroRec.asOf)}"`,
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
    change: +wk.toFixed(2),
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
