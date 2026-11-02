import snapshot from "./international-economy-data.json";
import emerging from "./emerging-economy-data.json";
import india from "./india-cpi-data.json";
import type { EconomicIndicator } from "@/types";

// Supplements are validated by their fetchers before atomic snapshot writes.
const indiaIndicators = india.indicators.map(indicator => ({ ...indicator,
  description: `${indicator.description} Last successful source check: ${india.reviewedAt}.`,
  historyNote: [indicator.historyNote, india.cacheNote].filter(Boolean).join(" "),
}));
export const INTERNATIONAL_INDICATORS = [...snapshot.indicators, ...emerging.indicators, ...indiaIndicators] as EconomicIndicator[];
export const INTERNATIONAL_COVERAGE_NOTE = "Country coverage varies by measure; series with less than three years of sourced history are omitted.";
const reviewedAt = [snapshot.reviewedAt, emerging.reviewedAt, india.reviewedAt].sort().at(-1)!;
export const INTERNATIONAL_UPDATED_LABEL = `Last updated: ${new Intl.DateTimeFormat("en-US", {
  month: "short", day: "numeric", year: "numeric", timeZone: "UTC",
}).format(new Date(`${reviewedAt}T00:00:00Z`))}`;
