# Finance with Kunal — Data & Architecture reference

Deep reference for data sources and component internals. The quick overview is in
[`../CLAUDE.md`](../CLAUDE.md) — read this file only when touching data or a specific component.

## Refresh — November 5, 2026

Published snapshot dates use America/Vancouver. Refreshed all configured Yahoo markets,
28 AI stocks, 12 AI comparison indices, and the 1,618-constituent heatmap; 1,608
constituent quotes are available. Markets and AI end November 5; the returned crypto
histories end November 4 and keep that date. Weekly commentary uses the saved rolling
weekly returns, rather than implying a completed Friday briefing.

FRED, BoC, StatCan, Eurostat and India CPI checks succeeded. International adapters
refreshed 12 of 17 measures, and the six emerging API measures were refreshed. Three
Japanese HTTP 403 responses and two Korean timeouts retain their prior observations
and explicit failure notes. Curated emerging releases keep their own October 30 or
November 1 review dates. Eurostat unemployment now requests 49 periods to preserve
three full years even when its time dimension extends past the last published reading.
The Economy coverage remains 51 indicators and two yield curves.

All 13 sovereign quotes are dated November 5. Published Investing.com histories supplement
the feeds; independent Trading Economics cross-checks retain their own dates, including
November 6 Asian observations, and are never used as historical return anchors. Published
52-week yield ranges were re-read. US/Canadian curves use paired November 4 official data.

New reviewed material:

