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
  sparkline: number[]; // 12-week price points (normalized)
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

export interface EconomicIndicator {
  id: string;
  name: string;
  category: "growth" | "employment" | "manufacturing" | "services" | "inflation" | "trade" | "energy" | "shipping";
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
  exports: { value: number; trend: "up" | "down" | "neutral" };
  shipping: { value: number; trend: "up" | "down" | "neutral" };
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

export type TimeHorizon = "1W" | "1M" | "3M" | "6M" | "1Y" | "3Y" | "5Y";
