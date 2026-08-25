import { DATA_UPDATED_AT } from "@/lib/site-data";

/*
 * The site's single briefing-status label. It is derived from `DATA_UPDATED_AT`
 * rather than hand-maintained, so every data surface stays in sync when
 * `patch-site-data.mjs` records a refresh.
 */

/** "Last updated: Aug 15, 2026" — shared by every dated surface. */
export const LAST_UPDATED_LABEL = `Last updated: ${DATA_UPDATED_AT}`;

/** Whether a page shows the shared update label. */
export type BriefingStatus = "updated" | "none";

export function briefingLabel(status: BriefingStatus): string | null {
  return status === "none" ? null : LAST_UPDATED_LABEL;
}
