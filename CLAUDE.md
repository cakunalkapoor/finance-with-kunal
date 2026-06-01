@AGENTS.md

# Finance with Kunal

**Dev URL:** http://localhost:3001 · **Owner:** Kunal Kapoor (kunalkapoor.jnj@gmail.com) · **Repo:** `/Users/kunalkapoor/Downloads/finance-with-kunal`

A light, professional personal-finance blog + global-markets dashboard with a "Bloomberg terminal" feel. Static site, hosted on GitHub Pages. Curated **weekly cadence** — never use "live / real-time" language; pages show `Last Updated` / `Next Update` instead.

> **Deep reference** — data providers, dataset inventory, economic indicators, per-component behavior, and roadmap — lives in **[`docs/DATA.md`](docs/DATA.md)**. This file is the quick overview; open DATA.md when touching data or a specific component.

## Surfaces

| Route | Nav label | Purpose |
|-------|-----------|---------|
| `/` | — | Hero + Market Snapshot + Economic Snapshot + latest posts |
| `/markets` | **Markets** | Equity indices, bonds, commodities, FX, crypto, S&P 500 / TSX / NIFTY heatmap |
| `/dashboard` | **Economy** | Global Macro Snapshot + leading economic indicators |
| `/blog` | **Blog** | Long-form market commentary |

Nav labels and route slugs differ on purpose (`/dashboard` shows as "Economy"). Don't rename routes.

## Tech stack

- **Next.js 16.2.6** App Router (`src/app/`), TypeScript, alias `@/*`, **static export** (`output: "export"`)
- **Tailwind v4** via `@theme` in `globals.css` (no `tailwind.config.ts`)
- **ECharts 6** (`echarts-for-react`) — **always SVG renderer** (canvas drops labels before the web font loads)
- Fonts: **Space Grotesk** (display) + **Space Mono** (numbers) via `next/font`; use the shared `FONT_MONO` const from `lib/utils` for mono inline styles
- Node 25 / npm 11 / React 19
- **Next 16 has breaking changes vs older versions — check `node_modules/next/dist/docs/` before assuming older patterns work.**

## Design tokens (`globals.css` `@theme`)

Light theme. Surfaces: page `#f7f6fc`, card `#ffffff`, border `#e5e1f1`. Accents: violet `#7c3aed` (`--color-neon-cyan` — name kept for back-compat), indigo `#4f46e5` (`--color-neon-purple`). Market up `#059669` / down `#e11d48` / neutral `#d97706`. Text `#1e1b3a` / `#524b7a` / `#9590b8`. ECharts series use brighter hexes (`#34d399` up / `#fb7185` down) since charts can't read CSS vars.

Reusable UI: `SciFiCard` (glowing card wrapper + `CardHeader`) and `PageHeader` (label + title + Last/Next Update; dates are hardcoded per page in `page.tsx`).

## File map

```
src/
├── app/
│   ├── layout.tsx              # Root layout, fonts, metadata + OG, Navbar, Footer
│   ├── page.tsx                # Homepage: hero, Market + Economic snapshots, latest posts
│   ├── opengraph-image.tsx     # Build-time branded OG/social card
│   ├── globals.css             # @theme tokens, animations, grid bg
│   ├── markets/page.tsx        # Heatmap + Equity + Bonds + Commodities + Forex + Crypto
│   ├── dashboard/page.tsx      # MacroSnapshot + EconomicCharts + Notes
│   └── blog/{page.tsx, [slug]/page.tsx}
├── components/
│   ├── layout/{Navbar,Footer}.tsx
│   ├── ui/{SciFiCard,PageHeader}.tsx
│   ├── markets/                # MarketTicker, EquityMarketsTable, BondsTable,
│   │                           #   CommoditiesGrid, CryptoGrid, ForexGrid, MarketHeatmap
│   └── dashboard/              # MacroSnapshot, EconomicChart, EconomicNotes
├── lib/
│   ├── mock-data.ts            # ALL canned data (large — read with grep/offset, not whole-file)
│   ├── ticker-names.ts         # ticker → company name (heatmap tooltips)
│   └── utils.ts                # cn(), formatNumber, formatChange, getChangeColor, FONT_MONO
└── types/index.ts              # IndexQuote, BondYield, Commodity, CryptoAsset, ForexRate, ...
```

## Data (summary — full detail in `docs/DATA.md`)

Live providers wired in (Yahoo, Alpha Vantage, FRED; Twelve Data + Finnhub are scaffolds); everything else is **deterministic mock**. Keys in `.env.local` (gitignored). Refresh via `npm run fetch:<provider>`; each writes a gitignored `src/lib/<provider>-data.json` that is patched into `mock-data.ts`. Datasets exported from `mock-data.ts`: `EQUITY_INDICES`, `BOND_YIELDS`, `COMMODITIES`, `CRYPTO`, `FOREX_RATES`, `HEATMAP_INDICES`, `ECONOMIC_INDICATORS`, `MACRO_SNAPSHOT`, `BLOG_POSTS`.

## Running locally

```bash
npm run dev -- --port 3001     # dev server at http://localhost:3001
npm run build                  # static export to out/ — run before pushing
```

## Conventions & lessons learned

- **SVG renderer for every ECharts chart** (`opts={{ renderer: "svg" }}`) — canvas + web font = invisible labels on first paint.
- **Deterministic mock data only** — seed anything generated (string hash / index). Raw `Math.random()` → hydration mismatches.
- **No "live / real-time / LIVE DATA"** — weekly cadence; use `Last Updated` / `Next Update`.
- **Dashboard categories render in `CATEGORIES` array order** (`dashboard/page.tsx`) — to add a section at the top, put it first.
- **Use color tokens** (`var(--color-*)`) over hardcoded hex, except in ECharts configs (use the hex equivalents).
- **Don't create `.md` docs unless asked.**
