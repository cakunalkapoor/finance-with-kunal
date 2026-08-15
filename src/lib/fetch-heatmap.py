#!/usr/bin/env python3
"""
Fetch weekly % change for every heatmap constituent from Yahoo Finance.

Reads:  src/lib/heatmap-catalogue.json  (built by build-catalogue.py)
Writes: src/lib/heatmap-data.json

The constituent lists and their weights used to be hardcoded here as one dict
per index. They now come from the published index membership workbook via
build-catalogue.py, so this script is purely the price leg: batch the symbols
per index, take last close vs ~5 trading days back.

Prices come from the batched chart endpoint, which is not subject to the harsh
per-symbol rate limit that fetch-sectors.py has to work around.

Run: npm run fetch:heatmap
"""

import json
import time
from pathlib import Path

import pandas as pd
import yfinance as yf

PROJECT = Path(__file__).resolve().parent.parent.parent
CATALOGUE = PROJECT / "src" / "lib" / "heatmap-catalogue.json"
OUT = PROJECT / "src" / "lib" / "heatmap-data.json"


# A split inside the trailing window renders as a price collapse. Monster's 2:1
# on 2026-08-11 took Close from 90.36 to 45.53 and published as a real -50.3%
# week, dragging its sector aggregate with it.
#
# Neither `Adj Close` nor `auto_adjust=True` fixes this: for a split this recent
# Yahoo has not propagated the adjustment into its daily bars at all, and both
# come back byte-identical to raw Close. `Ticker.splits` DOES know about it, so
# the correction has to be applied here.
#
# Only outliers are checked, so this costs a handful of extra requests per run
# rather than one per constituent. A ticker that moved this much WITHOUT a split
# is left exactly as it was — the sweep corrects, it never invents.
SPLIT_SUSPECT_PCT = 30.0


def correct_for_splits(out):
    """Re-derive weekChange for any symbol whose move looks like a split."""
    suspects = [
        s for s, q in out.items()
        if q.get("ok") and abs(q.get("weekChange") or 0) >= SPLIT_SUSPECT_PCT
    ]
    if not suspects:
        return 0
    fixed = 0
    for sym in suspects:
        closes = out[sym].get("_closes")
        if closes is None or len(closes) < 2:
            continue
        try:
            splits = yf.Ticker(sym).splits
        except Exception:
            continue
        if splits is None or not len(splits):
            continue
        # yfinance hands back a tz-aware split index and (often) a tz-naive price
        # index, which cannot be compared directly. Strip both to naive.
        idx = closes.index
        idx_naive = idx.tz_localize(None) if getattr(idx, "tz", None) else idx
        window_start = idx_naive[max(0, len(closes) - 1 - 5)]
        adjusted = closes.copy()
        applied = []
        for when, ratio in splits.items():
            when_naive = when.tz_localize(None) if when.tzinfo else when
            if ratio and when_naive > window_start:
                # Everything quoted BEFORE the split is on the old share count.
                adjusted.loc[idx_naive < when_naive] /= float(ratio)
                applied.append((when_naive.strftime("%Y-%m-%d"), float(ratio)))
        if not applied:
            continue
        last = float(adjusted.iloc[-1])
        wk_ago = float(adjusted.iloc[max(0, len(adjusted) - 1 - 5)])
        before = out[sym]["weekChange"]
        out[sym]["weekChange"] = round(
            ((last - wk_ago) / wk_ago * 100) if wk_ago else 0.0, 2
        )
        fixed += 1
        print(
            f"    split-adjusted {sym}: {before}% -> {out[sym]['weekChange']}%  {applied}",
            flush=True,
        )
    return fixed


def fetch_batch(symbols, label):
    print(f"\n{label}: fetching {len(symbols)} tickers in batch...", flush=True)
    data = yf.download(
        tickers=" ".join(symbols),
        period="1mo",
        interval="1d",
        group_by="ticker",
        auto_adjust=False,
        progress=False,
        threads=True,
    )
    out = {}
    for sym in symbols:
        try:
            df = data[sym] if isinstance(data.columns, pd.MultiIndex) else data
            closes = df["Close"].dropna()
            if len(closes) < 2:
                out[sym] = {"ok": False}
                continue
            last = float(closes.iloc[-1])
            wk_ago = float(closes.iloc[max(0, len(closes) - 1 - 5)])
            out[sym] = {
                "ok": True,
                "price": round(last, 2),
                "weekChange": round(((last - wk_ago) / wk_ago * 100) if wk_ago else 0.0, 2),
                "asOf": closes.index[-1].strftime("%Y-%m-%d"),
                # Kept so the split sweep below can re-derive the change without
                # re-downloading the whole batch.
                "_closes": closes,
            }
        except Exception:
            out[sym] = {"ok": False}
    fixed = correct_for_splits(out)
    if fixed:
        print(f"  {label}: split-adjusted {fixed} ticker(s)", flush=True)
    # Drop the working series so the dump stays JSON-serialisable.
    for q in out.values():
        q.pop("_closes", None)
    return out


def main():
    t0 = time.time()
    catalogue = json.loads(CATALOGUE.read_text())

    indices = {}
    for idx_id, idx in catalogue.items():
        symbols = [c["yahoo"] for c in idx["constituents"]]
        quotes = fetch_batch(symbols, idx["name"])

        rows, ok = [], 0
        for c in idx["constituents"]:
            q = quotes.get(c["yahoo"], {"ok": False})
            hit = q.get("ok", False)
            ok += hit
            rows.append({
                "ticker": c["ticker"],
                "yahoo": c["yahoo"],
                "weekChange": q["weekChange"] if hit else None,
                "price": q["price"] if hit else None,
                "asOf": q["asOf"] if hit else None,
            })
        indices[idx_id] = rows
        print(f"  {idx['name']}: {ok} ✓ · {len(rows) - ok} ✗  (failed → unavailable)")

    OUT.write_text(json.dumps({
        "fetchedAt": pd.Timestamp.now(tz="UTC").isoformat(),
        "source": "Yahoo Finance via yfinance",
        "metric": "weekChange",
        "indices": indices,
    }, indent=2))

    total = sum(len(v) for v in indices.values())
    print(f"\n✓ wrote {OUT.relative_to(PROJECT)}")
    print(f"  total tickers: {total}  ·  elapsed: {time.time() - t0:.1f}s")


if __name__ == "__main__":
    main()
