@AGENTS.md

# Finance with Kunal

**Dev URL:** http://localhost:3001 · **Owner:** Kunal Kapoor (kunalkapoor.jnj@gmail.com) · **Repo:** `/Users/kunalkapoor/Projects/finance-with-kunal`

A light, professional personal-finance blog + global-markets dashboard with a "Bloomberg terminal" feel. Static site, hosted on GitHub Pages. Curated **weekly cadence** — never use "live / real-time" language. Every page shows one shared label, `Week of <Mon> – <Fri>, <year>`, from `lib/briefing.ts`.

> **Deep reference** — data providers, dataset inventory, economic indicators, per-component behavior, and roadmap — lives in **[`docs/DATA.md`](docs/DATA.md)**. This file is the quick overview; open DATA.md when touching data or a specific component.

## Surfaces

| Route | Nav label | Purpose |
|-------|-----------|---------|
| `/` | — | Hero + Market Snapshot + Economic Snapshot + latest posts |
| `/markets` | **Markets** | Equity indices, ETFs, bonds, commodities, FX, crypto, 11-index constituent heatmap |
| `/ai` | **AI** | AI basket vs all 12 global indices, 28-name AI universe, capex, AI revenue, chips, layoffs, VC deals, adoption |
| `/dashboard` | **Economy** | Global Macro Snapshot + leading economic indicators (incl. euro area) |
| `/us-economy` | **US** | US-only economic dashboard + 10Y/30Y yield curve |
| `/canada-economy` | **Canada** | Canada-only economic dashboard + 10Y/long yield curve |
| `/blog` | **Blog** | Long-form market commentary |
| `/about` | **About Me** | Profile, career timeline, qualifications |
| `/us-canada` | — | `noIndex` redirect stub — the old combined page, now split into the two above. Kept so existing links don't 404. |

Nav labels and route slugs differ on purpose (`/dashboard` shows as "Economy"). Don't rename routes.

## Tech stack

- **Next.js 16.2.6** App Router (`src/app/`), TypeScript, alias `@/*`, **static export** (`output: "export"`)
- **Tailwind v4** via `@theme` in `globals.css` (no `tailwind.config.ts`)
- **ECharts 6** (`echarts-for-react`) — **always SVG renderer** (canvas drops labels before the web font loads)
- Fonts: **Space Grotesk** (display) + **Space Mono** (numbers) via `next/font`; use the shared `FONT_MONO` const from `lib/utils` for mono inline styles
- Node 25 / npm 11 / React 19
- **Next 16 has breaking changes vs older versions — check `node_modules/next/dist/docs/` before assuming older patterns work.**

## Design tokens (`globals.css` `@theme`)

Warm editorial palette — paper, ink, and signal green. **Two themes**: light is the `@theme` default, dark is applied by adding `.dark` to `<html>` (an inline script in the root layout sets it before paint; `ThemeToggle` flips it and persists to localStorage). Both must be styled.

| Token | Light | Dark |
|---|---|---|
| `--color-space-void` (page) | `#f2f1eb` | `#0b0d09` |
| `--color-space-card` | `#faf9f4` | `#151a12` |
| `--color-space-border` | `#d8d7cd` | `#2b3126` |
| `--color-neon-cyan` (primary accent) | `#37683f` | `#b9f227` |
| `--color-neon-purple` (secondary) | `#916c1e` | `#edc76d` |

The `--color-neon-*` names are kept for back-compat and no longer describe the actual hues. Market up/down/neutral also differ per theme. ECharts configs can't read CSS vars — use hex equivalents there.

Reusable UI: `BriefingHero` (page hero + briefing week + stat tiles) is the standard page header; `SciFiCard` (card wrapper + `CardHeader`) for sections. `PageHeader` is an older variant, no longer used by any page.

**The briefing label is never hardcoded or passed per page.** `lib/briefing.ts` derives one string — `Week of Aug 10 – Aug 14, 2026` — from `DATA_UPDATED_AT` (the last completed Mon–Fri trading week), and the hero, homepage eyebrow and weekly-commentary card all render that same constant. `patch-site-data.mjs` maintains `DATA_UPDATED_AT` on every refresh, so the label follows automatically. Pages whose content isn't the weekly data opt out with `showWeek={false}` (About, Blog). `NEXT_BRIEFING_AT` is still patched but no longer displayed anywhere — the next-briefing date was dropped.

## File map

