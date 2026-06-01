#!/usr/bin/env python3
"""
Fetch live market data from Yahoo Finance via the yfinance library.

Yahoo Finance has no official MCP connector and rate-limits anonymous direct
HTTP traffic. The yfinance library handles the session-cookie + crumb auth
flow and retry/backoff that Yahoo requires, so we offload the work to it.

For each instrument we fetch ~1y of daily history (interval='1d', period='1y')
and derive everything from the close column:

  - value          → latest close
  - dailyChange    → latest vs prior-day close
  - weekChange     → latest vs ~5 trading days back
  - monthChange    → latest vs ~21 trading days back
  - ytdChange      → latest vs first 2026 close
  - high52w / low52w
  - sparkline      → 52 evenly-spaced points across the 1y window

Output: src/lib/yahoo-data.json   (consumed via mock-data.ts patches)

Run:   /tmp/yf-venv/bin/python3 scripts/fetch-yahoo.py
or:    npm run fetch:yahoo
"""

import json
import sys
from pathlib import Path
import time

import yfinance as yf
import pandas as pd

PROJECT = Path(__file__).resolve().parent.parent
OUT = PROJECT / "src" / "lib" / "yahoo-data.json"

# (key, yahoo_symbol, display_name, region, flag)
INDICES = [
    ("sp500",  "^GSPC",     "S&P 500",            "USA",         "🇺🇸"),
    ("ndx",    "^NDX",      "NASDAQ 100",         "USA",         "🇺🇸"),
    ("sse",    "000001.SS", "Shanghai Composite", "China",       "🇨🇳"),
    ("nikkei", "^N225",     "Nikkei 225",         "Japan",       "🇯🇵"),
    ("nifty",  "^NSEI",     "NIFTY 50",           "India",       "🇮🇳"),
    ("dax",    "^GDAXI",    "DAX",                "Germany",     "🇩🇪"),
    ("ftse",   "^FTSE",     "FTSE 100",           "UK",          "🇬🇧"),
    ("cac",    "^FCHI",     "CAC 40",             "France",      "🇫🇷"),
    ("tsx",    "^GSPTSE",   "S&P/TSX Composite",  "Canada",      "🇨🇦"),
    ("kospi",  "^KS11",     "KOSPI",              "South Korea", "🇰🇷"),
    ("twii",   "^TWII",     "TAIEX",              "Taiwan",      "🇹🇼"),
    ("vix",    "^VIX",      "VIX",                "USA",         "🇺🇸"),
]

# 10Y sovereign bond yields — Yahoo only carries some reliably
BONDS = [
    ("us10y",  "^TNX",   "United States", "🇺🇸"),
    ("uk10y",  "^FTSEMIB", None, None),  # placeholder, unreliable
]

# Yahoo Finance only carries US sovereign yield reliably.
# All non-US =RR / international bond tickers were removed from Yahoo Finance.
# Non-US bonds are sourced from FRED (monthly cadence) via fetch-fred.mjs.
BOND_RELIABLE = [
    ("us10y",  "^TNX",  "United States", "🇺🇸"),
]

# (key, yahoo_symbol, display_name, unit, icon)
COMMODITIES = [
    ("brent",  "BZ=F",  "Brent Crude",  "USD/bbl",   "🛢️"),
    ("wti",    "CL=F",  "WTI Crude",    "USD/bbl",   "⛽"),
    ("gold",   "GC=F",  "Gold",         "USD/oz",    "🟡"),
    ("silver", "SI=F",  "Silver",       "USD/oz",    "⬜"),
    ("copper", "HG=F",  "Copper",       "USD/lb",    "🟠"),
    ("alum",   "ALI=F", "Aluminum",     "USD/ton",   "⚙️"),
    ("iron",   "TIO=F", "Iron Ore",     "USD/ton",   "🪨"),
    ("soy",    "ZS=F",  "Soybeans",     "US¢/bu",    "🌱"),
    ("natgas", "NG=F",  "Natural Gas",  "USD/MMBtu", "🔥"),
]

