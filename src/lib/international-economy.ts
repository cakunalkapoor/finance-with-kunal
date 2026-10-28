import snapshot from "./international-economy-data.json";
import type { EconomicIndicator } from "@/types";

// Validated by fetch-international.py before its atomic snapshot write.
export const INTERNATIONAL_INDICATORS = snapshot.indicators as EconomicIndicator[];
export const INTERNATIONAL_UPDATED_LABEL = `Last updated: ${new Intl.DateTimeFormat("en-US", {
  month: "short", day: "numeric", year: "numeric", timeZone: "UTC",
}).format(new Date(`${snapshot.reviewedAt}T00:00:00Z`))}`;
