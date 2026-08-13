#!/usr/bin/env python3
"""
Build the heatmap constituent catalogue from the index membership workbook.

Reads:  data/index-constituents.xlsx  ("All Constituents" sheet)
Writes: src/lib/heatmap-catalogue.json

The workbook carries published index weights for 11 indices. It replaces the
hand-tuned weight tables that used to live inline in patch-heatmap.py, so tile
area is now the real index weight rather than an estimate.

Two indices in the workbook are whole-market listings rather than index
membership (TAIEX 1095 rows, KOSPI 832), and the S&P 500's tail is far below
the treemap's `visibleMin` threshold. Every index is therefore cut to the top
MAX_PER_INDEX names by weight — see the coverage report the script prints.

Ticker → Yahoo symbol is per-market; the rules are the fiddly part and are
documented at each mapper.

Run: npm run build:catalogue
"""

import json
import re
from collections import defaultdict
from pathlib import Path

import openpyxl

PROJECT = Path(__file__).resolve().parent.parent.parent
XLSX = PROJECT / "data" / "index-constituents.xlsx"
OUT = PROJECT / "src" / "lib" / "heatmap-catalogue.json"

# Tile area below ECharts' `visibleMin: 400` is never drawn, so names past this
# rank cost a Yahoo request and render nothing. 250 keeps >=91% of every index's
# weight (TAIEX ~95%, KOSPI ~97%, S&P 500 ~91%).
MAX_PER_INDEX = 250


# ──────────────────────────────────────────────────────────────────────────────
# Workbook index name → (site index id, display name, flag)
# ──────────────────────────────────────────────────────────────────────────────
INDEX_META = {
    "S&P 500":           ("sp500",   "S&P 500",     "🇺🇸"),
    "NASDAQ-100":        ("ndx",     "NASDAQ 100",  "🇺🇸"),
    "S&P/TSX Composite": ("tsx",     "S&P/TSX",     "🇨🇦"),
    "FTSE 100":          ("ftse",    "FTSE 100",    "🇬🇧"),
    "DAX 40":            ("dax",     "DAX",         "🇩🇪"),
    "CAC 40":            ("cac",     "CAC 40",      "🇫🇷"),
    "NIFTY 50":          ("nifty50", "NIFTY 50",    "🇮🇳"),
    "Nikkei 225":        ("nikkei",  "Nikkei 225",  "🇯🇵"),
    "Hang Seng Index":   ("hsi",     "Hang Seng",   "🇭🇰"),
    "KOSPI":             ("kospi",   "KOSPI",       "🇰🇷"),
    "TAIEX":             ("twse",    "TAIEX",       "🇹🇼"),
}

# Emitted into site-data.ts and consumed by external-links.ts to rebuild the
# Yahoo quote URL a tile links to.
INDEX_SUFFIX = {
    "sp500": "", "ndx": "", "tsx": ".TO", "ftse": ".L", "dax": ".DE",
    "cac": ".PA", "nifty50": ".NS", "nikkei": ".T", "hsi": ".HK",
    "kospi": ".KS", "twse": ".TW",
}


# ──────────────────────────────────────────────────────────────────────────────
# Placeholder rows to drop.
#
# The workbook is assembled from vendor exports, and a few rows carry vendor
# internal identifiers instead of an exchange ticker. None of these resolve on
# Yahoo, so they would render as permanent grey "unavailable" tiles.
# ──────────────────────────────────────────────────────────────────────────────
PLACEHOLDER = re.compile(
    r"^\d{7,}[A-Z]$"        # TSX: 2299955D (a duplicate Constellation Software line)
    r"|^\d{4}[A-Z]\d$"      # KOSPI: 0126Z0, 0120G0, 0030R0
)


# ──────────────────────────────────────────────────────────────────────────────
# Yahoo symbol mappers
# ──────────────────────────────────────────────────────────────────────────────
# Symbols the per-market rules cannot reach, keyed "<index>:<workbook ticker>".
# Each was confirmed by hand to return price history under the mapped symbol;
# without these the tiles render as permanently grey "unavailable".
SYMBOL_OVERRIDES = {
    # Workbook writes Berkshire's B line unpunctuated, so the share-class rule
    # (which keys off a dot) has nothing to act on.
    "sp500:BRKB":   "BRK-B",
    # Qiagen's German listing trades as QIA, not its US ticker QGEN.
    "dax:QGEN":     "QIA.DE",
    # Two CAC names whose primary Yahoo listing is not Paris: Stellantis quotes
    # on Paris as STLAP, and ArcelorMittal's main line is Amsterdam.
    "cac:STLAM":    "STLAP.PA",
    "cac:MT":       "MT.AS",
}


