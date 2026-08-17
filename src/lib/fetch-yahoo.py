#!/usr/bin/env python3
"""
Fetch live market data from Yahoo Finance via the yfinance library.

Yahoo Finance has no official MCP connector and rate-limits anonymous direct
HTTP traffic. The yfinance library handles the session-cookie + crumb auth
flow and retry/backoff that Yahoo requires, so we offload the work to it.

For each instrument we fetch ~5y of daily history (interval='1d', period='5y')
and derive everything from the close column:

  - value          → latest close
  - dailyChange    → latest vs prior-day close
  - weekChange     → latest vs ~5 trading days back
  - monthChange    → latest vs ~21 trading days back
  - ytdChange      → latest vs first 2026 close
  - high52w / low52w → over the trailing 1y (252 trading days) only
  - sparkline      → 156 evenly-spaced points across the trailing ~3y window

Output: src/lib/yahoo-data.json   (consumed via site-data.ts patches)

Run:   /tmp/yf-venv/bin/python3 scripts/fetch-yahoo.py
or:    npm run fetch:yahoo
"""

import json
import sys
from pathlib import Path
import time

import yfinance as yf
import pandas as pd

PROJECT = Path(__file__).resolve().parent.parent.parent
OUT = PROJECT / "src" / "lib" / "yahoo-data.json"

# (key, yahoo_symbol, display_name, region, flag)
INDICES = [
    ("sp500",  "^GSPC",     "S&P 500",            "USA",         "🇺🇸"),
    ("ndx",    "^NDX",      "NASDAQ 100",         "USA",         "🇺🇸"),
    ("sse",    "000001.SS", "Shanghai Composite", "China",       "🇨🇳"),
    ("hsi",    "^HSI",      "Hang Seng",          "Hong Kong",   "🇭🇰"),
    ("nikkei", "^N225",     "Nikkei 225",         "Japan",       "🇯🇵"),
    ("nifty",  "^NSEI",     "NIFTY 50",           "India",       "🇮🇳"),
    ("dax",    "^GDAXI",    "DAX",                "Germany",     "🇩🇪"),
    ("ftse",   "^FTSE",     "FTSE 100",           "UK",          "🇬🇧"),
    ("cac",    "^FCHI",     "CAC 40",             "France",      "🇫🇷"),
    ("tsx",    "^GSPTSE",   "S&P/TSX Composite",  "Canada",      "🇨🇦"),
    ("kospi",  "^KS11",     "KOSPI",              "South Korea", "🇰🇷"),
    ("twii",   "^TWII",     "TAIEX",              "Taiwan",      "🇹🇼"),
]

# Realized volatility is computed per-index inside derive() from each index's
# trailing 30-day daily closes. No separate VOL fetch list needed — free APIs
# don't carry foreign implied-vol indices (VDAX, VSTOXX, VKOSPI, VFTSE are
# commercial), so we use realized vol for consistency across all markets.

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

# (key, yahoo_symbol, ticker)
#
# Canada-listed first — that is the differentiated set, and the pairs matter:
# VFV vs VSP is the same S&P 500 exposure unhedged vs CAD-hedged, and the gap
# between them is the USD/CAD move already tracked above. The four US majors
# are a reference block, not a recommendation list.
#
# NOTE: neither fees nor fund assets are fetched. Yahoo reports an annual expense
# ratio of 0.000 for Canadian listings (verified on XEQT.TO, 2026-08-11), and its
# totalAssets for a Vanguard US fund covers every share class rather than the ETF
# (VTI came back at $2.29T against SPY's $795B). Neither is published.
ETFS = [
    ("xeqt", "XEQT.TO", "XEQT"),
    ("veqt", "VEQT.TO", "VEQT"),
    ("xgro", "XGRO.TO", "XGRO"),
    ("vgro", "VGRO.TO", "VGRO"),
    ("xic",  "XIC.TO",  "XIC"),
    ("zcn",  "ZCN.TO",  "ZCN"),
    ("xiu",  "XIU.TO",  "XIU"),
    ("vfv",  "VFV.TO",  "VFV"),
    ("vsp",  "VSP.TO",  "VSP"),
    ("zsp",  "ZSP.TO",  "ZSP"),
    ("zag",  "ZAG.TO",  "ZAG"),
    ("xbb",  "XBB.TO",  "XBB"),
    # US reference block.
    ("spy",  "SPY",     "SPY"),
    ("qqq",  "QQQ",     "QQQ"),
    ("vti",  "VTI",     "VTI"),
    ("agg",  "AGG",     "AGG"),
]