- [US claims, November 5](https://www.dol.gov/ui/data.pdf): 189K for the week ending October 31; previous week revised to 195K.
- [Bank of England, November 5](https://www.bankofengland.co.uk/monetary-policy-summary-and-minutes/2026/november-2026): Bank Rate increased to 4%.
- [China policy framework, Reuters November 2](https://www.investing.com/news/economy-news/chinas-shift-to-new-policy-rate-signals-easier-funding-conditions-4989818): overnight reverse repo replaces the seven-day policy anchor; the different tenors are not treated as a like-for-like rate change.
- Final October S&P Global / HSBC PMIs, via linked Trading Economics series: US manufacturing 54.9, services 56.1; Canada 49.6 and 48.1; India 54.7 and 55.8; Taiwan manufacturing 54.9; Korea 51.3. These replace flash or September observations but remain excluded where three-year history is unavailable.
- [Challenger, November 5](https://www.challengergray.com/blog/october-layoffs-at-three-year-low-seasonal-hiring-plans-up-26/): October AI-attributed cuts, cumulative figures and chart updated. Other curated AI research keeps each item's source date.

OPEC returned HTTP 403 again. The October 22 owner-supplied basket assessment remains
with its actual date and a November 5 failure note. India CPI defaults to Vancouver time,
so an evening build cannot give the shared Global Economy label tomorrow's UTC date.

Validation: 104 Node tests, 29 Python tests, TypeScript, scoped ESLint, sovereign-bond
validation and production static export including Open Graph and CSP generation.
The deployment's high-severity dependency gate passes; npm reports eight existing
moderate development-tool findings. Dependencies were not changed in this refresh.

## India CPI addition — November 2, 2026

India now appears in Global → Inflation, bringing the display to 51 indicators and two
curves. The current national combined headline rate is 5.54% YoY for September 2026,
after 4.83% in August (+0.71pp), verified against the [official monthly release](https://www.pib.gov.in/PressReleseDetailm.aspx?PRID=2322244&lang=2&reg=48).

`npm run fetch:india-cpi` reads the official MoSPI public MCP service, with the official
CPI API as a secondary transport. `npm run build` automatically runs it through `prebuild`,
so local weekly refreshes and GitHub Pages deployments both check the source. No API key,
paid provider, spreadsheet dependency or browser scraping is required. TLS verification
stays enabled. The MCP route also avoids the legacy TLS negotiation problem seen with
some clients on the direct API host.

The exact series is All India / Combined / CPI General / published year-on-year inflation.
Filters are pinned separately for each base year: national state code 99 for 2012 and 1 for
2024, combined sector 3, general group 0 (2012) or general division 0 (2024). Returned names,
bases, dimensions and pagination are checked. The fetcher rejects conflicting/duplicate
months, missing readings, future dates, mismatched geography or subgroups, index-vs-rate
confusion and a regressing latest observation. It reconciles reported inflation with the
exact prior-year index within each basket, allowing for published index rounding.

The saved snapshot retains 48 consecutive monthly **reported headline rates**, October
2022–September 2026. This is not a reconstructed constant-basket series. The source's 2012
basket ends in December 2025 and its 2024 basket's reported inflation begins January 2026.
New-basket 2025 index levels have no published YoY inflation and are never converted into
synthetic transition-year rates. Instead, the genuinely reported older headline observations
remain in their own chart segment. Main charts and table sparklines do not connect across
January 2026. The three-year view has a labelled measurement-break marker and a visible
comparability note, following [MoSPI's explanation](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2291051&lang=1&reg=1).

`india-cpi-data.json` keeps the source rows, successful review date, last attempt date,
transport status and display record. Writes are atomic. If fetching or validation fails,
`--allow-cached` revalidates the saved source rows and retains the original observation and
successful review dates; the chart shows a source-availability note and the build logs a
warning. A cache older than 45 days cannot silently carry another production build. The
usual monthly release timetable is checked with a short publication/holiday grace period.
Latest readings remain subject to publisher revisions; no upstream service can guarantee
availability on every attempt.

Validation: 99 Node tests, 29 Python tests, scoped ESLint, TypeScript and the production
static export passed, including a live MoSPI fetch through the automatic prebuild hook.

## Week ending October 31, 2026

Content-only refresh; the existing design is preserved. Exchange closes are October 30,
crypto October 31. Provider retrieval completed November 1, so the shared retrieval label
can differ from the observation and briefing dates. Yahoo, FRED, BoC, StatCan, Eurostat,
sovereign yields, AI prices and the 1,618-stock heatmap were refreshed; seven missing
constituent quotes remain unavailable. Weekly prose reconciles to the final saved quotes.

Economy now offers **50 indicators and two curves**, after applying a shared three-year
history gate in `economy-view.ts`. US has 10 eligible indicators; Canada has nine. Histories
must be chronological, unique, finite and span three calendar years, with sufficient recent
observations for their cadence: 156 weekly, 36 monthly, or 13 quarterly. One unpublished
monthly observation can remain absent; values are never interpolated. The existing October
2025 gap in US CPI/unemployment remains visible. The check applies to all coverage views
and both yield-curve tenors before rendering. Short source snapshots stay available for
provenance but cannot enter the displayed series.

Backfills: US/Canadian monthly fetches now retain four or more years, weekly claims and
energy approximately four, quarterly tax receipts 16 quarters, and paired yield curves up
to 48 month-end readings. China manufacturing PMI has 37 monthly observations, October
2023–October 2026, from the [2024](https://www.stats.gov.cn/english/PressRelease/202411/t20241115_1957434.html),
[2025](https://www.stats.gov.cn/english/PressRelease/202511/t20251103_1961770.html) and
[2026](https://www.stats.gov.cn/sj/zxfbhjd/202610/t20261031_1965718.html) NBS tables.

Excluded until sufficient comparable source history is verified: eight other PMI series;
Australian complete monthly CPI; Vietnam, Indonesia, Bangladesh and Chile's supplied
measures; and Mexican CPI/unemployment. Mexico GDP now uses 15 quarters from Q1 2023 through the Q3 2026 advance estimate, all from Graph 1 of the [October 30 INEGI release](https://www.inegi.org.mx/contenidos/saladeprensa/boletines/2026/pibo/pib_eo2026_10.pdf), replacing the lagging FRED mirror.
The alternative Mexican OECD/FRED CPI series ends in July 2024 and is unsuitable as a
current replacement; the unemployment mirror failed. Australia's complete CPI starts in
April 2025 in the returned source; the earlier monthly indicator is not spliced into it.

Reviewed new releases include [US Q3 GDP](https://www.bea.gov/data/gdp/gross-domestic-product),
[euro-area Q3 GDP](https://ec.europa.eu/eurostat/web/products-euro-indicators/w/2-30102026-ap),
[October 28 BoC policy](https://www.bankofcanada.ca/2026/10/fad-press-release-2026-10-28/),
[October 28 Fed policy](https://www.federalreserve.gov/newsevents/pressreleases/monetary20261028a.htm),
and the Alphabet, Microsoft, Amazon and SK hynix earnings linked alongside their updated
AI figures. Distinct revenue, run-rate, cloud-backlog and capex definitions remain explicit.

Source exceptions: OPEC HTTP 403 retains the owner's October 22 export with its real date;
Japanese statistics HTTP 502 and Korean FRED failures retain five previously verified
October 27 records, explicitly noted in their descriptions. The other 12 international
series were refreshed from the existing official adapters. Six emerging feeds and the new Mexican GDP release were reviewed November 1; the other 13 curated measures retain their October 30 review dates. Manual sovereign closes/ranges and independent cross-checks are
recorded in `bonds-manual.json` and `bond-ranges52w.json`; country curves use paired
October 29 official readings, while Markets uses October 30 quotes where available.

Validation: 98 Node tests, 20 Python tests, sovereign-bond validation, scoped ESLint and
production webpack static export (including OG generation) passed. Browser checks confirm
Mexico GDP's three-year window and the 50-indicator/two-curve coverage.

## Week ending October 24, 2026

The market snapshot was refreshed October 24 in America/Vancouver time. Exchange quotes
mostly end October 23; Taiwan's latest equity observation is October 22 and crypto observations
extend to October 24. All five macro providers, the bond feeds, the AI quote patch and the
1,618-constituent heatmap were refreshed. Seven missing constituent quotes remain null.

New reviewed releases and transformations:

- [DOL October 22 claims](https://www.dol.gov/sites/dolgov/files/OPA/newsreleases/ui-claims/20261613.pdf):
  194K initial claims for October 17; the prior week was revised to 200K.
- [Statistics Canada October 23 retail release](https://www150.statcan.gc.ca/n1/daily-quotidien/261023/dq261023a-eng.htm):
  August sales increased 1.2% MoM in both nominal and volume terms. The existing card uses
  5.4% nominal YoY from WDS, after 5.1% in July; September's advance estimate is not a final observation.
- October 23 flash PMI: US manufacturing 56.0 and services 57.9; India manufacturing 54.9
  and services 56.2. Added October history points without overwriting September finals.
  Sources: [S&P Global US commentary](https://www.spglobal.com/market-intelligence/en/news-insights/research/2026/10/us-flash-pmi-signals-sustained-strong-growth-but-also-further-inflation-uplift-in-october),
  [US manufacturing](https://tradingeconomics.com/united-states/manufacturing-pmi),
  [US services](https://tradingeconomics.com/united-states/services-pmi), and
  [Reuters India survey report](https://www.marketscreener.com/news/india-october-business-growth-hits-4-month-high-hiring-stalls-pmi-shows-ce785cded189fe23).
- [Census national workbook](https://www.census.gov/hfp/btos/downloads/National.xlsx) and
  [employment-size workbook](https://www.census.gov/hfp/btos/downloads/Employment%20Size%20Class.xlsx):
  `Response Estimates`, column `202621`; question 7 / answer 1 supplies current use and
  question 24 / answer 1 supplies expected use. National values are 24.6% and 28.6%.
  Employment-size A–G current estimates are 24.3, 22.6, 24.6, 26.0, 29.0, 35.3 and 43.6%.
  `Collection and Reference Dates` gives September 21–October 4 reference dates, October 5–18
  collection dates, and October 22 publication. The workbook's current wording is SI,
  formerly AI; the chart discloses this instead of implying a newly verified comparable trend.
- [Reuters October 19 report via Euronext](https://live.euronext.com/en/financial-news/exclusive-openai-seeks-accelerate-fundraising-ahead-anthropic-ipo-sources-say):
  replaced the earlier OpenAI ~$70B figure with ~$50B annualized revenue, net of partner shares;
  the newer $70B year-end number is a forecast. Anthropic's card now uses reported Q3 revenue
  of $16.8B, not the older annualized headline. Prospective OpenAI funding talks are excluded
  from announced-round totals. SK hynix Q3 is scheduled for October 28; Q2 remains displayed.
- [Bank of Korea October 22 decision](https://www.bok.or.kr/eng/bbs/E0000627/view.do?nttId=11065824&menuNo=400022):
  3.00% unchanged. [FRED DFF](https://fred.stlouisfed.org/series/DFF) confirms the separate daily
  US effective rate of 3.88% for October 22; the economic card retains its September monthly average.

`bonds-manual.json` records October 23 historical-table closes and independent Trading Economics
checks. Newly read rows supersede revised provider history where applicable; period moves still
require same-source dated anchors, and missing annual comparisons remain unavailable. US and
Canada country curves use paired official October 22 observations, distinct from October 23
Markets quotes. The South African daily feed fell back to monthly data, so a verified October 23
close supplements it. OPEC returned HTTP 403; September 29 remains its latest verified quote,
with an October 24 review and an explicit unavailable-source note.

Validation: provider-to-display reconciliation, 35 unique dated economic histories, aligned AI
daily/weekly grids, weighted sector returns and missing coverage, 13 sovereign yields/policy
rates, TypeScript, all 71 existing tests, scoped lint and production static export passed.
Rendered review covered the homepage, Markets, Vantage AI, global Economy, US and Canada.
The heatmap, Census size chart, US services PMI, India manufacturing PMI and Canadian retail
chart rendered with the new values. The India chart's 3M control retained the October flash
endpoint; no page overflow or runtime errors were observed in the inspected views.

Bond comparison repair: re-read daily Investing.com history from October 2025 through
October 23, 2026 for all 11 manually verified markets. This supplies the 11 missing annual
anchors and three missing monthly anchors without treating weekly bars or monthly averages
as daily closes. Existing stored daily observations agreed with the newly read history.
`periodMoves` now deduplicates dates before selecting the previous session, so appending
the verified headline cannot manufacture a zero daily move. Monthly charts use the newly
verified daily month-end closes where available. The bond validation gate now rejects a
verified snapshot lacking any of its three comparison anchors.

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
| **Eurostat** | Free | Euro-area GDP growth and HICP inflation | `npm run fetch:eurostat` | — |
| **Twelve Data** | Free 800/day, 8/min | **Scaffold only** — proven working, not wired into dashboard yet | `npm run fetch:twelvedata` | `TWELVEDATA_API_KEY` |
| **Finnhub** | Free 60/min | **Scaffold only** — proven working, not wired into dashboard yet | `npm run fetch:finnhub` | `FINNHUB_API_KEY` |

### Fetcher scripts

- `src/lib/fetch-yahoo.py` — uses `./.venv/bin/python3` (venv created by `npm run fetch:yahoo:setup`). Returns 1-year daily history per index, computes daily/1W/1M/YTD changes + 52W range + 52-pt sparkline. Output: `src/lib/yahoo-data.json`.
- `src/lib/build-catalogue.py` — turns the index membership workbook into the heatmap constituent catalogue (top 250 per index, renormalised weights, resolved Yahoo symbols). Output: `src/lib/heatmap-catalogue.json`. See [The heatmap pipeline](#the-heatmap-pipeline).
- `src/lib/fetch-sectors.py` — incremental, rate-limit-aware sector + company-name resolver. Output: `src/lib/heatmap-sectors.json` (**committed** — a cache, not a regenerable dump).
- `src/lib/fetch-heatmap.py` — batch weekly % change for every catalogue constituent. Output: `src/lib/heatmap-data.json`.
- `src/lib/gen-ticker-names.py` — regenerates `src/lib/ticker-names.ts` from the catalogue + sector cache.
- `src/lib/fetch-fred.mjs` — reads `FRED_API_KEY` from `.env.local`, fetches US macro series and foreign 10Y yields, and preserves full dates for weekly claims. Output: `src/lib/fred-data.json`.
- `src/lib/fetch-boc.mjs` — fetches Canadian policy, CPI, and 10Y yield data from the Bank of Canada Valet API. Output: `src/lib/boc-data.json`.
- `src/lib/fetch-eurostat.mjs` — fetches euro-area GDP growth and HICP inflation from the Eurostat dissemination API. Output: `src/lib/eurostat-data.json`. **Three traps, all verified against the API:** the euro-area geo code is `EA21` (EA19/EA20 are earlier compositions and return an EMPTY result, not an error); HICP lives in `prc_hicp_minr` with dimension `coicop18`, because the Feb 2026 switch to ECOICOP ver.2 froze the old `prc_hicp_manr` at 2025-12 while it still answers 200; and JSON-stat omits missing cells entirely, so a period listed in the time index may carry no observation — the euro-area aggregate often trails its member states by weeks.
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

### Euro-area series: use Eurostat, not FRED

FRED carries euro-area aggregates but several were **discontinued in 2023 and still
return HTTP 200 with stale data** — `LRHUTTTTEZM156S` (unemployment, ends 2023-01),
`EA19PRINTO01GYSAM` (industrial production, 2023-10) and `XTEXVA01EZM667S` (trade,
2023-04). Nothing about the response signals this. Eurostat is the live source for
euro-area statistics. FRED remains fine for the ECB policy rates (`ECBDFR`,
`ECBMRRFR` — both daily and current) if those are ever added.

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
- ~~**Index P/E (`pe`, `pe10yAvg`)**~~ — **REMOVED.** These were never sourced. An audit traced
  them to the commit that renamed `mock-data.ts` → `site-data.ts`, i.e. they arrived with the
  original mock dataset, and no fetcher ever wrote a `pe` field. They were also undated, sitting
  beside a price that refreshes weekly, and drove a "Valuation" column that computed a
  variance-vs-10-year-average from them. Yahoo publishes **no** P/E for an index — verified across
  all thirteen symbols, where `trailingPE`, `forwardPE`, `priceToBook` and `trailingEps` all come
  back empty — so there was nothing to wire up either. The fields, the 22 values and the column
  are gone; the equity table now shows 30-day realized volatility there, which IS computed from
  real closes. Don't reinstate index multiples without a provider that actually publishes them.

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
| `EQUITY_INDICES` | The 13 equity indices on /markets, each with price, return, range, volatility, and sparkline fields |
| `BOND_YIELDS` | 10Y govt bonds for US, DE, GB, CA, JP, IN, KR, AU, ZA with daily/1M/1Y moves and a 12-point trend |
| `POLICY_RATES` | Latest headline central-bank policy rate for the same nine bond-table countries; no history by design |
| `YIELD_CURVES` | US and Canada long-end curves — two tenors with up to 48 monthly observations plus the spread in bp. **Regenerated wholesale** by `patch-site-data.mjs`; hand edits are overwritten |
| `COMMODITIES` | Brent, WTI, Gold, Silver, Copper, Aluminum, Iron Ore, Soybeans, Natural Gas (9 total) |
| `CRYPTO` | Bitcoin, Ethereum, Solana, BNB spot prices (typed `CryptoAsset[]`, not `Commodity[]`) |
| `FOREX_RATES` | US Dollar Index + EUR / GBP / JPY / CAD / INR vs USD |
| `HEATMAP_INDICES` | 11 regional heatmaps with 1,618 constituent rows and explicit missing-quote handling |
| `ECONOMIC_INDICATORS` | All economic-dashboard cards. Categories: `pmi`, `growth`, `employment`, `inflation`, `energy` |
| `MACRO_SNAPSHOT` | The 6 hero tiles on /dashboard top (also reused on the homepage) |
| `EXTERNAL_COMMENTARY` | 6 curated external headlines on the homepage, linking to Reuters/Bloomberg/FT/WSJ/Economist/MarketWatch |
| `BLOG_POSTS` | Published article metadata, derived from `BLOG_ARTICLES` in `src/lib/blog-data.ts` and re-exported by `site-data.ts` |

### Economic indicators currently present
- **PMI:** US Composite PMI, China Manufacturing PMI, India Manufacturing PMI, Taiwan Manufacturing PMI, South Korea Manufacturing PMI, India Services PMI
- **Growth:** US GDP, Euro Area GDP, Canada GDP (quarterly + monthly), China GDP, India GDP
- **Employment:** US Initial Jobless Claims, US Unemployment Rate
- **Inflation:** US CPI, US PPI, Euro Area HICP
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
- The Last column includes a shared `RangeBar`: high, low and a marker for the current quote. ETFs, government yields, commodities, currencies and crypto use the same component.
- Yahoo ranges use daily closing observations over **52 calendar weeks**, including weekends for crypto. `market_ranges.py` requires near-full-year daily coverage; a short listing or sparse monthly history produces an unavailable range. These ranges do not change with the chart horizon.
- `bond-ranges52w.json` records separately reviewed, published 52-week benchmark yield ranges from Investing.com, including intraday observations. Each bond links to its range source and discloses its date in the tooltip. Yield ranges are percentages, not bond-price ranges. The current yield retains its own source/date. The patcher withholds a range if it ends before the current quote, is more than seven days ahead of that quote, or does not contain the current yield. Review this file during each weekly refresh.
- OPEC now has 990 daily basket-price assessments from the site owner's supplied `BasketList` export, December 21, 2022–October 22, 2026. Its 52-week range uses 258 daily observations: low $58.39, high $146.05; latest $115.09. Daily, weekly, calendar-month and YTD returns use dated daily anchors. Markets charts use the full daily history; the Economy chart retains month-end snapshots derived from it. Source provenance and the last supplied date are disclosed. The original official endpoint remained unavailable, so this import does not claim a fresh official fetch.
- Import an updated export with `REFRESH_AS_OF=YYYY-MM-DD npm run fetch:opec -- --file /path/to/export.xml`. Both `BasketList` XML and the legacy numeric `Date.UTC` format are parsed without executing feed content. Invalid, conflicting, short or older history fails before replacing the saved data. Daily observations are retained for future ranges and period calculations.
- `node src/lib/patch-site-data.mjs --ranges-only` patches only range fields and provenance from the provider cache, preserving the published weekly prices, returns, histories, commentary and snapshot date. A normal patch also carries the range fields forward.
- Chart toggle in the header switches all sparklines simultaneously across the site-wide ladder (1W / 3M / YTD / 2Y / 3Y); sparkline color follows the trend of the *visible* window. 1W reads the six-point `daily` series rather than the weekly sparkline — see the ladder notes in CLAUDE.md

### `AIStockTable.tsx`

- All 28 AI listings use the shared `RangeBar` beneath the USD price, with two-decimal dollar highs/lows and a current-price marker. The range stays fixed when the chart horizon changes.
- Ranges use daily closes over 52 calendar weeks, converted to USD with the daily Yahoo FX history before calculating the extrema. Each stock carries its own range observation date and source. Insufficient daily history produces an unavailable range, rather than a shorter window labelled 52W.
- `node src/lib/patch-ai-stocks.mjs --ranges-only` updates only range fields/provenance from a fresh `fetch:ai` cache. It checks that each range contains the existing displayed price and preserves stock quotes, returns, shared daily/weekly grids, index comparison series and curated figures. The normal AI patch also writes the range metadata.

### `EconomicChart.tsx`

- The October 30 emerging-economy supplement adds 20 core series across Vietnam, Indonesia, Bangladesh, Malaysia, Brazil, Mexico and Chile, using `emerging-economy-data.json`. No new PMI series are added. Brazil uses pinned IBGE/SIDRA variables and national aggregates; Malaysia uses OpenDOSM CSVs; Mexico quarterly GDP now uses the October 30 INEGI release (including its complete historical graph), explicitly labelled QoQ, not annualized; Q3 2026 is marked advance.
- `python3 src/lib/fetch-emerging.py --reviewed-on 2026-10-30` refreshes seven API/CSV histories and combines thirteen manually reviewed official-release series from `emerging-economy-reviewed.json`. A later review date is blocked until those releases are reviewed. Future, stale, conflicting and nonadjacent headline comparisons fail validation; the snapshot is written atomically. `sourceReferences` preserves the earlier cited releases, and limited histories are visible beside their charts.
- Bangladesh has verified inflation and fiscal-quarter GDP through Jan–Mar 2026; recent comparable unemployment remains unavailable. The supplied Bangladeshi histories currently fail the three-year display minimum. Vietnam labour uses working-age quarterly observations; Indonesia labour currently ends in the May 2026 survey. Brazil and Chile unemployment use rolling three-month windows, retained in periods and hover labels. No annual unemployment proxy or forecast fills the Bangladesh gap. Existing source definitions and the independently reviewed October 27 supplement remain intact.

- `/dashboard` combines Global, US and Canada using a top-of-page coverage toggle and the approved **Briefing & table** layout: compact `EconomyHeader`, scoped headline readings, category filters, a compact indicator table and a selected-indicator focus panel. The toggle updates the headlines, categories, rows, focus and country curve in place. Global opens with All selected and includes 51 eligible indicators plus both yield curves. US retains 10 eligible indicators plus its curve, and Canada nine plus its curve. `economy-view.ts` owns the existing scope rules and display formatting. Global category filters are Activity, Growth, Labour, Inflation, Rates and Energy; Consumption, Trade and Fiscal filters appear only in US and Canada. All includes every supplied indicator that passes the minimum three-year history check. The inflation category is labelled Inflation in all three views.
- Table rows and the focus panel show current level, units, reporting period, change versus the prior observation and a factual status. Percentage-rate changes use percentage points; US quarterly GDP explicitly retains its annualized basis, while Canada and euro-area GDP remain ordinary QoQ. Quarter-start dates display as reporting quarters.
- The focus panel shows the existing `ECONOMIC_CONTEXT` interpretation; Source & measurement expands inline with the full original description. Available-history low/high bars carry actual coverage dates and observation counts, without claiming a 52-week range. The duplicated bottom commentary wall is omitted. No fixed-height text scrollers hide notes. Yield curves remain in Rates, with their two series, date, spread and source notes.
- SVG line charts use actual UTC timestamps, including both monthly `YYYY-MM` and daily `YYYY-MM-DD` dates, rather than evenly spacing records with different cadences. PMI charts include the 50 no-change reference. Absolute lines use the brand color; delta colors follow `isPositiveGood`.
- Horizon tabs use the shared `ChartViewTabs` in its comfortable-size variant, filtered by `horizonsFor`. Windows anchor to each series' last observation; monthly series do not gain an unsupported 1W view. Category filtering changes the table rows and resets focus to the first applicable indicator; the scoped headline readings remain the page overview.
- Coverage is bookmarkable with `?view=us` or `?view=canada`; Global uses the base URL. Browser Back/Forward restores coverage. Supported categories stay selected across coverage changes; unsupported ones fall back to the first available category. Legacy `/us-economy`, `/canada-economy` and `/us-canada` routes forward to the combined page and are excluded from the sitemap.
- US and Canada retain the shared published update label from `DATA_UPDATED_AT`. Global includes both supplements and uses their most recent `reviewedAt`, formatted by `international-economy.ts`; this does not advance the market or AI snapshot.
- Global includes the euro area, UK, Japan, China, India, Australia, Germany, France and South Korea alongside the US, Canada, Malaysia, Brazil, Mexico and energy data. Short histories are omitted. The only coverage controls are Global / US / Canada; the separate More economies selector is removed. Old country query values fall back to the complete Global view. Each global row retains its country label, observation period and source. Yield-curve selections use country-specific IDs so US and Canadian curves cannot collide.
- `international-economy-data.json` adds 17 verified indicators to the original 35 (52 distinct series in total). UK, Japan, Australia, Germany and France each add real GDP, consumer inflation and unemployment. South Korea adds OECD/FRED real GDP and unemployment alongside its existing manufacturing PMI. Euro area, China and India reuse their existing verified indicators; headline counts reflect available coverage rather than inserting missing metrics.
- Refresh the supplement with `python3 src/lib/fetch-international.py --reviewed-on YYYY-MM-DD`. It reads public ONS, Eurostat, Japan Statistics Dashboard, ABS and FRED endpoints, validates timestamps, units, current/previous/delta reconciliation, staleness and single-series filters, and writes the snapshot atomically. Before a later refresh, review the explicit ABS CPI publication cap; an observation month is not its release date. No credentials are embedded.
- The first supplemental review is Oct 27, 2026. UK GDP uses revised QNA (not the older PN2 first estimate). UK unemployment retains the source’s rolling three-month labels. Germany’s provisional GDP flags remain visible. HICP is labelled as harmonised inflation, not national CPI. Japanese API attribution is retained. The October 31 review extends Australian CPI through September, released October 28; its complete monthly history is too short for display and is not spliced with the older indicator. Korean OECD/FRED reporting lag is explicit; the discontinued 2023 CPI series is excluded. Projections and unsourced series are not inserted.
- Supplemental interpretations and source links travel with their indicator rows; original `ECONOMIC_CONTEXT` and source data remain unchanged.

### `MacroSnapshot.tsx`
- 6 tiles, pulled from `MACRO_SNAPSHOT` (icon, value, trend arrow, label, sub-context)
- Used on the homepage via `showHeader={false}`; the economy pages now have four scope-specific headlines in `EconomyDashboard`.

### Briefing status (was `PageHeader.tsx`)
- `PageHeader.tsx` has been **deleted** — no page had used it for some time.
- `BriefingHero` is the standard page header. It takes a `status` prop and renders the
  site-wide update label from `lib/briefing.ts`, derived from `DATA_UPDATED_AT` (maintained by
  `patch-site-data.mjs`). There is no per-page date prop and no "next briefing" date.
  - `status="updated"` (default) → `Last updated: <date>` — all data-driven pages.
  - `status="none"` → nothing — About and Blog.
- Economy, US and Canada use the compact `EconomyHeader`, with the same shared update label and coverage navigation.

---

## Status

**Done:**
- Full visual design system (light violet palette, sci-fi cards, gradient hero)
- All three top-level pages with their datasets, charts, and tables
- Homepage Market Snapshot + Economic Snapshot sections
- Eleven-index market heatmap with company-name tooltips and quote-coverage status
- 52W range column and YTD/52W chart toggle in the equity table
- PMI section + regional PMIs (China, India, Taiwan, South Korea) in the Economy dashboard
- Blog lists published articles; `/blog/[slug]` exports each article with inline citations,
  a source list, article metadata and JSON-LD. Article URLs are included in the sitemap.
- Branded OG/social card (`opengraph-image.tsx`) + full `openGraph`/`twitter` metadata
- GitHub Pages workflow (`.github/workflows/deploy.yml`); `next.config.ts` supports optional `NEXT_PUBLIC_BASE_PATH` for project-page hosting
- Static export build passes cleanly

**Not yet built:**
- Real API integration layer — `src/lib/api/` is empty (fetchers patch into `site-data.ts` instead)
- Optional markdown/MDX content pipeline — current articles use typed content in `src/lib/blog-data.ts`
- Custom domain (set `NEXT_PUBLIC_SITE_URL` for OG absolute URLs once chosen)
- Search, RSS, newsletter signup
- Mobile polish on the heatmap (treemap labels get tight on narrow screens)
- Repository-hosted data refresh automation and freshness alerts

### Chart windows

Every chart on the site — the economic cards, the yield curves, and the sparkline
columns in all five markets tables — offers exactly one ladder: **3M · 6M · YTD · 2Y · 3Y**,
defined once as `TimeHorizon` and exported as `CHART_VIEWS` from `chart-window.ts`.
There is no other option anywhere. The markets tables previously had their own
YTD/52W/3Y vocabulary; `ChartView` is now an alias of `TimeHorizon` so those call
sites still read naturally.

YTD is not a fixed length — it runs from January of the **series' own last point**,
so it needs 7 months of history in July and 2 in February (`horizonMonths`).

A card offers only the windows its data can actually fill (`horizonsFor`), on two
separate tests:

- **span** — the window must not be longer than the history. Most macro series hold
  ~36 monthly points, so nothing reaches 5Y; that tab used to be a relabelled 3Y.
- **point count** — the window must contain at least 2 observations. A quarterly
  series has one observation in a 3-month window, and one point draws no line, so
  quarterly cards legitimately show fewer tabs than monthly ones. A card whose
  latest point is January drops YTD for the same reason.

Note both are computed in **UTC**. Series dates are ISO, which JS parses as UTC
midnight; reading them back with local getters shifts the date a day west of
Greenwich into the previous month, which silently dropped January from YTD for
every viewer in the Americas.

To give a card a longer window, lengthen its series first — raise the fetcher's
`limit`/`months`/`keep` and the tab appears on its own. Any quarterly series needs
>= 13 points before 3Y is offered.
