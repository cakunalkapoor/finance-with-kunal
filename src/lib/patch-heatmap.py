#!/usr/bin/env python3
"""
Patch src/lib/site-data.ts with the heatmap section for all 11 indices.

Reads:  src/lib/heatmap-catalogue.json  (membership + published index weights)
        src/lib/heatmap-sectors.json    (ticker → sector, cached)
        src/lib/heatmap-data.json       (live weekly % change)
Writes: replaces the heatmap section in site-data.ts (SP500_SECTORS through the
        HEATMAP_DATA export, inclusive).

For each constituent:
  - value  = published index weight, renormalised over the names we carry
  - change = WEEKLY change % from Yahoo Finance, or null when unavailable

Sector aggregates:
  - sector value  = sum of constituent weights
  - sector change = weight-weighted average over constituents that HAVE a quote,
                    so a few missing quotes bias the sector toward the names that
                    did report rather than dragging it toward zero.

Run: npm run patch:heatmap
"""

import json
from pathlib import Path

PROJECT = Path(__file__).resolve().parent.parent.parent
CATALOGUE = PROJECT / "src" / "lib" / "heatmap-catalogue.json"
SECTORS = PROJECT / "src" / "lib" / "heatmap-sectors.json"
DATA = PROJECT / "src" / "lib" / "heatmap-data.json"
SITE = PROJECT / "src" / "lib" / "site-data.ts"

SECTOR_ORDER = [
    "Technology", "Financials", "Consumer Disc.", "Consumer Staples",
    "Communication", "Healthcare", "Industrials", "Energy", "Materials",
    "Utilities", "Real Estate", "Other",
]

DESCRIPTION = "1-week % change · tile size = index weight · source: Yahoo Finance"


def ts_escape(s):
    return s.replace("\\", "\\\\").replace('"', '\\"')


def build_sectors_ts(var_name, constituents, sectors_map, quotes_by_ticker):
    """Generate `const VAR_SECTORS: HeatmapSector[] = [...];`."""
    grouped = {}
    for c in constituents:
        sector = sectors_map.get(c["yahoo"], {}).get("sector", "Other")
        grouped.setdefault(sector, []).append(c)

    lines = [f"const {var_name}_SECTORS: HeatmapSector[] = ["]
    for sector in SECTOR_ORDER:
        members = grouped.get(sector)
        if not members:
            continue
        children, total_w, weighted, available_w = [], 0.0, 0.0, 0.0
        for c in sorted(members, key=lambda x: -x["weight"]):
            q = quotes_by_ticker.get(c["ticker"], {})
            raw = q.get("weekChange")
            wk = float(raw) if raw is not None and q.get("asOf") else None
            weight = c["weight"]
            # `yahoo` is carried through rather than re-derived in the UI: the
            # exchange quirks (LSE trailing dots, HK zero-padding, share-class
            # dashes) are already resolved in the catalogue, and a second
            # implementation in TS would be free to drift out of agreement with
            # the symbol the price was actually fetched under.
            children.append(
                f'      {{ name: "{ts_escape(c["ticker"])}", ticker: "{ts_escape(c["ticker"])}", '
                f'yahoo: "{ts_escape(c["yahoo"])}", '
                f'value: {weight}, change: {"null" if wk is None else wk} }}'
            )
            total_w += weight
            if wk is not None:
                weighted += wk * weight
                available_w += weight
        lines.append("  {")
        lines.append(f'    name: "{sector}",')
        lines.append(f"    value: {round(total_w, 4)},")
        lines.append(f"    change: {round(weighted / available_w, 2) if available_w else 0.0},")
        lines.append("    children: [")
        lines.append(",\n".join(children) + ",")
        lines.append("    ],")
        lines.append("  },")
    lines.append("];")
    return "\n".join(lines)


def main():
    catalogue = json.loads(CATALOGUE.read_text())
    sectors_map = json.loads(SECTORS.read_text())
    live = json.loads(DATA.read_text())["indices"]

    blocks, index_rows, counts = [], [], {}
    for idx_id, idx in catalogue.items():
        var = idx_id.upper()
        quotes_by_ticker = {r["ticker"]: r for r in live.get(idx_id, [])}
        blocks.append(build_sectors_ts(var, idx["constituents"], sectors_map, quotes_by_ticker))
        index_rows.append(
            f'  {{ id: "{idx_id}", name: "{idx["name"]}", flag: "{idx["flag"]}", '
            f'description: "{DESCRIPTION}", sectors: {var}_SECTORS }},'
        )
        counts[idx_id] = len(idx["constituents"])

    total = sum(counts.values())
    header = f"""// ─────────────────────────────────────────────────────────────────────────────
// HEATMAP CONSTITUENTS — LIVE WEEKLY % CHANGE from Yahoo Finance (yfinance)
//
// GENERATED — do not edit by hand. Regenerate with:
//   npm run build:catalogue && npm run fetch:sectors
//   npm run fetch:heatmap   && npm run patch:heatmap
//
// 11 indices, {total} constituents. Each ticker carries:
//   - value:  published index weight (%), renormalised over the names carried
//   - change: WEEKLY change % (last close vs ~5 trading days ago), or null
//
// Membership and weights come from data/index-constituents.xlsx; sectors are
// Yahoo's, mapped to one 11-sector taxonomy shared by every index.
// ─────────────────────────────────────────────────────────────────────────────
"""

    tail = (
        "export const HEATMAP_INDICES: HeatmapIndex[] = [\n"
        + "\n".join(index_rows)
        + "\n];\n\n// Back-compat default export (S&P 500)\n"
        + "export const HEATMAP_DATA: HeatmapSector[] = SP500_SECTORS;\n"
    )

    src = SITE.read_text()
    si = src.find("const SP500_SECTORS: HeatmapSector[] = [")
    ei = src.find("export const HEATMAP_DATA: HeatmapSector[]")
    if si == -1 or ei == -1:
        raise RuntimeError("could not locate replacement markers in site-data.ts")
    end = src.find("\n", ei) + 1

    # Drop the previous generated header comment sitting above the start marker.
    pre_lines = src[:si].rstrip().splitlines()
    while pre_lines and (pre_lines[-1].lstrip().startswith("//") or not pre_lines[-1].strip()):
        pre_lines.pop()
    pre = "\n".join(pre_lines) + "\n\n"

    SITE.write_text(pre + header + "\n\n".join(blocks) + "\n\n" + tail + src[end:])

    print("✓ patched site-data.ts")
    for k, c in counts.items():
        quoted = sum(1 for r in live.get(k, []) if r.get("weekChange") is not None)
        print(f"  {k:10} {c:>4} tickers · {quoted:>4} quoted")
    print(f"  {'─' * 30}\n  Total: {total} constituents across {len(counts)} indices")


if __name__ == "__main__":
    main()
