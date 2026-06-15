#!/usr/bin/env node
/**
 * Twelve Data fetcher — SCAFFOLD for future use.
 *
 * Free tier: 800 calls/day, 8/min.
 * Strengths: international indices, ETFs, forex, batch quotes (up to 120 symbols).
 * Use cases that complement existing pipeline:
 *   - Backup for yfinance if Yahoo blocks our IP
 *   - Real-time intraday quotes (vs Yahoo's 15-min delay)
 *   - Forex pairs (USD/EUR, USD/JPY etc.) for cross-asset analysis
 *   - Crypto prices
 *
 * What Twelve Data canNOT replace:
 *   - PMI / sovereign bond yields (not in their catalog)
 *   - Heatmap stocks (would burn through 800/day budget)
 *
 * Run:  npm run fetch:twelvedata
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT = path.resolve(__dirname, "..", "..");
const OUT = path.join(PROJECT, "src", "lib", "twelvedata-data.json");

// ── Load API key from .env.local ───────────────────────────────────────────────
function loadEnv() {
  const envPath = path.join(PROJECT, ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
loadEnv();
const KEY = process.env.TWELVEDATA_API_KEY;
if (!KEY) {
  console.error("Missing TWELVEDATA_API_KEY in .env.local");
  process.exit(1);
}

// ── Helper: build URL with key NEVER appearing in CLI args ─────────────────────
async function td(endpoint, params = {}) {
  const url = new URL(`https://api.twelvedata.com/${endpoint}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  url.searchParams.set("apikey", KEY);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── EXAMPLE: get latest quotes for a set of symbols (batch) ────────────────────
// Uncomment and adapt as needed. Free tier rate limits to 8/min so batch endpoint
// is preferred — one call returns up to 120 symbols.
async function batchQuote(symbols) {
  const data = await td("quote", { symbol: symbols.join(",") });
  return data;
}

// ── EXAMPLE: time series (daily, 1y of bars) ───────────────────────────────────
async function timeSeries(symbol, interval = "1day", outputsize = 252) {
  return td("time_series", { symbol, interval, outputsize });
}

// ── Main: demo run with a small set of US ETFs ────────────────────────────────
async function main() {
  console.log("Twelve Data sample fetch (batch quote)\n");

  const sampleSymbols = ["SPY", "QQQ", "IWM", "EFA", "EEM", "TLT", "GLD", "USO"];
  const result = await batchQuote(sampleSymbols);

  for (const sym of sampleSymbols) {
    const q = result[sym] ?? result;
    if (q?.close) {
      const ch = parseFloat(q.percent_change);
      console.log(`  ${sym.padEnd(5)} $${parseFloat(q.close).toFixed(2).padStart(10)}  ${(ch >= 0 ? "+" : "") + ch.toFixed(2)}%  ${q.name?.slice(0, 40) ?? ""}`);
    }
  }

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify({
    fetchedAt: new Date().toISOString(),
    source: "Twelve Data",
    sample: result,
  }, null, 2));
  console.log(`\n✓ wrote ${path.relative(PROJECT, OUT)}`);
}

main().catch((e) => { console.error("Fatal:", e.message); process.exit(1); });
