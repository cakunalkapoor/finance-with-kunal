import type { EconomicIndicator } from "@/types";

export type EconomyScope = "global" | "us" | "canada";
export type EconomyCategory = { id: EconomicIndicator["category"]; label: string };

const GLOBAL_CATEGORIES: EconomyCategory[] = [
  { id: "pmi", label: "Activity" }, { id: "growth", label: "Growth" },
  { id: "employment", label: "Labour" }, { id: "inflation", label: "Prices" },
  { id: "energy", label: "Energy" },
];
const COUNTRY_CATEGORIES: EconomyCategory[] = [
  ...GLOBAL_CATEGORIES.filter(c => c.id !== "energy"),
  { id: "consumption", label: "Consumption" }, { id: "rates", label: "Rates" },
  { id: "trade", label: "Trade" }, { id: "fiscal", label: "Fiscal" },
];
const COUNTRY_ONLY = new Set([
  "us-payrolls", "us-fed-funds", "us-trade-balance", "us-tax-receipts", "us-mfg-pmi", "us-services-pmi",
  "ca-gdp", "ca-gdp-monthly", "ca-cpi", "ca-unemployment", "ca-payrolls", "ca-policy-rate",
  "ca-trade-balance", "ca-tax-receipts", "ca-mfg-pmi", "ca-services-pmi", "us-retail-sales", "ca-retail-sales",
]);

/** Preserve the established populations of all three economy routes. */
export function economyIndicators(indicators: EconomicIndicator[], scope: EconomyScope) {
  if (scope === "global") return indicators.filter(i => !COUNTRY_ONLY.has(i.id));
  const country = scope === "us" ? "United States" : "Canada";
  return indicators.filter(i => i.country === country && COUNTRY_CATEGORIES.some(c => c.id === i.category));
}
export function economyCategories(scope: EconomyScope) {
  return scope === "global" ? GLOBAL_CATEGORIES : COUNTRY_CATEGORIES;
}
export const ECONOMY_HEADLINES: Record<EconomyScope, { id: string; label: string }[]> = {
  global: [{ id: "us-cpi", label: "US consumer inflation" }, { id: "us-unemployment", label: "US unemployment" }, { id: "china-mfg-pmi", label: "China manufacturing PMI" }, { id: "brent-oil", label: "Brent crude" }],
  us: [{ id: "us-gdp", label: "Real GDP growth" }, { id: "us-cpi", label: "Consumer inflation" }, { id: "us-unemployment", label: "Unemployment" }, { id: "us-jobless-claims", label: "Initial jobless claims" }],
  canada: [{ id: "ca-gdp", label: "Real GDP growth" }, { id: "ca-cpi", label: "Consumer inflation" }, { id: "ca-unemployment", label: "Unemployment" }, { id: "ca-policy-rate", label: "Policy rate" }],
};

/** Monthly observations use YYYY-MM; weekly/daily observations use YYYY-MM-DD. */
export function economicTimestamp(date: string) {
  return Date.parse(`${date.length === 7 ? `${date}-01` : date}T00:00:00Z`);
}
const QUARTERLY = new Set(["us-gdp", "ea-gdp", "ca-gdp", "china-gdp", "us-tax-receipts", "ca-tax-receipts"]);
const monthYear = new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric", timeZone: "UTC" });
const dayMonthYear = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
export function economicObservationLabel(indicator: EconomicIndicator, date: string) {
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
  if (indicator.id === "us-cpi" || indicator.id === "ca-cpi") return "Consumer inflation (CPI)";
  if (indicator.id === "ea-hicp") return "Consumer inflation (HICP)";
  return indicator.name.replace(/^(US |Canada |China |India |Taiwan |South Korea |Euro Area )/, "");
}
export function economicStatus(indicator: EconomicIndicator) {
  if (indicator.category === "pmi") return indicator.value > 50 ? "Above 50" : indicator.value < 50 ? "Below 50" : "At 50";
  return indicator.direction === "up" ? "Higher" : indicator.direction === "down" ? "Lower" : "Unchanged";
}