# (key, yahoo_symbol, display_name, unit, icon)
CRYPTO = [
    ("btc",   "BTC-USD",  "Bitcoin",  "USD", "₿"),
    ("eth",   "ETH-USD",  "Ethereum", "USD", "Ξ"),
    ("sol",   "SOL-USD",  "Solana",   "USD", "◎"),
    ("bnb",   "BNB-USD",  "BNB",      "USD", "⬡"),
]

# (key, yahoo_symbol, display_name, pair_label, icon)
# DXY = USD strength index. Others are quoted as X per 1 USD (or USD per 1 X for EUR/GBP).
FOREX = [
    ("dxy",  "DX-Y.NYB", "US Dollar Index", "DXY",     "🇺🇸"),
    ("eur",  "EURUSD=X",  "Euro",            "EUR/USD",  "🇪🇺"),
    ("gbp",  "GBPUSD=X",  "Pound Sterling",  "GBP/USD",  "🇬🇧"),
    ("jpy",  "USDJPY=X",  "Japanese Yen",    "USD/JPY",  "🇯🇵"),
    ("cad",  "USDCAD=X",  "Canadian Dollar", "USD/CAD",  "🇨🇦"),
    ("inr",  "USDINR=X",  "Indian Rupee",    "USD/INR",  "🇮🇳"),
]


def downsample(series, points=52):
    """Return `points` evenly-spaced values from the series."""
    if len(series) == 0:
        return []
    if len(series) <= points:
        return [round(float(v), 2) for v in series]
    step = (len(series) - 1) / (points - 1)
    return [round(float(series.iloc[round(i * step)]), 2) for i in range(points)]


def pct(curr, prev):
    if prev is None or prev == 0 or pd.isna(prev) or pd.isna(curr):
        return 0.0
    return round((float(curr) - float(prev)) / float(prev) * 100, 2)


def derive(history, year=2026):
    """history: DataFrame with at minimum a Close column."""
    closes = history["Close"].dropna()
    if len(closes) == 0:
        return None

    last = closes.iloc[-1]

    def at_back(n):
        idx = len(closes) - 1 - n
        return closes.iloc[idx] if 0 <= idx < len(closes) else None

    prev_close   = at_back(1)
    wk_ago       = at_back(5)
    month_ago    = at_back(21)

    # YTD anchor — first close in `year`
    closes_idx = closes.index
    ytd_anchor = None
    for ts, val in zip(closes_idx, closes):
        if ts.year == year:
            ytd_anchor = val
            break

    high52w = float(closes.max())
    low52w  = float(closes.min())

    return {
        "value":       round(float(last), 2),
        "asOf":        closes_idx[-1].strftime("%Y-%m-%d"),
        "dailyChange": pct(last, prev_close),
        "weekChange":  pct(last, wk_ago),
        "monthChange": pct(last, month_ago),
        "ytdChange":   pct(last, ytd_anchor),
        "high52w":     round(high52w, 2),
        "low52w":      round(low52w, 2),
        "sparkline":   downsample(closes, 52),
    }


def derive_bond(history):
    """Return absolute yield moves (in pct pts) and a 12-point monthly trend."""
    closes = history["Close"].dropna()
    if len(closes) == 0:
        return None

    last = float(closes.iloc[-1])

    def abs_move(n):
        idx = len(closes) - 1 - n
        if 0 <= idx < len(closes):
            return round(last - float(closes.iloc[idx]), 3)
        return 0.0

    daily_move  = abs_move(1)
    month_move  = abs_move(21)
    year_move   = abs_move(252)

    # 12-month trend: one value per calendar month (last close of each month)
    df = closes.to_frame("yield")
    df["ym"] = closes.index.to_period("M")
    monthly = df.groupby("ym")["yield"].last().tail(12)
    trend = [round(float(v), 3) for v in monthly]

    return {
        "value":          round(last, 3),
        "asOf":           closes.index[-1].strftime("%Y-%m-%d"),
        "dailyMove":      daily_move,
        "oneMonthMove":   month_move,
        "oneYearMove":    year_move,
        "trend":          trend,
    }


def fetch_one(symbol, retries=3):
    last_err = None
    for attempt in range(retries):
        try:
            t = yf.Ticker(symbol)
            hist = t.history(period="1y", interval="1d", auto_adjust=False)
            if len(hist) == 0:
                raise RuntimeError("empty history")
            return hist, None
        except Exception as e:
            last_err = str(e)
            time.sleep(1 + attempt)
    return None, last_err


