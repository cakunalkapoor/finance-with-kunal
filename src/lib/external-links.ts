// Outbound "dive deeper" links for the Markets page.
//
// Two destinations, chosen per dataset for a reason:
//
//   • Indices and government bonds → Investing.com. Small, fixed sets (11 and 9),
//     and Investing.com has stable hand-written slugs with the depth Kunal wants
//     (technicals, forecasts, contributor commentary). Every slug below was
//     opened and confirmed to resolve to the right instrument on 2026-08-09.
//
//   • Heatmap constituents → Yahoo Finance. 564 tickers across 11 exchanges;
//     Investing.com equity URLs need a per-company slug (/equities/apple-computer-inc)
//     that cannot be derived from a ticker, and its /search/?q= fallback lands on a
//     results page rather than a quote. Yahoo symbols ARE derivable, and Yahoo is
//     already this site's price source — so the linked page shows the same numbers
//     the tile does.

/** Investing.com index pages, keyed by `IndexQuote.symbol`. */
export const INVESTING_INDEX_URL: Record<string, string> = {
  "^GSPC":     "https://www.investing.com/indices/us-spx-500",
  "^NDX":      "https://www.investing.com/indices/nq-100",
  "000001.SS": "https://www.investing.com/indices/shanghai-composite",
  "^N225":     "https://www.investing.com/indices/japan-ni225",
  "^NSEI":     "https://www.investing.com/indices/s-p-cnx-nifty",
  "^GDAXI":    "https://www.investing.com/indices/germany-30",
  "^FTSE":     "https://www.investing.com/indices/uk-100",
  "^FCHI":     "https://www.investing.com/indices/france-40",
  "^GSPTSE":   "https://www.investing.com/indices/s-p-tsx-composite",
  "^KS11":     "https://www.investing.com/indices/kospi",
  "^TWII":     "https://www.investing.com/indices/taiwan-weighted",
};

/** Investing.com 10Y government bond pages, keyed by `BondYield.country`. */
export const INVESTING_BOND_URL: Record<string, string> = {
  "United States":  "https://www.investing.com/rates-bonds/u.s.-10-year-bond-yield",
  "Germany":        "https://www.investing.com/rates-bonds/germany-10-year-bond-yield",
  "United Kingdom": "https://www.investing.com/rates-bonds/uk-10-year-bond-yield",
  "Canada":         "https://www.investing.com/rates-bonds/canada-10-year-bond-yield",
  "Japan":          "https://www.investing.com/rates-bonds/japan-10-year-bond-yield",
  "India":          "https://www.investing.com/rates-bonds/india-10-year-bond-yield",
  "South Korea":    "https://www.investing.com/rates-bonds/south-korea-10-year-bond-yield",
  "Australia":      "https://www.investing.com/rates-bonds/australia-10-year-bond-yield",
  "South Africa":   "https://www.investing.com/rates-bonds/south-africa-10-year-bond-yield",
};

// Yahoo exchange suffix per heatmap index id. `site-data.ts` stores the plain
// local ticker (RY, 9983, HDFCBANK); Yahoo wants the exchange-qualified symbol.
const YAHOO_SUFFIX: Record<string, string> = {
  sp500:   "",
  ndx:     "",
  tsx:     ".TO",
  ftse:    ".L",
  dax:     ".DE",
  cac:     ".PA",
  nifty50: ".NS",
  nikkei:  ".T",
  sse:     ".SS",
  kospi:   ".KS",
  twse:    ".TW",
};

// Teck is carried here as TECK but quoted on Yahoo as its class-B line.
const YAHOO_SYMBOL_OVERRIDES: Record<string, string> = {
  "tsx:TECK": "TECK-B.TO",
};

/**
 * Yahoo Finance quote URL for a heatmap constituent, or `null` for an unknown
 * index id (so a caller can fall back to rendering a non-clickable tile).
 *
 * Two ticker quirks, in order:
 *   1. A TRAILING dot is an LSE ordinary-line marker, not a share class — Yahoo
 *      drops it (BA. → BA.L, AV. → AV.L). Note `fetch-heatmap.py::yahoo_ftse`
 *      currently dashes these instead (BA. → BA-.L), which is why those seven
 *      FTSE tiles come back with a null price; we deliberately do NOT copy that.
 *   2. An INTERIOR dot is a share class, which Yahoo writes as a dash
 *      (BRK.B → BRK-B, BT.A → BT-A.L, CAR.UN → CAR-UN.TO).
 */
export function yahooQuoteUrl(indexId: string, ticker: string): string | null {
  const suffix = YAHOO_SUFFIX[indexId];
  if (suffix === undefined) return null;
  const symbol =
    YAHOO_SYMBOL_OVERRIDES[`${indexId}:${ticker}`] ??
    `${ticker.replace(/\.+$/, "").replace(/\./g, "-")}${suffix}`;
  return `https://finance.yahoo.com/quote/${encodeURIComponent(symbol)}`;
}
