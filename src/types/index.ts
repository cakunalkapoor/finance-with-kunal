export interface IndexQuote {
  symbol: string;
  name: string;
  region: string;
  flag: string;
  value: number;
  weekChange: number;
  monthChange: number;
  ytdChange: number;
  dailyChange: number;
  high52w: number;
  low52w: number;
  sparkline: number[]; // 52 weekly price points (used for both YTD and 52W chart)
  // Trailing 12-month P/E and its 10-year average, for valuation context.
  // Hand-curated — no fetcher supplies index-level P/E — so both are optional:
  // a newly added index carries none until the figures are sourced, and the
  // table renders a dash rather than a fabricated number.
  pe?: number;
  pe10yAvg?: number;
  realizedVol?: number; // Trailing 30-day annualized realized volatility, in percentage points (e.g. 15.5 = ~15.5%). Computed in fetch-yahoo.py from daily log-returns.
}

export interface BondYield {
  country: string;
  flag: string;
  maturity: string;
  yield: number;
  dailyMove: number;
  oneMonthMove: number;
  oneYearMove: number;
  /** 36 monthly points ending at `asOf`, so the trend column can offer the same
   *  window ladder as every other chart. Kept at 36 by patch-site-data.mjs. */
  trend: number[];
  /** Observation date of `yield` (YYYY-MM-DD). Surfaced in the UI: the UK, India
   *  and South Korea have no free daily feed and sit on a monthly OECD series,
   *  so a reader needs to see how old a number is. Kept current by
   *  patch-site-data.mjs from the freshest available dump. */
  asOf: string;
  /** Provider label, e.g. "Japan MoF JGB 10Y". */
  source: string;
  /** "daily" where a live feed exists, "monthly" for the OECD fallback. */
  cadence: "daily" | "monthly";
}

export interface Commodity {
  symbol: string;
  name: string;
  unit: string;
  value: number;
  dailyChange: number;
  weekChange: number;
  monthChange: number;
  ytdChange: number;
  icon: string;
  /** ~156 weekly closes across the trailing 3 years, as on IndexQuote. */
  sparkline: number[];
}

export interface CryptoAsset {
  symbol: string;
  name: string;
  icon: string;
  value: number;
  dailyChange: number;
  weekChange: number;
  monthChange: number;
  ytdChange: number;
  /** ~156 weekly closes across the trailing 3 years, as on IndexQuote. */
  sparkline: number[];
}

export interface ETF {
  /** Yahoo symbol — TSX listings carry the .TO suffix. */
  symbol: string;
  /** Exchange ticker as a reader would type it (XEQT, SPY). */
  ticker: string;
  name: string;
  provider: string;
  listing: "Canada" | "United States";
  /** Exposure group the row is filed under, e.g. "US equity". */
  exposure: string;
  currency: "CAD" | "USD";
  /** True for a CAD-hedged share class — the whole point of VSP next to VFV. */
  hedged?: boolean;
  value: number;
  dailyChange: number;
  weekChange: number;
  monthChange: number;
  ytdChange: number;
  /** ~156 weekly closes spanning the trailing 3 years, as on IndexQuote. */
  sparkline: number[];
}

export interface ForexRate {
  symbol: string;
  name: string;
  pair: string;
  icon: string;
  value: number;
  dailyChange: number;
  weekChange: number;
  monthChange: number;
  ytdChange: number;
  /** ~156 weekly closes across the trailing 3 years, as on IndexQuote. */
  sparkline: number[];
}

export interface HeatmapSector {
  name: string;
  value: number; // market cap weight
  change: number;
  children?: HeatmapStock[];
}

export interface HeatmapStock {
  name: string;
  ticker: string;
  /** Exchange-qualified Yahoo symbol the quote was fetched under (0700.HK,
   *  BA.L, BRK-B). Carried through from the catalogue so a tile's link and its
   *  price can never refer to different listings. */
  yahoo?: string;
  value: number;
  change: number | null;
}

export interface HeatmapIndex {
  id: string;
  name: string;
  flag: string;
  description: string;
  sectors: HeatmapSector[];
}

export interface EconomicIndicator {
  id: string;
  name: string;
  category: "growth" | "employment" | "pmi" | "inflation" | "energy" | "rates" | "trade" | "fiscal" | "consumption";
  country: string;
  flag: string;
  value: number;
  unit: string;
  previousValue: number;
  change: number;
  direction: "up" | "down" | "neutral";
  isPositiveGood: boolean;
  period: string;
  timeSeries: { date: string; value: number }[];
  description: string;
}

