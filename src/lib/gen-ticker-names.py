#!/usr/bin/env python3
"""
Generate src/lib/ticker-names.ts — the heatmap tooltip's symbol → company name
lookup.

Reads:  src/lib/heatmap-catalogue.json
        src/lib/heatmap-sectors.json

The map is keyed by the exchange-qualified Yahoo symbol, not the bare ticker.
Bare tickers are not unique across the 11 indices — `T` is AT&T in the S&P 500
and Telus on the TSX, `AIR` is Airbus on both the DAX and the CAC, `MRK` is
Merck & Co. in the US and Merck KGaA in Germany — so the previous flat
ticker-keyed map silently showed the wrong company for those tiles.

Run: npm run gen:ticker-names
"""

import json
from pathlib import Path

PROJECT = Path(__file__).resolve().parent.parent.parent
CATALOGUE = PROJECT / "src" / "lib" / "heatmap-catalogue.json"
SECTORS = PROJECT / "src" / "lib" / "heatmap-sectors.json"
OUT = PROJECT / "src" / "lib" / "ticker-names.ts"

HEADER = """// Symbol → full company name lookup for heatmap tooltips.
//
// GENERATED — do not edit by hand. Regenerate with: npm run gen:ticker-names
//
// Keyed by the exchange-qualified Yahoo symbol (0700.HK, BA.L, BRK-B) rather
// than the bare ticker, because bare tickers collide across the 11 indices:
// `T` is AT&T in the S&P 500 but Telus on the TSX, `AIR` is Airbus on both the
// DAX and the CAC, `MRK` is Merck & Co. in the US and Merck KGaA in Germany.
export const TICKER_NAMES: Record<string, string> = {
"""

FOOTER = """};

/**
 * Company name for a heatmap tile, or `null` when unknown.
 *
 * Prefer the constituent's `yahoo` symbol. `ticker` is accepted as a fallback
 * for any tile authored without one, but note it can be ambiguous across
 * indices — the symbol lookup is the correct one.
 */
export function getCompanyName(symbol: string, ticker?: string): string | null {
  return TICKER_NAMES[symbol] ?? (ticker ? TICKER_NAMES[ticker] ?? null : null);
}
"""


def esc(s):
    return s.replace("\\", "\\\\").replace('"', '\\"')


def main():
    catalogue = json.loads(CATALOGUE.read_text())
    sectors = json.loads(SECTORS.read_text())

    lines, seen = [], set()
    for idx_id, idx in catalogue.items():
        rows = []
        for c in idx["constituents"]:
            sym = c["yahoo"]
            if sym in seen:
                continue  # a name in two indices (AAPL is in both S&P 500 and NDX)
            seen.add(sym)
            name = sectors.get(sym, {}).get("name") or c["name"]
            rows.append(f'  "{esc(sym)}": "{esc(name)}",')
        if rows:
            lines.append(f"  // ── {idx['name']} " + "─" * max(0, 60 - len(idx["name"])))
            lines.extend(rows)
            lines.append("")

    OUT.write_text(HEADER + "\n".join(lines).rstrip() + "\n" + FOOTER)
    print(f"✓ wrote {OUT.relative_to(PROJECT)}  ·  {len(seen)} symbols")


if __name__ == "__main__":
    main()
