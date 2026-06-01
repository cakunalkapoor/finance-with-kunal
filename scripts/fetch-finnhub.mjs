#!/usr/bin/env node
/**
 * Finnhub fetcher — SCAFFOLD for future use.
 *
 * Free tier: 60 calls/min.
 * Strengths:
 *   - Real-time stock quotes
 *   - Company fundamentals (market cap, P/E, profile)
 *   - Earnings (actual vs estimate, surprise)
 *   - Earnings call transcripts
 *   - Economic calendar (US + international events)
 *   - IPO calendar
 *   - News & sentiment
 *   - Insider transactions
 *
 * Great future use cases for Finance with Kunal:
 *   - Earnings preview / recap blog posts (use earnings + transcripts)
 *   - "This week's macro events" widget on Economy page (use economic calendar)
 *   - Stock spotlight cards on blog posts (use company profile)
 *   - Insider buying alerts
 *
 * What Finnhub canNOT do:
 *   - International equity indices time series
 *   - PMI series
 *   - Bond yields
 *
 * Run:  npm run fetch:finnhub
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT = path.resolve(__dirname, "..");
const OUT = path.join(PROJECT, "src", "lib", "finnhub-data.json");

function loadEnv() {
  const envPath = path.join(PROJECT, ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf-8").split("\n")) {
    const m = line.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
}
loadEnv();
const KEY = process.env.FINNHUB_API_KEY;
if (!KEY) {
  console.error("Missing FINNHUB_API_KEY in .env.local");
  process.exit(1);
}

async function fh(endpoint, params = {}) {
  const url = new URL(`https://finnhub.io/api/v1/${endpoint}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  url.searchParams.set("token", KEY);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ── REUSABLE HELPERS (for future use in blog generators, widgets, etc.) ────────

export async function quote(symbol) {
  return fh("quote", { symbol });
}

export async function profile(symbol) {
  return fh("stock/profile2", { symbol });
}

export async function earningsHistory(symbol) {
  return fh("stock/earnings", { symbol });
}

export async function economicCalendar(fromDate, toDate) {
  return fh("calendar/economic", { from: fromDate, to: toDate });
}

export async function ipoCalendar(fromDate, toDate) {
  return fh("calendar/ipo", { from: fromDate, to: toDate });
}

export async function companyNews(symbol, fromDate, toDate) {
  return fh("company-news", { symbol, from: fromDate, to: toDate });
}

// ── Main: demo run ─────────────────────────────────────────────────────────────
async function main() {
  console.log("Finnhub sample fetch\n");

  // 1. Snapshot of magnificent 7
  const M7 = ["AAPL", "MSFT", "NVDA", "GOOGL", "META", "AMZN", "TSLA"];
  const m7 = {};
  for (const sym of M7) {
    const [q, p] = await Promise.all([quote(sym), profile(sym)]);
    const ch = q.pc ? ((q.c - q.pc) / q.pc * 100) : 0;
    console.log(`  ${sym.padEnd(6)} $${String(q.c).padStart(8)}  ${(ch >= 0 ? "+" : "") + ch.toFixed(2)}%  cap=$${Math.round(p.marketCapitalization / 1000)}B  ${p.name}`);
    m7[sym] = { quote: q, profile: p };
    await sleep(150);
  }

  // 2. This-week economic calendar
  const today = new Date().toISOString().slice(0, 10);
  const week = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
  const cal = await economicCalendar(today, week);
  const usEvents = (cal.economicCalendar ?? []).filter((e) => e.country === "US");
  console.log(`\nUS economic events next 7 days: ${usEvents.length}`);
  for (const e of usEvents.slice(0, 8)) {
    console.log(`  ${e.time?.slice(0, 16)}  ${e.event?.slice(0, 50)}  impact=${e.impact ?? "?"}`);
  }

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify({
    fetchedAt: new Date().toISOString(),
    source: "Finnhub",
    magnificent7: m7,
    usEconomicCalendar: usEvents,
  }, null, 2));
  console.log(`\n✓ wrote ${path.relative(PROJECT, OUT)}`);
}

main().catch((e) => { console.error("Fatal:", e.message); process.exit(1); });
