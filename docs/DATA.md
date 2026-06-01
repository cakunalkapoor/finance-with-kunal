# Finance with Kunal — Data & Architecture reference

Deep reference for data sources and component internals. The quick overview is in
[`../CLAUDE.md`](../CLAUDE.md) — read this file only when touching data or a specific component.

---

## Data architecture

**Four live data providers wired in; remainder stays as deterministic mock.** All API keys live in
`.env.local` (gitignored). Refresh any provider via `npm run fetch:<provider>`. Every fetcher writes
its raw output to `src/lib/<provider>-data.json` (these dumps are gitignored — regenerable, consumed
into `mock-data.ts`) and the values are then patched into `src/lib/mock-data.ts`.

### Live data providers

| Provider | Tier | Coverage in this app | Refresh cmd | Key in .env.local |
|---|---|---|---|---|
| **Yahoo Finance** (via `yfinance` Python) | Free, no key needed | 10 equity indices, 4 crypto, 6 FX pairs + US 10Y w/ 1y daily history | `npm run fetch:yahoo` | — |
| **Alpha Vantage** (MCP connector) | Free 25/day | 5 commodities (Brent/WTI/NatGas/Copper/Gold) + US 10Y | `npm run fetch:data` | — (MCP-mediated) |
| **FRED** (St. Louis Fed) | Free, unlimited | 6 sovereign 10Y bonds (US/CA/DE/IN/JP/KR) + US GDP/CPI/Unemployment/Initial Claims | `npm run fetch:fred` | `FRED_API_KEY` |
| **Twelve Data** | Free 800/day, 8/min | **Scaffold only** — proven working, not wired into dashboard yet | `npm run fetch:twelvedata` | `TWELVEDATA_API_KEY` |
| **Finnhub** | Free 60/min | **Scaffold only** — proven working, not wired into dashboard yet | `npm run fetch:finnhub` | `FINNHUB_API_KEY` |

### Fetcher scripts

- `scripts/fetch-yahoo.py` — uses `./.venv/bin/python3` (venv created by `npm run fetch:yahoo:setup`). Returns 1-year daily history per index, computes daily/1W/1M/YTD changes + 52W range + 52-pt sparkline. Output: `src/lib/yahoo-data.json`.
- `scripts/process-alpha-vantage.mjs` — reads previously-saved Alpha Vantage tool-call JSON dumps (one per commodity + treasury), computes derived values. Output: `src/lib/market-data.json`.
- `scripts/fetch-fred.mjs` — reads `FRED_API_KEY` from `.env.local`, hits FRED for 7 bonds + 5 US macro series (DGS10, IRLTLT01<CC>M156N, INDIRLTLT01STM, UNRATE, ICSA, GDPC1, A191RL1Q225SBEA, CPIAUCSL). Output: `src/lib/fred-data.json`.
- `scripts/fetch-twelvedata.mjs` — scaffold demo: batch-quotes 8 US ETFs (SPY/QQQ/IWM/EFA/EEM/TLT/GLD/USO). Exported helpers: `td(endpoint, params)`. Output: `src/lib/twelvedata-data.json`.
- `scripts/fetch-finnhub.mjs` — scaffold demo: fetches Magnificent 7 quotes + profiles + this-week US economic calendar. Exported helpers: `quote/profile/earningsHistory/economicCalendar/ipoCalendar/companyNews`. Output: `src/lib/finnhub-data.json`.

### What each future provider is good at

- **Twelve Data** → backup for Yahoo (international indices, forex, crypto); intraday data. Note: **does NOT have sovereign bonds or PMI**.
- **Finnhub** → company fundamentals (market cap, P/E, EPS), earnings history + transcripts, economic calendar with impact ratings, IPO calendar, insider transactions, company news with sentiment. **Best use case here: power blog-post research and a "this week" macro events widget.**

### What's still curated mock (no free API exists)

- **PMI indicators** (US Composite, China Mfg, India Mfg, Taiwan Mfg, South Korea Mfg, India Services) — paywalled by S&P Global; updated manually each month
- **Heatmap constituents** (~200 stocks across S&P 500 / TSX / NIFTY 50) — would burn through free-tier quotas; values are deterministic via `seededChange()` in mock-data

Numbers in the heatmap and remaining mock entries are **deterministic** (seeded RNG so SSR and CSR match) — avoids React hydration warnings.

---

## Major datasets in `mock-data.ts`

