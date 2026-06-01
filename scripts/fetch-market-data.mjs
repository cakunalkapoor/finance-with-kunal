#!/usr/bin/env node
/**
 * Fetch live market data from Yahoo Finance and write to src/lib/market-data.json.
 *
 * Yahoo's public chart endpoint requires no API key. We hit it once per symbol
 * with `interval=1d&range=1y` and derive:
 *   - regularMarketPrice
 *   - dailyChange (last vs prior close)
 *   - weekChange (last vs ~5 trading days ago)
 *   - monthChange (last vs ~21 trading days ago)
 *   - ytdChange (last vs first close of current calendar year)
 *   - 52W high / low (from meta)
 *   - weekly sparkline (downsampled to 52 points)
 *
 * Usage:  npm run fetch:data
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_FILE = path.resolve(__dirname, "..", "src", "lib", "market-data.json");

const INDICES = [
  { key: "sp500",  symbol: "^GSPC",     name: "S&P 500",            region: "USA",         flag: "🇺🇸" },
  { key: "ndx",    symbol: "^NDX",      name: "NASDAQ 100",         region: "USA",         flag: "🇺🇸" },
  { key: "sse",    symbol: "000001.SS", name: "Shanghai Composite", region: "China",       flag: "🇨🇳" },
  { key: "nikkei", symbol: "^N225",     name: "Nikkei 225",         region: "Japan",       flag: "🇯🇵" },
  { key: "nifty",  symbol: "^NSEI",     name: "NIFTY 50",           region: "India",       flag: "🇮🇳" },
  { key: "dax",    symbol: "^GDAXI",    name: "DAX",                region: "Germany",     flag: "🇩🇪" },
  { key: "ftse",   symbol: "^FTSE",     name: "FTSE 100",           region: "UK",          flag: "🇬🇧" },
  { key: "cac",    symbol: "^FCHI",     name: "CAC 40",             region: "France",      flag: "🇫🇷" },
  { key: "tsx",    symbol: "^GSPTSE",   name: "S&P/TSX Composite",  region: "Canada",      flag: "🇨🇦" },
  { key: "kospi",  symbol: "^KS11",     name: "KOSPI",              region: "South Korea", flag: "🇰🇷" },
];

const COMMODITIES = [
  { key: "brent",  symbol: "BZ=F", name: "Brent Crude", unit: "USD/bbl",   icon: "🛢️" },
  { key: "wti",    symbol: "CL=F", name: "WTI Crude",   unit: "USD/bbl",   icon: "⛽" },
  { key: "gold",   symbol: "GC=F", name: "Gold",        unit: "USD/oz",    icon: "🟡" },
  { key: "copper", symbol: "HG=F", name: "Copper",      unit: "USD/lb",    icon: "🟠" },
  { key: "natgas", symbol: "NG=F", name: "Natural Gas", unit: "USD/MMBtu", icon: "🔥" },
];

const BONDS = [
  { key: "us10y", symbol: "^TNX", country: "United States", flag: "🇺🇸", maturity: "10Y" },
];

const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36";

async function fetchYahooChart(symbol) {
  const url = `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=1y&interval=1d&includePrePost=false`;
  const res = await fetch(url, { headers: { "User-Agent": UA, "Accept": "application/json" } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  if (json.chart?.error) throw new Error(json.chart.error.description ?? json.chart.error.code);
  const result = json.chart?.result?.[0];
  if (!result) throw new Error("no result");
  return result;
}

function pctChange(curr, prev) {
  if (prev == null || prev === 0 || curr == null) return 0;
  return ((curr - prev) / prev) * 100;
}

function lastClose(closes) {
  for (let i = closes.length - 1; i >= 0; i--) if (closes[i] != null) return closes[i];
  return null;
}

function closeAtOffset(closes, idxFromEnd) {
  const i = closes.length - 1 - idxFromEnd;
  if (i < 0) return null;
  for (let j = i; j >= 0; j--) if (closes[j] != null) return closes[j];
  return null;
}

function ytdAnchorClose(timestamps, closes) {
  const currentYear = new Date().getUTCFullYear();
  for (let i = 0; i < timestamps.length; i++) {
    if (new Date(timestamps[i] * 1000).getUTCFullYear() === currentYear && closes[i] != null) return closes[i];
  }
  return null;
}

function buildWeeklySparkline(timestamps, closes, points = 52) {
  const valid = [];
  for (let i = 0; i < closes.length; i++) if (closes[i] != null) valid.push(closes[i]);
  if (valid.length === 0) return [];
  if (valid.length <= points) return valid.map((c) => round(c, 2));
  const out = [];
  for (let i = 0; i < points; i++) {
    out.push(round(valid[Math.round((i / (points - 1)) * (valid.length - 1))], 2));
  }
  return out;
}

function round(n, digits = 2) {
  if (n == null || !Number.isFinite(n)) return null;
  const m = Math.pow(10, digits);
  return Math.round(n * m) / m;
}

function formatPct(n) {
  if (n == null) return "—";
  return (n >= 0 ? "+" : "") + n.toFixed(2) + "%";
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function processSymbol(meta) {
  try {
    const r = await fetchYahooChart(meta.symbol);
    const m = r.meta;
    const timestamps = r.timestamp ?? [];
    const closes = r.indicators?.quote?.[0]?.close ?? [];
    const lastPx = lastClose(closes);
    if (lastPx == null) throw new Error("no closes");
    return {
      ok: true,
      symbol: meta.symbol,
      value: round(m.regularMarketPrice ?? lastPx, 2),
      dailyChange: round(pctChange(lastPx, closeAtOffset(closes, 1)), 2),
      weekChange:  round(pctChange(lastPx, closeAtOffset(closes, 5)), 2),
      monthChange: round(pctChange(lastPx, closeAtOffset(closes, 21)), 2),
      ytdChange:   round(pctChange(lastPx, ytdAnchorClose(timestamps, closes)), 2),
      high52w:     round(m.fiftyTwoWeekHigh ?? Math.max(...closes.filter((c) => c != null)), 2),
      low52w:      round(m.fiftyTwoWeekLow  ?? Math.min(...closes.filter((c) => c != null)), 2),
      sparkline:   buildWeeklySparkline(timestamps, closes, 52),
    };
  } catch (err) {
    return { ok: false, symbol: meta.symbol, error: String(err.message ?? err) };
  }
}

async function runGroup(name, list) {
  console.log(`\n${name}`);
  const out = [];
  for (const item of list) {
    process.stdout.write(`  ${item.symbol.padEnd(12)} ${(item.name ?? item.country).padEnd(22)} `);
    const d = await processSymbol(item);
    if (d.ok) {
      console.log(`${String(d.value).padStart(10)}  ${formatPct(d.dailyChange).padStart(8)}  YTD ${formatPct(d.ytdChange).padStart(8)}`);
      out.push({ ...item, ...d });
    } else {
      console.log(`✗  ${d.error}`);
    }
    await sleep(150);
  }
  return out;
}

async function main() {
  console.log("Fetching market data from Yahoo Finance...");
  const indices = await runGroup("INDICES", INDICES);
  const commodities = await runGroup("COMMODITIES", COMMODITIES);
  const bonds = await runGroup("BONDS", BONDS);

  const output = {
    fetchedAt: new Date().toISOString(),
    source: "Yahoo Finance",
    indices, commodities, bonds,
  };
  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(output, null, 2));
  console.log(`\n✓ wrote ${path.relative(process.cwd(), OUT_FILE)}`);
  console.log(`  ${indices.length}/${INDICES.length} indices · ${commodities.length}/${COMMODITIES.length} commodities · ${bonds.length}/${BONDS.length} bonds`);
}

main().catch((err) => { console.error("Fatal:", err); process.exit(1); });
