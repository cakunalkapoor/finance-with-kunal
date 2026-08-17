import { DATA_UPDATED_AT } from "@/lib/site-data";

/*
 * The site's ONE briefing-status label.
 *
 * Every surface that says when the data is from renders `BRIEFING_WEEK` and
 * nothing else — the hero on every page, the homepage eyebrow, and the weekly
 * commentary card. Previously the hero showed "Updated <date> · Next briefing
 * <date>" while the homepage showed "WEEK OF AUG 10 – AUG 14, 2026", so the same
 * refresh was described two different ways depending on the page.
 *
 * Derived from `DATA_UPDATED_AT` rather than hand-maintained, so it cannot go
 * stale: `patch-site-data.mjs` already sets that constant on every refresh, and
 * the week follows automatically.
 *
 * The window is the last COMPLETED trading week — Monday to Friday, ending on
 * the Friday on or before the data date. A refresh lands Saturday or Sunday, so
 * the label describes the week whose closes the page is actually showing rather
 * than the weekend it was published on.
 */

const DAY_MS = 86_400_000;

/** Data date as UTC midnight. Falls back to today if the constant is reformatted. */
function dataDate(): Date {
  const parsed = new Date(`${DATA_UPDATED_AT} 00:00:00Z`);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

const monthDay = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

const monthDayYear = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

/** Monday–Friday of the last completed trading week, as a display range. */
function briefingWeek(): string {
  const d = dataDate();
  const dow = d.getUTCDay(); // 0 = Sunday
  // Step back to the most recent Friday. Sat/Sun step back 1–2 days; Mon–Fri
  // step back to the PREVIOUS Friday, since the current week isn't closed yet.
  const backToFriday = dow >= 5 ? dow - 5 : dow + 2;
  const friday = new Date(d.getTime() - backToFriday * DAY_MS);
  const monday = new Date(friday.getTime() - 4 * DAY_MS);

  // A week spanning New Year needs the year on both ends to be unambiguous.
  const spansYears = monday.getUTCFullYear() !== friday.getUTCFullYear();
  const start = spansYears ? monthDayYear.format(monday) : monthDay.format(monday);
  return `${start} – ${monthDayYear.format(friday)}`;
}

/** "Aug 10 – Aug 14, 2026" — the week the current data covers. */
export const BRIEFING_WEEK = briefingWeek();

/** "Week of Aug 10 – Aug 14, 2026" — for pages whose data IS weekly. */
export const BRIEFING_WEEK_LABEL = `Week of ${BRIEFING_WEEK}`;

/**
 * "Last updated: Aug 15, 2026" — for pages whose data is NOT weekly.
 *
 * The economic pages (/dashboard, /us-economy, /canada-economy) carry monthly
 * and quarterly series: CPI, GDP, PMI, unemployment. Labelling those "Week of
 * Aug 10 – Aug 14" would claim a cadence the underlying statistics don't have —
 * a GDP print doesn't belong to a trading week. Those pages say when the site
 * last refreshed instead, which is the honest claim.
 *
 * Markets and /ai keep the week label: their data really is a week of closes.
 */
export const LAST_UPDATED_LABEL = `Last updated: ${DATA_UPDATED_AT}`;

/** Which briefing label a page shows. `none` for pages that aren't data-driven. */
export type BriefingStatus = "week" | "updated" | "none";

export function briefingLabel(status: BriefingStatus): string | null {
  if (status === "none") return null;
  return status === "week" ? BRIEFING_WEEK_LABEL : LAST_UPDATED_LABEL;
}
