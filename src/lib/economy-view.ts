import type { EconomicIndicator, YieldCurve } from "@/types";

export const ECONOMY_COVERAGE = [
  { id: "global", label: "Global", flag: "🌐", country: null },
  { id: "us", label: "US", flag: "🇺🇸", country: "United States" },
  { id: "canada", label: "Canada", flag: "🇨🇦", country: "Canada" },
] as const;
export type EconomyScope = typeof ECONOMY_COVERAGE[number]["id"];
export function economyScope(value: string | null): EconomyScope {
  return ECONOMY_COVERAGE.find(c => c.id === value)?.id ?? "global";
}
export type EconomyCategory = { id: EconomicIndicator["category"]; label: string };

const BASE_CATEGORIES: EconomyCategory[] = [
  { id: "pmi", label: "Activity" }, { id: "growth", label: "Growth" },
  { id: "employment", label: "Labour" }, { id: "inflation", label: "Inflation" },
  { id: "energy", label: "Energy" },
];
const COUNTRY_CATEGORIES: EconomyCategory[] = [
  ...BASE_CATEGORIES.filter(c => c.id !== "energy"),
  { id: "consumption", label: "Consumption" }, { id: "rates", label: "Rates" },
  { id: "trade", label: "Trade" }, { id: "fiscal", label: "Fiscal" },
];
const GLOBAL_CATEGORIES: EconomyCategory[] = [
  ...BASE_CATEGORIES.filter(c => c.id !== "energy"),
  { id: "rates", label: "Rates" }, { id: "energy", label: "Energy" },
];

/** Global contains every supplied indicator; country views keep their established scope. */
export function economyIndicators(indicators: EconomicIndicator[], scope: EconomyScope) {
  if (scope === "global") return indicators;
  const country = ECONOMY_COVERAGE.find(c => c.id === scope)?.country;
  return indicators.filter(i => i.country === country && COUNTRY_CATEGORIES.some(c => c.id === i.category));
}
export function economyCategories(scope: EconomyScope) {
  return scope === "global" ? GLOBAL_CATEGORIES : COUNTRY_CATEGORIES;
}
export function economyCurves(curves: YieldCurve[], scope: EconomyScope) {
  if (scope === "global") return curves;
  const country = ECONOMY_COVERAGE.find(c => c.id === scope)?.country;
  return curves.filter(c => c.country === country);
}
export function economyCurveId(curve: YieldCurve) {
  return `yield-curve-${curve.country.toLowerCase().replace(/\s+/g, "-")}`;
}
export const ECONOMY_HEADLINES: Record<EconomyScope, { id: string; label: string }[]> = {
  global: [{ id: "us-cpi", label: "US CPI (adjusted index)" }, { id: "us-unemployment", label: "US unemployment" }, { id: "china-mfg-pmi", label: "China manufacturing PMI" }, { id: "brent-oil", label: "Brent crude" }],
  us: [{ id: "us-gdp", label: "Real GDP growth" }, { id: "us-cpi", label: "CPI (adjusted index)" }, { id: "us-unemployment", label: "Unemployment" }, { id: "us-jobless-claims", label: "Initial jobless claims" }],
  canada: [{ id: "ca-gdp", label: "Real GDP growth" }, { id: "ca-cpi", label: "Consumer inflation" }, { id: "ca-unemployment", label: "Unemployment" }, { id: "ca-policy-rate", label: "Policy rate" }],
};

/** Monthly observations use YYYY-MM; weekly/daily observations use YYYY-MM-DD. */
export function economicTimestamp(date: string) {
  return Date.parse(`${date.length === 7 ? `${date}-01` : date}T00:00:00Z`);
}
const QUARTERLY = new Set(["us-gdp", "ea-gdp", "ca-gdp", "china-gdp", "uk-gdp", "jp-gdp", "au-gdp", "de-gdp", "fr-gdp", "kr-gdp", "us-tax-receipts", "ca-tax-receipts"]);
const monthYear = new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
const dayMonthYear = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
export function economicObservationLabel(indicator: EconomicIndicator, date: string) {
  if (indicator.observationLabels?.[date]) return indicator.observationLabels[date];
  const timestamp = economicTimestamp(date);
  if (!Number.isFinite(timestamp)) return date;
  const d = new Date(timestamp);
  if (QUARTERLY.has(indicator.id)) return `Q${Math.floor(d.getUTCMonth() / 3) + 1} ${d.getUTCFullYear()}`;
  if (indicator.id === "india-gdp") {
    const year = d.getUTCFullYear() - (d.getUTCMonth() < 3 ? 1 : 0);
    return `Q${Math.floor(((d.getUTCMonth() + 9) % 12) / 3) + 1} FY${year}–${String(year + 1).slice(-2)}`;
  }
  return indicator.category === "energy" || indicator.id === "us-jobless-claims" ? dayMonthYear.format(d) : monthYear.format(d);
}
export function economicPeriod(indicator: EconomicIndicator) {
  return QUARTERLY.has(indicator.id) && indicator.timeSeries.length ? economicObservationLabel(indicator, indicator.timeSeries.at(-1)!.date) : indicator.period;
}
export function economicUnit(indicator: EconomicIndicator) {
  if (indicator.id === "us-gdp") return "% QoQ annualized";
  if (indicator.id === "us-tax-receipts" || indicator.id === "ca-tax-receipts") return `${indicator.unit} annualized`;
  return indicator.unit;
}
export function economicDeltaUnit(indicator: EconomicIndicator) {
  return indicator.unit.includes("%") ? "pp" : indicator.category === "pmi" ? "pts" : indicator.unit;
}
export function economicTitle(indicator: EconomicIndicator) {
  if (indicator.id === "us-cpi") return "CPI inflation (adjusted index)";
  if (indicator.id === "ca-cpi") return "Consumer inflation (CPI)";
  if (indicator.id === "ea-hicp") return "Consumer inflation (HICP)";
  return indicator.name.replace(/^(US |Canada |China |India |Taiwan |South Korea |Euro Area |UK |Japan |Australia |Germany |France )/, "");
}
export function economicStatus(indicator: EconomicIndicator) {
  if (indicator.category === "pmi") return indicator.value > 50 ? "Above 50" : indicator.value < 50 ? "Below 50" : "At 50";
  return indicator.direction === "up" ? "Higher" : indicator.direction === "down" ? "Lower" : "Unchanged";
}
