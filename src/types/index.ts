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
  trend: number[]; // 12-month normalized
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
  weekRange: string;
  lead: string;
  sections: WeeklyCommentarySection[];
}

export type TimeHorizon = "1W" | "1M" | "3M" | "6M" | "1Y" | "3Y" | "5Y";

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
