@AGENTS.md

# Finance with Kunal

**Dev URL:** http://localhost:3001 · **Owner:** Kunal Kapoor (kunalkapoor.jnj@gmail.com) · **Repo:** `/Users/kunalkapoor/Projects/finance-with-kunal`

A light, professional personal-finance blog + global-markets dashboard with a "Bloomberg terminal" feel. Static site, hosted on GitHub Pages. Curated **weekly cadence** — never use "live / real-time" language; pages show `Last Updated` / `Next Update` instead.

> **Deep reference** — data providers, dataset inventory, economic indicators, per-component behavior, and roadmap — lives in **[`docs/DATA.md`](docs/DATA.md)**. This file is the quick overview; open DATA.md when touching data or a specific component.

## Surfaces

| Route | Nav label | Purpose |
|-------|-----------|---------|
| `/` | — | Hero + Market Snapshot + Economic Snapshot + latest posts |
| `/markets` | **Markets** | Equity indices, ETFs, bonds, commodities, FX, crypto, 11-index constituent heatmap |
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

Reusable UI: `BriefingHero` (page hero + Last/Next Update + stat tiles) is the standard page header; `SciFiCard` (card wrapper + `CardHeader`) for sections. `PageHeader` is the older, simpler variant. **Update dates are not hardcoded per page** — they come from `DATA_UPDATED_AT` / `NEXT_BRIEFING_AT` in `site-data.ts`, which `patch-site-data.mjs` maintains automatically (site-local time; next briefing = following Sunday).

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

## Conventions & lessons learned

- **SVG renderer for every ECharts chart** (`opts={{ renderer: "svg" }}`) — canvas + web font = invisible labels on first paint.
- **Deterministic mock data only** — seed anything generated (string hash / index). Raw `Math.random()` → hydration mismatches.
- **No "live / real-time / LIVE DATA"** — weekly cadence; use `Last Updated` / `Next Update`.
- **Dashboard categories render in `CATEGORIES` array order** (`dashboard/page.tsx`) — to add a section at the top, put it first.
- **Use color tokens** (`var(--color-*)`) over hardcoded hex, except in ECharts configs (use the hex equivalents).
- **One chart window ladder site-wide: `3M / 6M / YTD / 2Y / 3Y`.** `TimeHorizon` (types/index.ts) is exactly these five and `CHART_VIEWS` (lib/chart-window.ts) is the single source of truth — the markets tables' old `YTD/52W/3Y` vocabulary is now an alias onto it. Each chart offers only the rungs its own series can fill (`horizonsFor`), so the PMI cards show 3M/6M and a 36-point macro series shows up to 3Y. A quarterly series needs >= 13 points to reach 3Y.
- **Index P/E is optional.** No free provider supplies it, so `pe`/`pe10yAvg` are hand-entered and typed optional; a card without them renders a dash. Never substitute a plausible-looking multiple — a wrong valuation figure is worse than a visibly absent one.
- **Heatmap % changes must be split-corrected.** Yahoo does not back-adjust recent splits: `Adj Close` and `auto_adjust=True` both come back identical to raw Close, so a 2:1 split publishes as a real -50% week (this happened, and flipped a whole sector negative). `fetch-heatmap.py` applies the factor from `Ticker.splits` for outliers past ±30%.
- **Don't create `.md` docs unless asked.**