| Export | What it powers |
|--------|----------------|
| `EQUITY_INDICES` | The 10 equity indices on /markets — S&P 500, NASDAQ 100, Shanghai, Nikkei, NIFTY 50, DAX, FTSE, CAC, TSX, KOSPI. Each has `value`, `dailyChange`, `weekChange`, `monthChange`, `ytdChange`, `high52w`, `low52w`, and a 52-point weekly `sparkline` array |
| `BOND_YIELDS` | 10Y govt bonds for US, DE, GB, CA, JP, IN, KR, AU, ZA with daily/1M/1Y moves and a 12-point trend |
| `COMMODITIES` | Brent, WTI, Gold, Silver, Copper, Aluminum, Iron Ore, Soybeans, Natural Gas (9 total) |
| `CRYPTO` | Bitcoin, Ethereum, Solana, BNB spot prices (typed `CryptoAsset[]`, not `Commodity[]`) |
| `FOREX_RATES` | US Dollar Index + EUR / GBP / JPY / CAD / INR vs USD |
| `HEATMAP_INDICES` | Three heatmap variants — S&P 500 (101 constituents, 11 sectors), S&P/TSX (56 constituents, 9 sectors), NIFTY 50 (all 50 constituents, 9 sectors). Built via `buildSector([ticker, weight])` helper. |
| `ECONOMIC_INDICATORS` | All economic-dashboard cards. Categories: `pmi`, `growth`, `employment`, `inflation`, `energy` |
| `MACRO_SNAPSHOT` | The 5 hero tiles on /dashboard top (also reused on the homepage): GDP, Global PMI, Inflation, Jobs, Oil |
| `EXTERNAL_COMMENTARY` | 6 curated external headlines on the homepage, linking to Reuters/Bloomberg/FT/WSJ/Economist/MarketWatch |
| `BLOG_POSTS` | Sample posts (unused — blog is Coming Soon) |

### Economic indicators currently present
- **PMI:** US Composite PMI, China Manufacturing PMI, India Manufacturing PMI, Taiwan Manufacturing PMI, South Korea Manufacturing PMI, India Services PMI
- **Growth:** US GDP, China GDP, India GDP
- **Employment:** US Initial Jobless Claims, US Unemployment Rate
- **Inflation:** US CPI
- **Energy:** Brent Crude Oil, Natural Gas (Henry Hub)

When adding a new indicator: append to `ECONOMIC_INDICATORS` with the right `category`, set
`isPositiveGood` correctly (e.g. unemployment, inflation, claims are `false`), and ensure `category`
is listed in the dashboard page's `CATEGORIES` array.

### Ticker name resolution
`src/lib/ticker-names.ts` exports `TICKER_NAMES: Record<string, string>` and `getCompanyName(ticker)`.
Used by the heatmap tooltip to show "TD → TD Bank", "BRK.B → Berkshire Hathaway", etc. Covers all
~210 unique tickers across the three indices. When adding new tickers to `HEATMAP_INDICES`, add the
corresponding company name here.

---

## Key component behavior

### `MarketHeatmap.tsx`
- 3-tab switcher (S&P 500 / TSX / NIFTY 50) — driven by `useState`
- ECharts treemap, **SVG renderer** (NOT canvas — canvas dropped text labels when the custom font wasn't ready at first paint). A `fontReady` state + `key={`${activeId}-${fontReady}`}` forces a clean remount once `document.fonts.ready` resolves.
- Treemap pinned to all 4 edges (`left/top/right/bottom: 0`), `visibleMin: 400` to skip unreadable micro-tiles
- Height fixed at 640px, label font 10px Space Mono
- Hover tooltip: ticker + **company name** + % change + sector weight (for stocks); sector name + change for parent tiles

### `EquityMarketsTable.tsx`
- 7 columns: Index · Last · 1W · 1M · YTD · **52W Range** · **Chart (YTD/52W toggle)**
- 52W Range column shows H/L values plus a custom horizontal bar with a glowing violet dot marking current position in the range
- Chart toggle in the header switches all 10 sparklines simultaneously between YTD (last 22 weeks) and 52W (full series); sparkline color follows the trend of the *visible* window

### `EconomicChart.tsx`
- Per-indicator card with horizon tabs (3M / 6M / 1Y / 3Y / 5Y)
- Color (green / red) inverts based on `isPositiveGood` so e.g. falling inflation is shown green
- Horizon window anchors to the most recent data point (not a hardcoded date)
- SVG renderer, smooth area chart

### `MacroSnapshot.tsx`
- 6 tiles, pulled from `MACRO_SNAPSHOT` (icon, value, trend arrow, label, sub-context)
- Used at the top of `/dashboard` (with its header) and on the homepage via `showHeader={false}`

### `PageHeader.tsx`
- All three top-level pages use this. Pass `label`, `labelColor`, `title`, `lastUpdated`, `nextUpdate`.
- `Last Updated` / `Next Update` are currently hardcoded per-page in `page.tsx`. Update those strings when you publish new data.

---

## Status

**Done:**
- Full visual design system (light violet palette, sci-fi cards, gradient hero)
- All three top-level pages with their datasets, charts, and tables
- Homepage Market Snapshot + Economic Snapshot sections
- Three-index market heatmap with company-name tooltips
- 52W range column and YTD/52W chart toggle in the equity table
- Global PMI section + regional PMIs (China, India, Taiwan, South Korea) in the Economy dashboard
- Blog page set to Coming Soon; individual post routes still exist but are not linked
- Branded OG/social card (`opengraph-image.tsx`) + full `openGraph`/`twitter` metadata
- GitHub Pages workflow (`.github/workflows/deploy.yml`); `next.config.ts` supports optional `NEXT_PUBLIC_BASE_PATH` for project-page hosting
- Static export build passes cleanly

**Not yet built:**
- Real API integration layer — `src/lib/api/` is empty (fetchers patch into `mock-data.ts` instead)
- Blog post markdown/MDX content pipeline — current posts are just metadata in `BLOG_POSTS`
- Custom domain (set `NEXT_PUBLIC_SITE_URL` for OG absolute URLs once chosen)
- Search, RSS, newsletter signup
- Mobile polish on the heatmap (treemap labels get tight on narrow screens)
- Data refresh automation
