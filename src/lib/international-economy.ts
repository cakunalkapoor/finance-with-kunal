import snapshot from "./international-economy-data.json";
import emerging from "./emerging-economy-data.json";
import type { EconomicIndicator } from "@/types";

// Both supplements are validated by their fetchers before atomic snapshot writes.
export const INTERNATIONAL_INDICATORS = [...snapshot.indicators, ...emerging.indicators] as EconomicIndicator[];
export const INTERNATIONAL_COVERAGE_NOTE = emerging.unavailable
  .map(item => `${item.country} ${item.measure}: recent comparable official data has not been verified.`)
  .join(" ");
const reviewedAt = [snapshot.reviewedAt, emerging.reviewedAt].sort().at(-1)!;
export const INTERNATIONAL_UPDATED_LABEL = `Last updated: ${new Intl.DateTimeFormat("en-US", {
  month: "short", day: "numeric", year: "numeric", timeZone: "UTC",
}).format(new Date(`${reviewedAt}T00:00:00Z`))}`;
