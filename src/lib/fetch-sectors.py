#!/usr/bin/env python3
"""
Resolve GICS-style sector + company name for every heatmap constituent.

Reads:  src/lib/heatmap-catalogue.json
Writes: src/lib/heatmap-sectors.json   (committed — this is a cache, not a feed)

Sector is a slow per-ticker lookup (Yahoo has no batch endpoint for it) but it
is also near-static: a company changes sector once in a decade. So this runs
INCREMENTALLY — only symbols missing from the cache are fetched. A normal
weekly refresh resolves nothing and finishes instantly; only an index rebalance
that introduces new names costs anything.

Yahoo rate-limits this endpoint hard: ~800 requests in a burst earns a global
429 that then fails everything for several minutes. Two consequences shape the
code below:

  1. Concurrency is low and there is a delay between requests. Resolving the
     full 1.5k catalogue from cold takes ~15 min. That is a once-ever cost.
  2. A throttled symbol is NEVER written to the cache. Only a definitive answer
     is cached — either a real sector, or a 404 recorded as {"resolved": false}
     so a delisted ticker is not retried forever. Re-running the script picks up
     exactly what is still missing, so an interrupted run is safe to resume.

Flags:
  --refresh   discard the cache and re-resolve everything
  --workers N concurrency (default 3)

Run: npm run fetch:sectors
"""

import json
import sys
import threading
import time
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

import yfinance as yf

PROJECT = Path(__file__).resolve().parent.parent.parent
CATALOGUE = PROJECT / "src" / "lib" / "heatmap-catalogue.json"
OUT = PROJECT / "src" / "lib" / "heatmap-sectors.json"

# Yahoo's sector vocabulary → the labels the heatmaps display. The site used to
# carry a different, ad-hoc sector set per index ("Luxury", "Trading", "Banks",
# "Internet"), which made two heatmaps impossible to compare. One taxonomy
# across all 11 indices is the point of routing through Yahoo here.
SECTOR_LABELS = {
    "Technology":             "Technology",
    "Financial Services":     "Financials",
    "Consumer Cyclical":      "Consumer Disc.",
    "Consumer Defensive":     "Consumer Staples",
    "Communication Services": "Communication",
    "Healthcare":             "Healthcare",
    "Industrials":            "Industrials",
    "Energy":                 "Energy",
    "Basic Materials":        "Materials",
    "Utilities":              "Utilities",
    "Real Estate":            "Real Estate",
}

# Order sectors appear in the treemap, so tile layout is stable across indices
# and across refreshes rather than following dict insertion order.
SECTOR_ORDER = [
    "Technology", "Financials", "Consumer Disc.", "Consumer Staples",
    "Communication", "Healthcare", "Industrials", "Energy", "Materials",
    "Utilities", "Real Estate", "Other",
]

THROTTLED = ("too many requests", "rate limit", "invalid crumb", "unauthorized")

_pace = threading.Lock()
_last = [0.0]
# Seconds between request starts, across all workers. Measured empirically:
# ~3 req/s sails through ~800 symbols and then earns a multi-minute global 429
# that fails everything after it. ~1 req/s sustains the full catalogue.
DELAY = 1.0


def _throttle():
    with _pace:
        wait = DELAY - (time.time() - _last[0])
        if wait > 0:
            time.sleep(wait)
        _last[0] = time.time()


class Throttled(Exception):
    pass


def _write(cache):
    """Atomic write — a checkpoint interrupted mid-flush must not truncate the
    cache that the next run depends on."""
    tmp = OUT.with_suffix(".json.tmp")
    tmp.write_text(json.dumps(cache, indent=2, ensure_ascii=False, sort_keys=True))
    tmp.replace(OUT)


def resolve(symbol):
    """
    → (sector, name)          definitive answer, cache it
    → (None, None)            definitively unknown (404 / no sector), cache as unresolved
    raises Throttled          transient, do NOT cache

    Retries a throttle a few times with a widening backoff before giving up, so
    a brief burst of 429s does not abort the whole run.
    """
    for attempt in range(4):
        _throttle()
        try:
            info = yf.Ticker(symbol).info
        except Exception as e:
            msg = str(e).lower()
            if any(t in msg for t in THROTTLED):
                time.sleep(5 * (attempt + 1))
                continue
            return None, None  # 404 and friends: the symbol genuinely isn't there
        raw = info.get("sector")
        if not raw:
            return None, None
        return SECTOR_LABELS.get(raw, "Other"), (info.get("longName") or info.get("shortName"))
    raise Throttled(symbol)


def main():
    refresh = "--refresh" in sys.argv
    workers = 3
    if "--workers" in sys.argv:
        workers = int(sys.argv[sys.argv.index("--workers") + 1])

    catalogue = json.loads(CATALOGUE.read_text())
    cache = {} if refresh or not OUT.exists() else json.loads(OUT.read_text())

    wanted = {
        c["yahoo"]: c["name"]
        for idx in catalogue.values()
        for c in idx["constituents"]
    }
    missing = [s for s in wanted if s not in cache]

    print(f"catalogue: {len(wanted)} symbols · cached: {len(wanted) - len(missing)} · to resolve: {len(missing)}")

    throttled = 0
    if missing:
        done = 0
        lock = threading.Lock()

        def work(symbol):
            nonlocal done, throttled
            try:
                sector, name = resolve(symbol)
                # Yahoo's name is better punctuated for US/EU listings, but for
                # Asian exchanges it is often truncated or romanised oddly
                # ("SamsungElec"). Fall back to the workbook's name when Yahoo
                # gives nothing useful.
                fallback = wanted[symbol]
                entry = (
                    {"sector": "Other", "name": fallback, "resolved": False}
                    if sector is None
                    else {"sector": sector,
                          "name": name if name and name.upper() != symbol.upper() else fallback}
                )
            except Throttled:
                with lock:
                    throttled += 1
                return
            with lock:
                cache[symbol] = entry
                done += 1
                # Checkpoint. A cold run takes ~20 min against Yahoo's pacing,
                # long enough that it will sometimes be interrupted; without
                # this every resolved symbol would be lost and the next run
                # would start from zero.
                if done % 50 == 0:
                    _write(cache)
                    print(f"  {done}/{len(missing)}", flush=True)

        with ThreadPoolExecutor(max_workers=workers) as pool:
            list(pool.map(work, missing))

    # Drop symbols the catalogue no longer references, so a rebalance (or a
    # corrected SYMBOL_OVERRIDES entry) does not leave the cache accumulating
    # entries for listings nothing points at any more.
    orphans = [s for s in cache if s not in wanted]
    for s in orphans:
        del cache[s]
    if orphans:
        print(f"pruned {len(orphans)} symbols no longer in the catalogue")

    _write(cache)

    counts, unresolved = {}, 0
    for s in wanted:
        entry = cache.get(s)
        if entry is None:
            continue
        counts[entry["sector"]] = counts.get(entry["sector"], 0) + 1
        if entry.get("resolved") is False:
            unresolved += 1

    print(f"\n✓ wrote {OUT.relative_to(PROJECT)}  ·  {len(cache)}/{len(wanted)} symbols")
    for sector in SECTOR_ORDER:
        if sector in counts:
            print(f"  {sector:18} {counts[sector]:>4}")
    if unresolved:
        print(f"  ({unresolved} had no sector on Yahoo — grouped under Other)")
    if throttled:
        print(f"\n⚠ {throttled} symbols still rate-limited. Re-run to pick them up.")
        sys.exit(1)


if __name__ == "__main__":
    main()