def main():
    print(f"Fetching via yfinance...\n")
    indices_out = []
    for key, sym, name, region, flag in INDICES:
        print(f"  {sym:12} {name:22} ", end="", flush=True)
        hist, err = fetch_one(sym)
        if err or hist is None:
            print(f"✗ {err}")
            continue
        d = derive(hist)
        if d is None:
            print("✗ no closes")
            continue
        print(f"{d['value']:>10}  {d['dailyChange']:+.2f}%  YTD {d['ytdChange']:+.2f}%")
        indices_out.append({
            "key": key, "symbol": sym, "name": name, "region": region, "flag": flag,
            **d,
        })

    print()
    bonds_out = []
    for key, sym, country, flag in BOND_RELIABLE:
        print(f"  {sym:14} {country:22} ", end="", flush=True)
        hist, err = fetch_one(sym)
        if err or hist is None:
            print(f"✗ {err}")
            continue
        d = derive_bond(hist)
        if d is None:
            print("✗ no closes")
            continue
        print(f"{d['value']:>7.3f}%  1D {d['dailyMove']:+.3f}  1M {d['oneMonthMove']:+.3f}  1Y {d['oneYearMove']:+.3f}  asOf {d['asOf']}")
        bonds_out.append({
            "key": key, "symbol": sym, "country": country, "flag": flag, **d,
        })

    print()
    commodities_out = []
    for key, sym, name, unit, icon in COMMODITIES:
        print(f"  {sym:12} {name:22} ", end="", flush=True)
        hist, err = fetch_one(sym)
        if err or hist is None:
            print(f"✗ {err}")
            continue
        d = derive(hist)
        if d is None:
            print("✗ no closes")
            continue
        print(f"{d['value']:>10}  {d['dailyChange']:+.2f}%  YTD {d['ytdChange']:+.2f}%")
        commodities_out.append({
            "key": key, "symbol": sym, "name": name, "unit": unit, "icon": icon,
            **d,
        })

    print()
    forex_out = []
    for key, sym, name, pair, icon in FOREX:
        print(f"  {sym:12} {name:22} ", end="", flush=True)
        hist, err = fetch_one(sym)
        if err or hist is None:
            print(f"✗ {err}")
            continue
        d = derive(hist)
        if d is None:
            print("✗ no closes")
            continue
        print(f"{d['value']:>10.4f}  {d['dailyChange']:+.2f}%  YTD {d['ytdChange']:+.2f}%")
        forex_out.append({
            "key": key, "symbol": sym, "name": name, "pair": pair, "icon": icon,
            **d,
        })

    print()
    crypto_out = []
    for key, sym, name, unit, icon in CRYPTO:
        print(f"  {sym:12} {name:22} ", end="", flush=True)
        hist, err = fetch_one(sym)
        if err or hist is None:
            print(f"✗ {err}")
            continue
        d = derive(hist)
        if d is None:
            print("✗ no closes")
            continue
        print(f"{d['value']:>12}  {d['dailyChange']:+.2f}%  YTD {d['ytdChange']:+.2f}%")
        crypto_out.append({
            "key": key, "symbol": sym, "name": name, "unit": unit, "icon": icon,
            **d,
        })

    OUT.parent.mkdir(parents=True, exist_ok=True)
    with OUT.open("w") as f:
        json.dump({
            "fetchedAt":   pd.Timestamp.utcnow().isoformat(),
            "source":      "Yahoo Finance via yfinance",
            "indices":     indices_out,
            "bonds":       bonds_out,
            "commodities": commodities_out,
            "crypto":      crypto_out,
            "forex":      forex_out,
        }, f, indent=2)
    print(f"\n✓ wrote {OUT.relative_to(PROJECT)}")
    print(f"  {len(indices_out)}/{len(INDICES)} indices · {len(bonds_out)}/{len(BOND_RELIABLE)} bonds · {len(commodities_out)}/{len(COMMODITIES)} commodities · {len(forex_out)}/{len(FOREX)} forex · {len(crypto_out)}/{len(CRYPTO)} crypto")


if __name__ == "__main__":
    main()