export interface MacroSnapshot {
  gdp: { value: number; trend: "up" | "down" | "neutral" };
  pmi: { value: number; trend: "up" | "down" | "neutral" };
  inflation: { value: number; trend: "up" | "down" | "neutral" };
  jobs: { value: number; trend: "up" | "down" | "neutral" };
  claims: { value: number; trend: "up" | "down" | "neutral" };
  oil: { value: number; trend: "up" | "down" | "neutral" };
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  readTime: number;
  tags: string[];
}

export interface ExternalCommentary {
  id: string;
  title: string;
  excerpt: string;
  source: string;
  sourceUrl: string;
  date: string;
  category: string;
}

export interface WeeklyCommentarySection {
  id: string;
  title: string;
  icon: string;
  body: string;
  link?: { href: string; label: string };
}

export interface WeeklyCommentary {
  /** @deprecated No longer rendered. The site-wide briefing label is derived
   *  from DATA_UPDATED_AT by `lib/briefing.ts` so it can't drift from the data;
   *  this stays only as editorial metadata on the commentary itself. */
  weekRange: string;
  lead: string;
  sections: WeeklyCommentarySection[];
}

/**
 * The one time-window vocabulary for every chart on the site — the economic
 * cards, the yield curves, and the sparkline columns in the markets tables.
 *
 * The first five are what almost everything offers, and `CHART_VIEWS` in
 * `lib/chart-window.ts` is that strip. **5Y is not part of it**: it exists only
 * for `/ai`, whose stock and index series are fetched at 260 weekly points over
 * five years rather than the 156/3y held elsewhere, and it is offered through
 * `EXTENDED_CHART_VIEWS`. Adding it to the site-wide strip would put a 5Y tab
 * on tables whose data stops at three years.
 *
 * YTD is not a fixed length: it runs from January of the latest data point's
 * year, so how much history it needs depends on when in the year you ask. See
 * `horizonMonths` / `horizonCutoff` in `lib/chart-window.ts`.
 */
export type TimeHorizon = "3M" | "6M" | "YTD" | "2Y" | "3Y" | "5Y";

/* ── AI dashboard (/ai) ─────────────────────────────────────────────────────
   Almost nothing on this page has a free API behind it. Company AI revenue is
   a run-rate mentioned on an earnings call, layoff attribution comes from one
   private outplacement firm's monthly press release, and deal flow is whatever
   the parties chose to announce. So every curated figure carries its own
   `source`, `sourceUrl` and `asOf` and the UI always renders them — a number
   on this page is only as good as the link next to it.

   The one exception is AIStock, which is real Yahoo data on the site's normal
   weekly cadence (fetch-yahoo.py --only=ai → patch-ai-stocks.mjs). */

/** Where a company sits in the AI stack. Grouping is by layer, not GICS sector:
 *  the page's argument is that AI exposure cuts across Technology, Utilities,
 *  Industrials and Real Estate. Mirrors `layer` in fetch-yahoo.py::AI_STOCKS. */
export type AIStockLayer = "platform" | "silicon" | "infra" | "systems";

/** Listing currencies across the AI universe. Values are never summed or ranked
 *  across currencies; only rebased percentage returns are compared. */
export type AICurrency = "USD" | "KRW" | "JPY" | "TWD" | "EUR";

export interface AIStock {
  /** Yahoo symbol — non-US listings carry an exchange suffix (.KS, .T, .TW, .PA). */
  symbol: string;
  /** Exchange ticker as a reader would type it. */
  ticker: string;
  company: string;
  layer: AIStockLayer;
  /** Country of listing, for the flag and the "around the world" framing. */
  country: string;
  flag: string;
  currency: AICurrency;
  value: number;
  dailyChange: number;
  weekChange: number;
  monthChange: number;
  ytdChange: number;
  high52w: number;
  low52w: number;
  /**
   * 260 weekly closes across the trailing 5 years — LONGER than the 156/3y the
   * rest of the site holds, so /ai can offer a 5Y window. See TimeHorizon.
   *
   * `null` marks a week BEFORE this listing existed, and several names in the
   * universe are younger than the window: Arm IPO'd Sept 2023, GE Vernova was
   * spun out Apr 2024, Constellation Feb 2022. Every series shares one weekly
   * date grid (built in fetch-yahoo.py from the S&P 500), so point `i` is the
   * same calendar week in every series on the page — which is what makes the
   * basket comparison valid. Consumers must skip nulls rather than treat them
   * as zero.
   */
  sparkline: (number | null)[];
  /** Trailing 30-day annualized realized volatility, in percentage points. */
  realizedVol?: number;
}

