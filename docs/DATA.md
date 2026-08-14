# Finance with Kunal — Data & Architecture reference

Deep reference for data sources and component internals. The quick overview is in
[`../CLAUDE.md`](../CLAUDE.md) — read this file only when touching data or a specific component.

---

## Data architecture

**Four active upstream services are wired in, plus two provider scaffolds.** All API keys live in
`.env.local` (gitignored). Refresh any provider via `npm run fetch:<provider>`. Every fetcher writes
its raw output to `src/lib/<provider>-data.json` (these dumps are gitignored — regenerable, consumed
into `site-data.ts`) and the values are then patched into `src/lib/site-data.ts`.

### Live data providers

| Provider | Tier | Coverage in this app | Refresh cmd | Key in .env.local |
|---|---|---|---|---|
| **Yahoo Finance** (via `yfinance` Python) | Free, no key needed | 12 equity indices, 9 commodities, 4 crypto, 6 FX pairs, and 1,618 heatmap constituents | `npm run fetch:yahoo`; `npm run fetch:heatmap` | — |
| **FRED** (St. Louis Fed) | Free | US macro data, six non-Canadian sovereign 10Y series, and the US 30Y (DGS30) | `npm run fetch:fred` | `FRED_API_KEY` |
| **Bank of Canada Valet** | Free | Bank of Canada policy rate, Canadian CPI, and daily Canada 10Y + long-term benchmark yields | `npm run fetch:boc` | — |
| **Statistics Canada WDS** | Free | Canadian employment, trade, retail sales, government revenue, and GDP (quarterly + monthly) | `npm run fetch:statcan` | — |
| **Twelve Data** | Free 800/day, 8/min | **Scaffold only** — proven working, not wired into dashboard yet | `npm run fetch:twelvedata` | `TWELVEDATA_API_KEY` |
| **Finnhub** | Free 60/min | **Scaffold only** — proven working, not wired into dashboard yet | `npm run fetch:finnhub` | `FINNHUB_API_KEY` |

### Fetcher scripts

- `src/lib/fetch-yahoo.py` — uses `./.venv/bin/python3` (venv created by `npm run fetch:yahoo:setup`). Returns 1-year daily history per index, computes daily/1W/1M/YTD changes + 52W range + 52-pt sparkline. Output: `src/lib/yahoo-data.json`.
- `src/lib/build-catalogue.py` — turns the index membership workbook into the heatmap constituent catalogue (top 250 per index, renormalised weights, resolved Yahoo symbols). Output: `src/lib/heatmap-catalogue.json`. See [The heatmap pipeline](#the-heatmap-pipeline).
- `src/lib/fetch-sectors.py` — incremental, rate-limit-aware sector + company-name resolver. Output: `src/lib/heatmap-sectors.json` (**committed** — a cache, not a regenerable dump).
- `src/lib/fetch-heatmap.py` — batch weekly % change for every catalogue constituent. Output: `src/lib/heatmap-data.json`.
- `src/lib/gen-ticker-names.py` — regenerates `src/lib/ticker-names.ts` from the catalogue + sector cache.
- `src/lib/process-alpha-vantage.mjs` — reads previously-saved Alpha Vantage tool-call JSON dumps (one per commodity + treasury), computes derived values. Output: `src/lib/market-data.json`.
- `src/lib/fetch-fred.mjs` — reads `FRED_API_KEY` from `.env.local`, fetches US macro series and foreign 10Y yields, and preserves full dates for weekly claims. Output: `src/lib/fred-data.json`.
- `src/lib/fetch-boc.mjs` — fetches Canadian policy, CPI, and 10Y yield data from the Bank of Canada Valet API. Output: `src/lib/boc-data.json`.
- `src/lib/fetch-statcan.mjs` — fetches Canadian macro series from Statistics Canada. Output: `src/lib/statcan-data.json`.
  Canada GDP is sourced here rather than from FRED: FRED's OECD mirror (`NAEXKP01CAQ657S`) carries the
  same figure but lags StatCan's own release by ~2.5 weeks (Q1 2026 was published May 29 and reached
  FRED June 15). Quarterly GDP is table 36-10-0104 (vector 62305752) as a plain, **not annualised**,
  QoQ % — that is what the card has always shown, and computing it this way reproduces the OECD
  figure exactly. Monthly GDP by industry is table 36-10-0434 (vector 65201210) as MoM %, and runs
  ~4 months ahead of the quarterly series.
- `src/lib/fetch-twelvedata.mjs` — scaffold demo: batch-quotes 8 US ETFs (SPY/QQQ/IWM/EFA/EEM/TLT/GLD/USO). Exported helpers: `td(endpoint, params)`. Output: `src/lib/twelvedata-data.json`.
- `src/lib/fetch-finnhub.mjs` — scaffold demo: fetches Magnificent 7 quotes + profiles + this-week US economic calendar. Exported helpers: `quote/profile/earningsHistory/economicCalendar/ipoCalendar/companyNews`. Output: `src/lib/finnhub-data.json`.

### What each future provider is good at

