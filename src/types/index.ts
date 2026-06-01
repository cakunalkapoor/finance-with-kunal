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
  pe: number;          // Trailing 12-month P/E ratio
  pe10yAvg: number;    // 10-year average trailing P/E (for valuation context)
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
  value: number;
  change: number;
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
  category: "growth" | "employment" | "pmi" | "inflation" | "energy";
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

export type TimeHorizon = "1W" | "1M" | "3M" | "6M" | "1Y" | "3Y" | "5Y";