# (key, yahoo_symbol, ticker, company, layer, currency, country, flag)
#
# The /ai page's stock universe, grouped by where a company sits in the AI stack
# rather than by GICS sector — the point of that page is that "AI exposure" cuts
# across Technology, Utilities, Industrials and Real Estate. A power utility
# signing data-centre PPAs (CEG) belongs next to the chips it keeps running, not
# filed under Utilities three screens away.
#
# `layer` is the grouping key in AIStockTable — keep the four values in sync
# with the AIStockLayer union in src/types/index.ts.
#
# Deliberately NOT US-only. The AI supply chain is the most geographically
# concentrated part of the trade — lithography is Dutch, advanced foundry is
# Taiwanese, HBM is Korean, deposition and test are Japanese, AI server assembly
# is Taiwanese, and grid/cooling kit is European. A US-only list would show the
# demand side of the boom and none of the chokepoints.
#
# Each row is quoted in its own listing currency, so the table labels currency
# per row and nothing is ever summed across them. Only rebased percentage
# returns get compared — see AIMarketImpact.
AI_STOCKS = [
    # Frontier models, clouds, and the software sold on top of them.
    ("msft",  "MSFT",      "MSFT",   "Microsoft",            "platform", "USD", "United States", "🇺🇸"),
    ("googl", "GOOGL",     "GOOGL",  "Alphabet",             "platform", "USD", "United States", "🇺🇸"),
    ("amzn",  "AMZN",      "AMZN",   "Amazon",               "platform", "USD", "United States", "🇺🇸"),
    ("meta",  "META",      "META",   "Meta Platforms",       "platform", "USD", "United States", "🇺🇸"),
    ("pltr",  "PLTR",      "PLTR",   "Palantir",             "platform", "USD", "United States", "🇺🇸"),
    ("now",   "NOW",       "NOW",    "ServiceNow",           "platform", "USD", "United States", "🇺🇸"),
    # Alibaba Cloud + the Qwen models — the largest AI platform outside the US.
    ("baba",  "BABA",      "BABA",   "Alibaba (ADR)",        "platform", "USD", "China",         "🇨🇳"),
    # The silicon, and the tools that make it.
    ("nvda",  "NVDA",      "NVDA",   "NVIDIA",               "silicon",  "USD", "United States", "🇺🇸"),
    ("avgo",  "AVGO",      "AVGO",   "Broadcom",             "silicon",  "USD", "United States", "🇺🇸"),
    ("amd",   "AMD",       "AMD",    "AMD",                  "silicon",  "USD", "United States", "🇺🇸"),
    ("tsm",   "TSM",       "TSM",    "TSMC (ADR)",           "silicon",  "USD", "Taiwan",        "🇹🇼"),
    ("asml",  "ASML",      "ASML",   "ASML (ADR)",           "silicon",  "USD", "Netherlands",   "🇳🇱"),
    ("mu",    "MU",        "MU",     "Micron",               "silicon",  "USD", "United States", "🇺🇸"),
    ("arm",   "ARM",       "ARM",    "Arm Holdings",         "silicon",  "USD", "United Kingdom","🇬🇧"),
    ("mrvl",  "MRVL",      "MRVL",   "Marvell",              "silicon",  "USD", "United States", "🇺🇸"),
    # Deposition, etch and coater/developer tools — ASML's complement, and the
    # second-largest semicap vendor in the world.
    ("tel",   "8035.T",    "8035",   "Tokyo Electron",       "silicon",  "JPY", "Japan",         "🇯🇵"),
    # Everything that must be built before a GPU can be switched on.
    ("vrt",   "VRT",       "VRT",    "Vertiv",               "infra",    "USD", "United States", "🇺🇸"),
    ("anet",  "ANET",      "ANET",   "Arista Networks",      "infra",    "USD", "United States", "🇺🇸"),
    ("etn",   "ETN",       "ETN",    "Eaton",                "infra",    "USD", "United States", "🇺🇸"),
    ("ceg",   "CEG",       "CEG",    "Constellation Energy", "infra",    "USD", "United States", "🇺🇸"),
    ("gev",   "GEV",       "GEV",    "GE Vernova",           "infra",    "USD", "United States", "🇺🇸"),
    ("eqix",  "EQIX",      "EQIX",   "Equinix",              "infra",    "USD", "United States", "🇺🇸"),
    # Data-centre power distribution and cooling — the European half of the
    # infrastructure layer that the US names don't cover.
    ("schn",  "SU.PA",     "SU",     "Schneider Electric",   "infra",    "EUR", "France",        "🇫🇷"),
    # Servers, and the memory that became the tightest constraint in the chain.
    ("smci",  "SMCI",      "SMCI",   "Super Micro",          "systems",  "USD", "United States", "🇺🇸"),
    ("dell",  "DELL",      "DELL",   "Dell Technologies",    "systems",  "USD", "United States", "🇺🇸"),
    ("hynix", "000660.KS", "000660", "SK hynix",             "systems",  "KRW", "South Korea",   "🇰🇷"),
    ("sec",   "005930.KS", "005930", "Samsung Electronics",  "systems",  "KRW", "South Korea",   "🇰🇷"),
    # The contract manufacturer that physically assembles a large share of the
    # world's AI servers.
    ("honhai","2317.TW",   "2317",   "Hon Hai (Foxconn)",    "systems",  "TWD", "Taiwan",        "🇹🇼"),
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


def derive(history, year=None):
    """history: DataFrame with at minimum a Close column.

    `year` is the YTD anchor year. It defaults to the year of the LAST
    observation rather than a constant: this used to be hard-coded to 2026, so
    on the first refresh of 2027 every ytdChange on the site — indices, ETFs,
    commodities, crypto, FX and the AI universe — would have been measured from
    the first close of 2026 and published a 13-month "YTD" without erroring.
    """
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
    if year is None:
        year = closes_idx[-1].year
    ytd_anchor = None
    for ts, val in zip(closes_idx, closes):
        if ts.year == year:
            ytd_anchor = val
            break

    # 52-week high/low use only the trailing 1y (252 trading days), even though
    # we now hold ~5y of closes for the multi-year sparkline.
    closes_1y = closes.tail(252)
    high52w = float(closes_1y.max())
    low52w  = float(closes_1y.min())

    # Trailing 30-day annualized REALIZED volatility, in percentage points.
    # stddev of log-returns × √252 × 100  →  e.g. 15.5 means ~15.5%.
    # Comparable in magnitude to VIX/IV but backward-looking instead of implied.
    import numpy as np
    realized_vol = None
    if len(closes) >= 31:
        last31 = closes.tail(31).values
        log_returns = np.diff(np.log(last31))
        rv = float(np.std(log_returns, ddof=1) * np.sqrt(252) * 100)
        realized_vol = round(rv, 2)

    return {
        "value":        round(float(last), 2),
        "asOf":         closes_idx[-1].strftime("%Y-%m-%d"),
        "dailyChange":  pct(last, prev_close),
        "weekChange":   pct(last, wk_ago),
        "monthChange":  pct(last, month_ago),
        "ytdChange":    pct(last, ytd_anchor),
        "high52w":      round(high52w, 2),
        "low52w":       round(low52w, 2),
        # ~3y weekly sparkline: 156 points across the trailing 756 trading days.
        "sparkline":    downsample(closes.tail(756), 156),
        "realizedVol":  realized_vol,
    }


def weekly_closes(history):
    """Weekly (Friday) closes, tz-naive so series from different exchanges can
    share one date index. Tokyo and Taipei histories come back in their own
    timezones, and reindexing tz-aware indexes against each other raises."""
    closes = history["Close"].dropna()
    if len(closes) == 0:
        return None
    idx = closes.index
    if getattr(idx, "tz", None) is not None:
        closes = closes.copy()
        closes.index = idx.tz_localize(None)
    return closes.resample("W-FRI").last().dropna()


def weekly_grid(history, points=260):
    """The shared weekly date index every /ai series is aligned to.

    Built once from a long-history reference (the S&P 500) and reused for all
    28 stocks and 12 indices, so point *i* is the same calendar week in every
    series on the page.
    """
    weekly = weekly_closes(history)
    if weekly is None:
        return None
    return weekly.index[-points:]


def series_on_grid(history, grid):
    """One series aligned to the shared weekly grid, `None` before it listed.

    Why alignment rather than a simple tail-and-downsample: several names in the
    AI universe are younger than the five-year window — Arm IPO'd in Sept 2023,
    GE Vernova was spun out in Apr 2024, Constellation in Feb 2022. Downsampling
    "whatever history exists" to a fixed 260 points silently stretches 2.9 years
    of Arm across a 5-year axis, which mislabels its dates AND corrupts any
    basket built from it. (This is exactly what the first version did.)

    So each series is reindexed onto the shared grid instead. Gaps *inside* a
    history — holidays, trading halts, a week the exchange was shut — are
    forward-filled, because a missing Friday is not missing information. Weeks
    *before* the first real observation stay `None`: the stock did not exist, and
    the chart must draw a line that starts late rather than one that starts
    wrong. AIMarketImpact chains weekly returns across whatever names are
    present, so entries are handled the way an index handles a new constituent.
    """
    weekly = weekly_closes(history)
    if weekly is None:
        return []

    # Union-then-reindex so a ffill can carry the last real close onto a grid
    # date the exchange didn't trade, without inventing pre-listing prices.
    aligned = weekly.reindex(grid.union(weekly.index)).ffill().reindex(grid)
    first = weekly.first_valid_index()
    if first is not None:
        aligned[aligned.index < first] = float("nan")

    return [None if pd.isna(v) else round(float(v), 2) for v in aligned]


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

    # 36-month trend: one value per calendar month (last close of each month)
    df = closes.to_frame("yield")
    df["ym"] = closes.index.to_period("M")
    monthly = df.groupby("ym")["yield"].last().tail(36)
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
            hist = t.history(period="5y", interval="1d", auto_adjust=False)
            if len(hist) == 0:
                raise RuntimeError("empty history")
            return hist, None
        except Exception as e:
            last_err = str(e)
            time.sleep(1 + attempt)
    return None, last_err


def main():
    # `--only=ai` (comma-separated, e.g. --only=ai,indices) fetches one slice
    # instead of all ~70 symbols. Added for the /ai page: its 24 tickers move
    # weekly like everything else, but re-pulling 5y of daily history for the
    # whole site to refresh them costs several rate-limited minutes. Sections
    # not fetched are carried over from the existing dump rather than dropped,
    # so a partial run can never silently empty the file.
    only = set()
    for arg in sys.argv[1:]:
        if arg.startswith("--only="):
            only.update(p.strip() for p in arg.split("=", 1)[1].split(",") if p.strip())
    want = lambda section: not only or section in only

    if only:
        print(f"Fetching via yfinance (sections: {', '.join(sorted(only))})...\n")
    else:
        print(f"Fetching via yfinance...\n")

    indices_out = []
    for key, sym, name, region, flag in (INDICES if want("indices") else []):
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
    for key, sym, country, flag in (BOND_RELIABLE if want("bonds") else []):
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
    for key, sym, name, unit, icon in (COMMODITIES if want("commodities") else []):
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
    for key, sym, name, pair, icon in (FOREX if want("forex") else []):
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
    for key, sym, name, unit, icon in (CRYPTO if want("crypto") else []):
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

    print()
    etfs_out = []
    for key, sym, ticker in (ETFS if want("etfs") else []):
        print(f"  {sym:12} {ticker:6} ", end="", flush=True)
        hist, err = fetch_one(sym)
        if err or hist is None:
            print(f"✗ {err}")
            continue
        d = derive(hist)
        if d is None:
            print("✗ no closes")
            continue
        print(f"{d['value']:>9.2f}  {d['dailyChange']:+.2f}%  YTD {d['ytdChange']:+.2f}%")
        etfs_out.append({
            "key": key, "symbol": sym, "ticker": ticker,
            **d,
        })

    # Every /ai series shares ONE weekly date grid, anchored on the S&P 500 —
    # the longest, most reliable history in the set. Fetched before anything
    # else in this section because both loops below reindex onto it.
    ai_out = []
    ai_indices_out = []
    grid = None
    if want("ai"):
        print()
        print("  building shared 5y weekly grid from ^GSPC ", end="", flush=True)
        ref_hist, ref_err = fetch_one("^GSPC")
        if ref_err or ref_hist is None:
            print(f"✗ {ref_err}")
            print("  ✗ cannot align /ai series without the grid — skipping AI section")
        else:
            grid = weekly_grid(ref_hist)
            print(f"✓ {len(grid)} weeks, {grid[0].date()} → {grid[-1].date()}")

    print()
    for key, sym, ticker, company, layer, currency, country, flag in (
        AI_STOCKS if grid is not None else []
    ):
        print(f"  {sym:12} {company:22} ", end="", flush=True)
        hist, err = fetch_one(sym)
        if err or hist is None:
            print(f"✗ {err}")
            continue
        d = derive(hist)
        if d is None:
            print("✗ no closes")
            continue
        # Replace the 3y sparkline with the grid-aligned 5y one — /ai holds five
        # years, and `None` marks weeks before the listing existed.
        aligned = series_on_grid(hist, grid)
        d["sparkline"] = aligned
        live = sum(1 for v in aligned if v is not None)
        note = "" if live == len(aligned) else f"  ⚠ {len(aligned) - live}w pre-listing"
        print(
            f"{d['value']:>10}  {d['dailyChange']:+.2f}%  YTD {d['ytdChange']:+.2f}%"
            f"  {live}/{len(aligned)}pts{note}"
        )
        ai_out.append({
            "key": key, "symbol": sym, "ticker": ticker, "company": company,
            "layer": layer, "currency": currency, "country": country, "flag": flag,
            **d,
        })

    # The same 12 global indices the Markets page carries, but on the shared 5y
    # weekly grid so /ai can rank the AI basket against every one of them over
    # five years. Fetched under the `ai` section rather than reusing `indices`,
    # because those rows are patched into site-data at 156/3y and the markets
    # tables depend on that length.
    print()
    for key, sym, name, region, flag in (INDICES if grid is not None else []):
        print(f"  {sym:12} {name:22} ", end="", flush=True)
        hist, err = fetch_one(sym)
        if err or hist is None:
            print(f"✗ {err}")
            continue
        s = series_on_grid(hist, grid)
        live = [v for v in s if v is not None]
        if len(live) < 2:
            print("✗ no closes")
            continue
        print(f"{live[-1]:>10}  {len(live)}/{len(s)}pts  {((live[-1]/live[0])-1)*100:+.1f}%")
        ai_indices_out.append({
            "key": key, "symbol": sym, "name": name, "region": region, "flag": flag,
            "series": s,
        })

    OUT.parent.mkdir(parents=True, exist_ok=True)

    # Carry over sections this run did not fetch, so `--only=ai` refreshes the
    # AI universe without blanking the rest of the dump that patch-site-data
    # depends on.
    previous = {}
    if OUT.exists():
        try:
            previous = json.load(OUT.open())
        except (json.JSONDecodeError, OSError):
            previous = {}

    def section(name, fetched):
        return fetched if want(name) else previous.get(name, [])

    with OUT.open("w") as f:
        json.dump({
            "fetchedAt":   pd.Timestamp.utcnow().isoformat(),
            "source":      "Yahoo Finance via yfinance",
            "indices":     section("indices", indices_out),
            "bonds":       section("bonds", bonds_out),
            "commodities": section("commodities", commodities_out),
            "crypto":      section("crypto", crypto_out),
            "forex":       section("forex", forex_out),
            "etfs":        section("etfs", etfs_out),
            # Section flag is "ai"; the JSON keys are "aiStocks" / "aiIndices".
            "aiStocks":    ai_out if want("ai") else previous.get("aiStocks", []),
            "aiIndices":   ai_indices_out if want("ai") else previous.get("aiIndices", []),
        }, f, indent=2)
    print(f"\n✓ wrote {OUT.relative_to(PROJECT)}")
    print(f"  {len(indices_out)}/{len(INDICES)} indices · {len(bonds_out)}/{len(BOND_RELIABLE)} bonds · {len(commodities_out)}/{len(COMMODITIES)} commodities · {len(forex_out)}/{len(FOREX)} forex · {len(crypto_out)}/{len(CRYPTO)} crypto · {len(etfs_out)}/{len(ETFS)} ETFs · {len(ai_out)}/{len(AI_STOCKS)} AI stocks · {len(ai_indices_out)}/{len(INDICES)} AI index series")


if __name__ == "__main__":
    main()