- **Twelve Data** → backup for Yahoo (international indices, forex, crypto); intraday data. Note: **does NOT have sovereign bonds or PMI**.
- **Finnhub** → company fundamentals (market cap, P/E, EPS), earnings history + transcripts, economic calendar with impact ratings, IPO calendar, insider transactions, company news with sentiment. **Best use case here: power blog-post research and a "this week" macro events widget.**

### What's still manually curated

- **PMI indicators** — licensed S&P Global series are updated manually each month.
  The macro-snapshot PMI tile deliberately uses **China's NBS official manufacturing
  PMI**, not the J.P.Morgan Global Composite PMI it previously showed. The JPM/S&P
  global series has no free feed and its monthly press release is not publicly
  retrievable, so that tile could be neither refreshed automatically nor
  independently verified, and it sat undated on the homepage a month after being
  superseded. NBS publishes free and monthly on the last day of each month.
  Don't reinstate a global composite unless a checkable source comes with it.
- **China and India GDP cards** — updated from official NBS and MoSPI releases until dedicated adapters are added.
- **Index P/E (`pe`, `pe10yAvg`)** — no free provider supplies index-level P/E, so both are typed
  optional and hand-entered in `site-data.ts`. An index without them renders a dash in the
  Valuation column rather than a made-up multiple. **Hang Seng (`^HSI`) currently has none** —
  add both when you have a source you trust for the trailing P/E and its 10-year average.

Heatmap weekly changes are live Yahoo observations. Missing quotes are stored as `null`, rendered as
`N/A`, and excluded from sector-return calculations; they must never default to a neutral 0% change.

---

## The heatmap pipeline

Four stages, each writing an artefact the next one reads. Only stage 3 needs to run on the weekly
refresh; stages 1–2 change only when index membership does.

| # | Command | Reads | Writes |
|---|---|---|---|
| 1 | `npm run build:catalogue` | `data/index-constituents.xlsx` | `src/lib/heatmap-catalogue.json` |
| 2 | `npm run fetch:sectors` | the catalogue | `src/lib/heatmap-sectors.json` |
| 3 | `npm run fetch:heatmap` | the catalogue | `src/lib/heatmap-data.json` |
| 4 | `npm run patch:heatmap` | all three | the heatmap section of `site-data.ts` |

**Membership and weights** come from `data/index-constituents.xlsx` — published index weights for all
11 indices, so tile area is the real index weight rather than a hand-tuned estimate. Two of the
workbook's sheets are whole-market listings rather than index membership (TAIEX 1,093 rows, KOSPI
829), and the S&P 500's tail falls under the treemap's `visibleMin`, so `build-catalogue.py` cuts
every index to its top 250 names by weight and renormalises to 100%. Coverage stays ≥91% of each
index's weight (TAIEX ~96%, KOSPI ~97%, S&P 500 ~91%); the other eight indices are carried whole.

**Sectors** come from Yahoo, mapped to one 11-sector taxonomy shared by every index. Each index used
to carry its own ad-hoc sector set (`Luxury`, `Trading`, `Banks`, `Internet`), which made two
heatmaps impossible to compare. `heatmap-sectors.json` is a **committed cache, not a feed** — sector
membership is near-static, so the fetch is incremental and a normal weekly refresh resolves nothing.

> Yahoo rate-limits the per-symbol profile endpoint hard: ~3 req/s sails through ~800 symbols and
> then earns a multi-minute global 429 that fails everything after it. `fetch-sectors.py` paces at
> ~1 req/s, checkpoints every 50 symbols, and never caches a throttled symbol — so an interrupted
> run resumes rather than restarting, and re-running picks up exactly what is still missing. A cold
> run over the full catalogue takes ~20 minutes.

**Yahoo symbols** are resolved once, in the catalogue, and carried through to each tile as
`HeatmapStock.yahoo`. The exchange conventions are not reproducible from a bare ticker — an LSE
trailing dot is dropped (`BA.` → `BA.L`) while an interior dot becomes a dash (`BT.A` → `BT-A.L`),
and HK codes are stored 5-digit but quoted 4-digit (`00700` → `0700.HK`) — so deriving them a second
time in TypeScript for the tile's click-through was a standing source of drift. `SYMBOL_OVERRIDES`
in `build-catalogue.py` covers the four the rules cannot reach (`BRKB` → `BRK-B`, `QGEN` →
`QIA.DE`, `STLAM` → `STLAP.PA`, `MT` → `MT.AS`).

---

## Major datasets in `site-data.ts`