def y_us(t):
    # Share classes use a dash on Yahoo: BRK.B -> BRK-B
    return t.replace(".", "-")


def y_tsx(t):
    # Same share-class rule as the US, plus the exchange suffix: CRT.UN -> CRT-UN.TO
    return t.replace(".", "-") + ".TO"


def y_ftse(t):
    # Two kinds of dot on the LSE, handled differently by Yahoo:
    #   TRAILING dot = ordinary-line marker — Yahoo DROPS it:  BA. -> BA.L
    #   INTERIOR dot = share class          — Yahoo dashes it: BT.A -> BT-A.L
    # Dashing both produces BA-.L / AV-.L, which Yahoo does not carry.
    return t.rstrip(".").replace(".", "-") + ".L"


def y_hk(t):
    # The workbook stores HSI codes zero-padded to 5 digits (00700, 09988);
    # Yahoo wants 4 (0700.HK, 9988.HK). Strip then re-pad rather than slicing,
    # so a genuine 5-digit code would survive instead of losing its first digit.
    return f"{int(t):04d}.HK"


def y_suffix(sfx):
    return lambda t: t + sfx


MAPPERS = {
    "sp500": y_us, "ndx": y_us, "tsx": y_tsx, "ftse": y_ftse,
    "dax": y_suffix(".DE"), "cac": y_suffix(".PA"), "nifty50": y_suffix(".NS"),
    "nikkei": y_suffix(".T"), "hsi": y_hk, "kospi": y_suffix(".KS"),
    "twse": y_suffix(".TW"),
}


def main():
    wb = openpyxl.load_workbook(XLSX, read_only=True, data_only=True)
    ws = wb["All Constituents"]

    rows = defaultdict(list)
    as_of = {}
    dropped = defaultdict(int)

    for r in ws.iter_rows(min_row=2, values_only=True):
        index_name, _market, _rank, company, ticker, weight = r[0], r[1], r[2], r[3], r[4], r[5]
        if not index_name or index_name not in INDEX_META:
            continue
        idx_id = INDEX_META[index_name][0]
        ticker = str(ticker).strip()

        # A zero weight means the row is a duplicate or delisted line, not a
        # constituent that merely rounds to zero.
        if not weight or weight <= 0:
            dropped[idx_id] += 1
            continue
        if PLACEHOLDER.match(ticker):
            dropped[idx_id] += 1
            continue

        rows[idx_id].append({
            "ticker": ticker,
            "yahoo": SYMBOL_OVERRIDES.get(f"{idx_id}:{ticker}") or MAPPERS[idx_id](ticker),
            "name": str(company).strip(),
            "weight": round(weight * 100, 4),
        })
        as_of[idx_id] = str(r[7])[:10]

    catalogue = {}
    print(f"{'index':10} {'kept':>5} {'of':>5} {'weight%':>8} {'dropped':>8}  as-of")
    for index_name, (idx_id, display, flag) in INDEX_META.items():
        items = sorted(rows[idx_id], key=lambda x: -x["weight"])
        total = sum(x["weight"] for x in items)
        kept = items[:MAX_PER_INDEX]
        cover = sum(x["weight"] for x in kept)

        # Re-normalise so each heatmap's sector weights still sum to 100%,
        # otherwise a truncated index would render smaller overall than a
        # complete one on the same treemap canvas.
        scale = 100.0 / cover if cover else 1.0
        for x in kept:
            x["weight"] = round(x["weight"] * scale, 4)

        catalogue[idx_id] = {
            "name": display,
            "flag": flag,
            "suffix": INDEX_SUFFIX[idx_id],
            "asOf": as_of.get(idx_id),
            "sourceCount": len(items),
            "coverage": round(cover / total * 100, 2) if total else 0.0,
            "constituents": kept,
        }
        print(f"{idx_id:10} {len(kept):5} {len(items):5} {cover:8.2f} {dropped[idx_id]:8}  {as_of.get(idx_id)}")

    OUT.write_text(json.dumps(catalogue, indent=2, ensure_ascii=False))
    total_n = sum(len(v["constituents"]) for v in catalogue.values())
    print(f"\n✓ wrote {OUT.relative_to(PROJECT)}  ·  {total_n} constituents across {len(catalogue)} indices")


if __name__ == "__main__":
    main()
