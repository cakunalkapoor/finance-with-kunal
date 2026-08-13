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
            }
        except Exception:
            out[sym] = {"ok": False}
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