| Export | What it powers |
|--------|----------------|
| `EQUITY_INDICES` | The 12 equity indices on /markets, each with price, return, range, volatility, and sparkline fields |
| `BOND_YIELDS` | 10Y govt bonds for US, DE, GB, CA, JP, IN, KR, AU, ZA with daily/1M/1Y moves and a 12-point trend |
| `YIELD_CURVES` | US and Canada long-end curves — two tenors with 36-month history plus the spread in bp. **Regenerated wholesale** by `patch-site-data.mjs`; hand edits are overwritten |
| `COMMODITIES` | Brent, WTI, Gold, Silver, Copper, Aluminum, Iron Ore, Soybeans, Natural Gas (9 total) |
| `CRYPTO` | Bitcoin, Ethereum, Solana, BNB spot prices (typed `CryptoAsset[]`, not `Commodity[]`) |
| `FOREX_RATES` | US Dollar Index + EUR / GBP / JPY / CAD / INR vs USD |
| `HEATMAP_INDICES` | 11 regional heatmaps with 1,618 constituent rows and explicit missing-quote handling |
| `ECONOMIC_INDICATORS` | All economic-dashboard cards. Categories: `pmi`, `growth`, `employment`, `inflation`, `energy` |
| `MACRO_SNAPSHOT` | The 6 hero tiles on /dashboard top (also reused on the homepage) |
| `EXTERNAL_COMMENTARY` | 6 curated external headlines on the homepage, linking to Reuters/Bloomberg/FT/WSJ/Economist/MarketWatch |
| `BLOG_POSTS` | Sample posts (unused — blog is Coming Soon) |

### Economic indicators currently present
- **PMI:** US Composite PMI, China Manufacturing PMI, India Manufacturing PMI, Taiwan Manufacturing PMI, South Korea Manufacturing PMI, India Services PMI
- **Growth:** US GDP, Canada GDP (quarterly + monthly), China GDP, India GDP
- **Employment:** US Initial Jobless Claims, US Unemployment Rate
- **Inflation:** US CPI
- **Energy:** Brent Crude Oil, Natural Gas (Henry Hub)

When adding a new indicator: append to `ECONOMIC_INDICATORS` with the right `category`, set
`isPositiveGood` correctly (e.g. unemployment, inflation, claims are `false`), and ensure `category`
is listed in the dashboard page's `CATEGORIES` array.

### Ticker name resolution
`src/lib/ticker-names.ts` exports `TICKER_NAMES: Record<string, string>` and
`getCompanyName(symbol, ticker?)`. Used by the heatmap tooltip to show "TD → TD Bank",
"0700.HK → Tencent Holdings", etc.

**Generated — do not hand-edit**; run `npm run gen:ticker-names`. The map is keyed by the
exchange-qualified Yahoo symbol rather than the bare ticker, because bare tickers collide across the
11 indices: `T` is AT&T in the S&P 500 but Telus on the TSX, `AIR` is Airbus on both the DAX and the
CAC, `MRK` is Merck & Co. in the US and Merck KGaA in Germany. The previous ticker-keyed map showed
the wrong company on those tiles.

---

## Key component behavior

### `MarketHeatmap.tsx`
- 11-index switcher — driven by `useState`
- ECharts treemap, **SVG renderer** (NOT canvas — canvas dropped text labels when the custom font wasn't ready at first paint). A `fontReady` state + `key={`${activeId}-${fontReady}`}` forces a clean remount once `document.fonts.ready` resolves.
- Treemap pinned to all 4 edges (`left/top/right/bottom: 0`), `visibleMin: 400` to skip unreadable micro-tiles
- Height fixed at 640px, label font 10px Space Mono
- Hover tooltip: ticker + **company name** + % change + sector weight (for stocks); missing quotes show `N/A`

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
- The homepage data-refresh label comes from `DATA_UPDATED_AT`, which `patch-site-data.mjs` updates from provider fetch timestamps.

---

## Status

**Done:**
- Full visual design system (light violet palette, sci-fi cards, gradient hero)
- All three top-level pages with their datasets, charts, and tables
- Homepage Market Snapshot + Economic Snapshot sections
- Eleven-index market heatmap with company-name tooltips and quote-coverage status
- 52W range column and YTD/52W chart toggle in the equity table
- PMI section + regional PMIs (China, India, Taiwan, South Korea) in the Economy dashboard
- Blog page set to Coming Soon; individual post routes still exist but are not linked
- Branded OG/social card (`opengraph-image.tsx`) + full `openGraph`/`twitter` metadata
- GitHub Pages workflow (`.github/workflows/deploy.yml`); `next.config.ts` supports optional `NEXT_PUBLIC_BASE_PATH` for project-page hosting
- Static export build passes cleanly

**Not yet built:**
- Real API integration layer — `src/lib/api/` is empty (fetchers patch into `site-data.ts` instead)
- Blog post markdown/MDX content pipeline — current posts are just metadata in `BLOG_POSTS`
- Custom domain (set `NEXT_PUBLIC_SITE_URL` for OG absolute URLs once chosen)
- Search, RSS, newsletter signup
- Mobile polish on the heatmap (treemap labels get tight on narrow screens)
- Repository-hosted data refresh automation and freshness alerts

### Chart horizons are derived, not fixed

`EconomicChart` and `YieldCurveChart` offer only the horizon tabs their own series can
fill (`horizonsFor` in `chart-window.ts`). No macro series here carries more than ~37
monthly points, so the 5Y tab was always a relabelled 3Y; the PMI cards carry 6–7 points
and now stop at 6M. Adding a longer tab means lengthening the series first — raise the
fetcher's `limit`/`months`/`keep` and the tab appears on its own.