/**
 * One global equity index as a 5-year weekly series, for the /ai basket
 * comparison.
 *
 * Kept here rather than read off `EQUITY_INDICES` because those sparklines are
 * 156 points / 3 years — the markets tables need no more than that. Display
 * metadata travels with the series so the chart has no ordering dependency on
 * site-data.
 */
export interface AIIndexSeries {
  symbol: string;
  name: string;
  region: string;
  flag: string;
  /** 260 weekly closes over the trailing 5 years, in the index's own currency,
   *  on the same shared weekly grid as AIStock.sparkline. `null` where the
   *  index has no observation for that week. */
  series: (number | null)[];
}

/**
 * One hand-curated figure with its provenance. Used everywhere on /ai that a
 * number came from a filing, a press release or a report rather than a feed.
 */
export interface AIFigure {
  id: string;
  /** What the number describes, e.g. "Microsoft AI business". */
  label: string;
  /** Headline number as published, formatted for display: "$37B", "76%". */
  value: string;
  /** The qualifier that makes the number meaningful — period, growth, basis. */
  detail: string;
  /** Publisher as it should be credited, e.g. "Microsoft FY26 Q2". */
  source: string;
  sourceUrl: string;
  /** Date the figure was reported, ISO yyyy-mm-dd. */
  asOf: string;
}

/** A company's published capex plan for the year. */
export interface AICapexPlan {
  company: string;
  ticker: string;
  /** Low end of guidance, USD billions. Equal to `high` for a point estimate. */
  low: number;
  /** High end of guidance, USD billions. */
  high: number;
  /** Prior-year actual, USD billions — the comparison that gives the plan scale. */
  priorYear: number;
  /** True where guidance was raised during the year; the page says so explicitly. */
  raised: boolean;
  note: string;
  source: string;
  sourceUrl: string;
  asOf: string;
}

/** One month of Challenger's AI-attributed job-cut attribution. */
export interface AILayoffMonth {
  /** Display month, e.g. "Jan 2026". */
  month: string;
  /** Share of that month's announced US cuts that named AI as the reason, %. */
  aiSharePct: number;
  /** AI-attributed cuts announced that month, where published. */
  aiCuts?: number;
  /** All announced US cuts that month, where published. */
  totalCuts?: number;
}

/** A disclosed AI financing or valuation event. */
export interface AIDeal {
  company: string;
  /** Round label as announced, e.g. "Series H". */
  round: string;
  /** Amount raised, USD billions. */
  amount: number;
  /** Post-money valuation, USD billions. Omitted where not disclosed. */
  valuation?: number;
  /** Announcement date, ISO yyyy-mm-dd. */
  date: string;
  leadInvestors: string;
  source: string;
  sourceUrl: string;
}

/** A quarter of venture funding and how much of it went to AI. */
export interface AIFundingQuarter {
  quarter: string;
  /** All global venture funding that quarter, USD billions. */
  totalUsdBn: number;
  /** Share of it invested in AI-focused companies, %. */
  aiSharePct: number;
}

/** A point on a simple labelled series — adoption rates, cost curves. */
export interface AISeriesPoint {
  label: string;
  value: number;
}

export interface ExperienceItem {
  title: string;
  company: string;
  companyNote?: string;
  period: string;
  location: string;
  highlights: string[];
}

export interface EducationItem {
  degree: string;
  institution: string;
  year: string;
  detail?: string;
}

export interface SkillCategory {
  category: string;
  items: string[];
}

export interface ProfileStat {
  value: string;
  label: string;
}

export interface ProfileHighlight {
  title: string;
  description: string;
  icon: string;
}

export interface ProfileData {
  name: string;
  tagline: string;
  location: string;
  photo?: string;
  summary: string[];
  quote?: string;
  stats: ProfileStat[];
  highlights: ProfileHighlight[];
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: SkillCategory[];
  links: { label: string; url: string; icon: string }[];
}

/** One maturity on a country's yield curve, with its monthly history. */
export interface YieldCurveTenor {
  /** Short axis/legend label, e.g. "10Y". */
  label: string;
  /** Full name for the tooltip and description, e.g. "10-year Treasury". */
  name: string;
  value: number;
  series: { date: string; value: number }[];
}

/**
 * The long end of one country's curve: two maturities on a shared % axis, plus
 * the spread between them. Kept separate from EconomicIndicator, which models a
 * single series and cannot express the pair or their spread.
 */
export interface YieldCurve {
  country: string;
  flag: string;
  /** Observation date of the latest point, ISO yyyy-mm-dd. */
  asOf: string;
  /** long minus short, in basis points; negative means the curve is inverted. */
  spreadBps: number;
  short: YieldCurveTenor;
  long: YieldCurveTenor;
  source: string;
}