```
src/
├── app/
│   ├── layout.tsx              # Root layout, fonts, metadata + OG, Navbar, Footer
│   ├── page.tsx                # Homepage: hero, Market + Economic snapshots, latest posts
│   ├── opengraph-image.tsx     # Build-time branded OG/social card
│   ├── sitemap.ts, robots.ts   # Static /sitemap.xml + /robots.txt
│   ├── globals.css             # @theme tokens, animations, grid bg
│   ├── markets/page.tsx        # Heatmap + Equity + ETFs + Bonds + Commodities + Forex + Crypto
│   ├── ai/page.tsx             # AI dashboard — see "The /ai page" below
│   ├── dashboard/page.tsx      # MacroSnapshot + EconomicCharts + Notes (global)
│   ├── us-economy/page.tsx     # CountryEconomy("United States")
│   ├── canada-economy/page.tsx # CountryEconomy("Canada")
│   ├── about/page.tsx          # Profile, timeline, skills
│   ├── us-canada/page.tsx      # noIndex redirect stub → us-economy / canada-economy
│   └── blog/{page.tsx, [slug]/page.tsx}
├── components/
│   ├── layout/{Navbar,Footer}.tsx
│   ├── ui/                     # SciFiCard, BriefingHero, PageHeader, Reveal, PointerSpotlight
│   ├── seo/JsonLd.tsx          # Schema.org Person/WebSite + per-page breadcrumbs
│   ├── ai/                     # AIStockTable, AIMarketImpact, AICapexChart,
│   │                           #   AILayoffsChart, AIDealsTable, AIAdoptionChart,
│   │                           #   AIFigureGrid (+ AIFigureSection wrapper)
│   ├── markets/                # MarketTicker, EquityMarketsTable, ETFTable, BondsTable,
│   │                           #   AssetTable — shared by CommoditiesTable,
│   │                           #   CryptoTable and ForexTable,
│   │                           #   StatStack, TrendSparkline, MarketHeatmap
│   └── dashboard/              # MacroSnapshot, EconomicChart, EconomicNotes,
│                               #   CountryEconomy, YieldCurveChart
├── lib/
│   ├── site-data.ts            # ALL canned data (large — read with grep/offset, not whole-file)
│   ├── ticker-names.ts         # GENERATED — Yahoo symbol → company name (heatmap tooltips)
│   ├── chart-window.ts         # THE chart window ladder + slicing maths (see Conventions)
│   ├── external-links.ts       # Investing.com / Yahoo deep links per instrument
│   ├── use-theme.ts            # theme hook + CHART_COLORS (ECharts can't read CSS vars)
│   ├── seo.ts                  # SITE_URL, canonical/OG helper — every page uses pageMetadata()
│   └── utils.ts                # cn(), formatNumber, formatChange, getChangeColor, FONT_MONO
└── types/index.ts              # IndexQuote, BondYield, Commodity, CryptoAsset, ForexRate, ...
```

## Data (summary — full detail in `docs/DATA.md`)

Six live providers are wired in — **Yahoo Finance, FRED, Bank of Canada Valet, Statistics Canada WDS, Eurostat**, plus Alpha Vantage; Twelve Data + Finnhub are scaffolds. Only the S&P Global PMI cards, china-gdp/india-gdp, and BLOG_POSTS are still hand-maintained. Keys in `.env.local` (gitignored). Refresh via `npm run fetch:<provider>`; each writes a gitignored `src/lib/<provider>-data.json` that is patched into `site-data.ts`. Datasets exported from `site-data.ts`: `EQUITY_INDICES`, `ETFS`, `BOND_YIELDS`, `COMMODITIES`, `CRYPTO`, `FOREX_RATES`, `HEATMAP_INDICES`, `ECONOMIC_INDICATORS`, `MACRO_SNAPSHOT`, `BLOG_POSTS`.

**Heatmaps** are a four-stage pipeline of their own — `build:catalogue` → `fetch:sectors` →
`fetch:heatmap` → `patch:heatmap`. Membership and weights come from `data/index-constituents.xlsx`
(published index weights, 11 indices, 1,618 constituents); sectors come from Yahoo and are held in a
**committed** cache, `src/lib/heatmap-sectors.json`, not a gitignored dump. Only `fetch:heatmap` and
`patch:heatmap` need to run on a weekly refresh. Full detail in `docs/DATA.md`.

`ETFS` carries no fee or fund-size fields on purpose — Yahoo reports a 0.000 expense ratio for Canadian listings, and its `totalAssets` for a Vanguard US fund spans every share class rather than the ETF. Don't add either back from Yahoo; they'd have to come from the fund fact sheets.

## Running locally

```bash
npm run dev -- --port 3001     # dev server at http://localhost:3001
npm run build                  # static export to out/ — run before pushing
```

**`dev` pins `--webpack` on purpose — don't drop it.** Turbopack (the Next 16
default) leaks ~400–500 MB per page request in dev on this project and dies with
`Ineffective mark-compacts near heap limit` after roughly ten minutes: measured
1.6 GB at 10s → 4.3 GB at 60s → OOM at ~12 GB, with no edits or rebuilds in
between. The same six requests under `--webpack` sit flat at ~750 MB. `next
build` still uses Turbopack and is unaffected.

## The `/ai` page

The one surface that is mostly **hand-curated by necessity** — there is no free
API for AI revenue splits, layoff attribution or private deal terms, and no
index classification defines an "AI sector". Data lives in **`src/lib/ai-data.ts`**
(not `site-data.ts`), split in two:

- **`AI_STOCKS` + `AI_INDEX_SERIES`** — real Yahoo quotes. 28 tickers from 9
  countries grouped by stack layer (`platform` / `silicon` / `infra` /
  `systems`), plus the 12 global indices. GENERATED between the
  `AI_STOCKS:START` / `:END` markers; refresh with `npm run fetch:ai && npm run patch:ai`.
  `fetch:ai` is `fetch-yahoo.py --only=ai` — the `--only=` flag fetches one
  section and **carries the other sections over** from the existing dump, so a
  partial run can't blank the file that `patch-site-data` depends on.

  **These series are 260 weekly points over 5 YEARS, not the 156/3y the rest of
  the site holds** — but /ai still offers only the site-wide `CHART_VIEWS`
  ladder (3M/6M/YTD/2Y/3Y), same as every other chart. The extra history is kept
  because it costs nothing and makes a 5Y rung a one-line change; `TimeHorizon`
  carries `5Y` so `sliceLength` can clamp these series to a correct 3Y window.
  Two consequences worth knowing before touching them:

  - Every series sits on **one shared weekly date grid** built from ^GSPC, so
    point *i* is the same calendar week everywhere. `null` marks weeks before a
    listing existed — Arm (IPO Sept 2023), GE Vernova (Apr 2024) and
    Constellation (Feb 2022) are all younger than the window. Consumers must
    skip nulls, never treat them as zero. Don't go back to tail-and-downsample:
    it stretches 2.9 years of Arm across a 5-year axis, which is wrong on the
    dates *and* corrupts the basket.
  - `patch:ai` refuses to write mismatched series lengths, and prints which
    names list after the window opens.
- **Everything else** — curated `AIFigure`s, each carrying `source`, `sourceUrl`
  and `asOf`. `AIFigureGrid` always renders all three and makes the tile a link.
  **A figure that can't be sourced doesn't go on the page** — June is absent from
  the layoffs chart and the two smallest firm-size bands from the adoption chart
  for exactly that reason. Bump `AI_DATA_ASOF` when revising curated figures.

`AIMarketImpact` is the only computed section: an equal-weighted AI basket
ranked against **all 12 global indices**, defaulting to the 3Y window. The basket is a
**chained index of weekly returns**, not an average of rebased levels — that
matters because three constituents list mid-window, and averaging rebased levels
would drag the basket toward 100 the week each one appears, inventing a drop
that never happened. Equal- rather than cap-weighted on purpose (cap weighting
would just redraw the S&P). Chaining implies weekly rebalancing, so the card also
quotes the equal-weighted buy-and-hold return, which differs by tens of points
over five years. All lines are local-currency price returns with no FX
conversion — stated in the card, since an FX-adjusted comparison needs a base
currency this site doesn't define.

## Conventions & lessons learned

- **SVG renderer for every ECharts chart** (`opts={{ renderer: "svg" }}`) — canvas + web font = invisible labels on first paint.
- **Deterministic mock data only** — seed anything generated (string hash / index). Raw `Math.random()` → hydration mismatches.
- **No "live / real-time / LIVE DATA"** — weekly cadence; use `Last Updated` / `Next Update`.
- **Dashboard categories render in `CATEGORIES` array order** (`dashboard/page.tsx`) — to add a section at the top, put it first.
- **Use color tokens** (`var(--color-*)`) over hardcoded hex, except in ECharts configs (use the hex equivalents).
- **One chart window ladder site-wide: `3M / 6M / YTD / 2Y / 3Y`.** `CHART_VIEWS` (lib/chart-window.ts) is the single source of truth for it — the markets tables' old `YTD/52W/3Y` vocabulary is now an alias onto it. Each chart offers only the rungs its own series can fill (`horizonsFor`), so the PMI cards show 3M/6M and a 36-point macro series shows up to 3Y. A quarterly series needs >= 13 points to reach 3Y.
  - **`TimeHorizon` also carries `5Y`, which is NOT in `CHART_VIEWS` and is offered by no strip.** It exists so `sliceLength` can clamp /ai's 260-point series to a correct 3Y window. Don't add it to `CHART_VIEWS`: tables whose data stops at 3 years would show a 5Y tab that just relabels the same line.
  - `sliceLength` derives every fixed horizon from its month count. It used to short-circuit `3Y` to "return the whole series", which was only right while every sparkline was exactly 156 points — on /ai's 260-point series that silently drew five years under a 3Y label.
- **Index P/E is optional.** No free provider supplies it, so `pe`/`pe10yAvg` are hand-entered and typed optional; a card without them renders a dash. Never substitute a plausible-looking multiple — a wrong valuation figure is worse than a visibly absent one.
- **Heatmap % changes must be split-corrected.** Yahoo does not back-adjust recent splits: `Adj Close` and `auto_adjust=True` both come back identical to raw Close, so a 2:1 split publishes as a real -50% week (this happened, and flipped a whole sector negative). `fetch-heatmap.py` applies the factor from `Ticker.splits` for outliers past ±30%.
- **Don't create `.md` docs unless asked.**
