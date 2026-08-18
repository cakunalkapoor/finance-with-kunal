import { DATA_UPDATED_AT } from "@/lib/site-data";
import type { TimeHorizon } from "@/types";

/* Shared window maths for the sparkline columns in EquityMarketsTable and
   ETFTable.

   Both charts render `sparkline`: 156 points across the trailing 756 trading
   days (see fetch-yahoo.py::derive), downsampled evenly, so one point is one
   week and the LAST point is the latest close. Everything below counts weeks
   back from that last point.

   Dates are therefore accurate to about a week, never to the day — which is
   why labels are month-and-year and never "Aug 11". */

/* The site offers ONE set of chart windows everywhere — see TimeHorizon. The
   markets tables kept their own `ChartView` vocabulary (YTD/52W/3Y) until these
   were unified; the alias remains so those call sites read naturally. */
export type ChartView = TimeHorizon;

/** Every chart's tab strip, in order. The single source of truth.
 *
 *  This is the MAXIMUM, not a guarantee: a chart offers only the rungs its own
 *  series can fill. `1W` is the sharpest case — it reads a daily series that
 *  only the price rows carry, so the monthly economic cards and the bond trends
 *  drop it automatically. See `viewsFor` and the note on TimeHorizon. */
export const CHART_VIEWS: ChartView[] = ["1W", "3M", "6M", "YTD", "2Y", "3Y"];

const WEEK_MS = 7 * 86_400_000;

/** Sessions in the daily series behind `1W`. Six, not five — see
 *  fetch-yahoo.py::derive for why. */
export const DAILY_POINTS = 6;

/** Fixed-length horizons in months. YTD is absent by design: its length depends
 *  on where in the year the data ends, so it is derived per series instead.
 *
 *  `5Y` is present although no tab strip offers it: /ai's series still carry 260
 *  weekly points (5 years), and `sliceLength` needs the entry to clamp them
 *  correctly. See TimeHorizon.
 *
 *  `1W` is a quarter of a month, which is not a length any of this module's
 *  month arithmetic can use — `Date.UTC(y, m - 0.25, d)` is not a date. It is
 *  here only so the SPAN test in `horizonsFor` has a number to compare, and
 *  every path that builds an actual cutoff special-cases it first. */
const FIXED_MONTHS: Record<Exclude<TimeHorizon, "YTD">, number> = {
  "1W": 0.25,
  "3M": 3,
  "6M": 6,
  "2Y": 24,
  "3Y": 36,
  "5Y": 60,
};

/** Last data point's date. Falls back to today if DATA_UPDATED_AT is reformatted. */
function lastPointDate(): Date {
  const parsed = new Date(DATA_UPDATED_AT);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

/** Weeks from Jan 1 of the current data year to the last point. Computed rather
 *  than hard-coded: a fixed constant is only right for one month of the year,
 *  and made "YTD" start in February by August. */
function ytdWeeks(): number {
  const last = lastPointDate();
  const jan1 = new Date(Date.UTC(last.getUTCFullYear(), 0, 1));
  return Math.max(2, Math.round((last.getTime() - jan1.getTime()) / WEEK_MS) + 1);
}

/**
 * How many trailing points a view shows. The sparklines are weekly, so a fixed
 * horizon is its month count times ~4.345 weeks, clamped to what the series has.
 *
 * 3Y used to short-circuit to `total` — correct only while every series was
 * exactly 156 points / 3 years. /ai holds 260 points / 5 years, and under the
 * old rule its 3Y tab silently drew the full five. Deriving every fixed horizon
 * from its month count fixes that and leaves the 3y series unchanged:
 * 36 × 4.345 = 156, which is already all of them. This is what lets /ai keep
 * five years of history while showing the same 3Y window as everywhere else.
 */
export function sliceLength(view: ChartView, total: number): number {
  // 1W is counted in sessions, not weeks. Left to the line below it would ask
  // for round(0.25 × 4.345) = 1 week, get floored to the 2-point minimum, and
  // quietly draw two WEEKLY points under a "1W" label — a fortnight, mislabelled.
  if (view === "1W") return Math.min(total, DAILY_POINTS);
  const weeks =
    view === "YTD" ? ytdWeeks() : Math.round(FIXED_MONTHS[view] * 4.345);
  return Math.min(total, Math.max(2, weeks));
}

/** Generic over the element type so it also slices the nullable series on /ai,
 *  where `null` marks a week before a listing existed. */
export function sliceFor<T>(view: ChartView, data: T[]): T[] {
  return data.slice(-sliceLength(view, data.length));
}

const MONTH_YEAR = new Intl.DateTimeFormat("en-US", {
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

/** Date of point `i` within a slice of `length`, counting weeks back from the
 *  last data point. Approximate by design — see the note at the top. */
export function pointDate(i: number, length: number): Date {
  const last = lastPointDate();
  return new Date(last.getTime() - (length - 1 - i) * WEEK_MS);
}

export function pointLabel(i: number, length: number): string {
  return MONTH_YEAR.format(pointDate(i, length));
}

/* ── The 1W window ──────────────────────────────────────────────────────────
   1W is the only rung that reads a DIFFERENT series. Every other view slices
   the weekly sparkline; 1W reads `daily` — six real sessions carrying their
   own real dates. The three helpers below are what lets a table stay ignorant
   of that split: ask for the views, the values and the labels, and the right
   series comes back either way. */

const DAY_MONTH = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

const DAY_MONTH_YEAR = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

/** "Aug 11" from an ISO date, parsed as UTC on both sides — reading an ISO
 *  date back with LOCAL getters lands it a day west of Greenwich. */
function dayLabel(iso: string, withYear = false): string {
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return (withYear ? DAY_MONTH_YEAR : DAY_MONTH).format(d);
}

/** The rungs a price row can actually offer.
 *
 *  Drops 1W when the row has no daily series, so a chart never shows a tab it
 *  cannot draw — the same rule `horizonsFor` applies to dated series. This is
 *  what makes the feature safe to ship before a refresh has populated `daily`:
 *  rows without it simply keep the ladder they had. */
export function viewsFor(
  daily?: readonly unknown[] | boolean | null
): ChartView[] {
  // A table passes a boolean because it must check EVERY row: one tab strip
  // serves them all, so 1W is offered only when nothing would render blank.
  const ok =
    typeof daily === "boolean" ? daily : !!daily && daily.length >= 2;
  return ok ? CHART_VIEWS : CHART_VIEWS.filter((v) => v !== "1W");
}

/** The values a view draws: the daily series for 1W, a slice of the weekly one
 *  otherwise. Generic so it also handles /ai's nullable series. */
export function seriesFor<T>(
  view: ChartView,
  weekly: T[],
  daily?: readonly T[] | null
): T[] {
  if (view === "1W") return daily ? [...daily] : [];
  return sliceFor(view, weekly);
}

/** Point labels to match. 1W uses the series' own dates: `pointLabel` counts
 *  WEEKS back from the last refresh, which would stamp all six sessions with
 *  the same month and put them on the wrong days besides. */
export function labelsFor(
  view: ChartView,
  length: number,
  dailyDates?: readonly string[] | null
): string[] {
  if (view === "1W") return (dailyDates ?? []).map((d) => dayLabel(d));
  return Array.from({ length }, (_, i) => pointLabel(i, length));
}

/* ── Monthly series (bond yield trends) ────────────────────────────────────
   BOND_YIELDS.trend is one point per calendar month ending at that row's own
   `asOf`, which differs per country by a day or two — and by months for the
   OECD monthly series. So bond labels are derived per row from its asOf,
   never from the site-wide refresh date. */

/** Date of point `i` in a monthly series of `length` ending at `asOf` (ISO). */
export function monthlyPointDate(i: number, length: number, asOf: string): Date {
  const end = new Date(`${asOf}T00:00:00Z`);
  return new Date(
    Date.UTC(end.getUTCFullYear(), end.getUTCMonth() - (length - 1 - i), 1),
  );
}

export function monthlyPointLabel(i: number, length: number, asOf: string): string {
  return MONTH_YEAR.format(monthlyPointDate(i, length, asOf));
}

/** "Sep 2025 – Aug 2026" for one row's monthly trend. */
export function monthlyWindowLabel(length: number, asOf: string): string {
  if (length < 2) return "";
  return `${monthlyPointLabel(0, length, asOf)} – ${monthlyPointLabel(length - 1, length, asOf)}`;
}

/** "Jan – Aug 2026" / "Aug 2025 – Aug 2026" — the span the chart column covers,
 *  shown once in the header since every row shares the same window. */
export function windowLabel(
  view: ChartView,
  total = 156,
  dailyDates?: readonly string[] | null
): string {
  // 1W spans real sessions, so it is the one window that can be stated to the
  // day. Everything below it counts weeks back from the refresh date and is
  // deliberately only month-accurate — see the note at the top of this file.
  if (view === "1W") {
    const days = dailyDates ?? [];
    if (days.length < 2) return "";
    return `${dayLabel(days[0])} – ${dayLabel(days[days.length - 1], true)}`;
  }
  const length = sliceLength(view, total);
  const start = pointDate(0, length);
  const end = pointDate(length - 1, length);

  if (start.getUTCFullYear() === end.getUTCFullYear()) {
    const startMonth = new Intl.DateTimeFormat("en-US", {
      month: "short",
      timeZone: "UTC",
    }).format(start);
    return `${startMonth} – ${MONTH_YEAR.format(end)}`;
  }
  return `${MONTH_YEAR.format(start)} – ${MONTH_YEAR.format(end)}`;
}

/* ── Dated series (economic cards, yield curves) ────────────────────────────
   These charts carry real dates rather than a weekly sparkline, so their
   windows are computed from the series' own last point — not from the
   site-wide refresh date. A card only offers the windows its history can
   fill: most macro series hold ~36 monthly points, the PMI cards 6–7, so a
   tab longer than the data would just relabel the whole series. */

/* Series dates are ISO ("2026-07" or "2026-07-31"), which JS parses as UTC
   midnight. Reading them back with LOCAL getters shifts the date a day west of
   Greenwich and lands it in the previous month — which silently dropped January
   from YTD for every viewer in the Americas. Everything below is UTC on both
   sides of the comparison. */

/** Last dated point of a series, or null if it has none/unparseable. */
function lastDate(series: { date: string }[]): Date | null {
  if (!series.length) return null;
  const d = new Date(series[series.length - 1].date);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Months of history a horizon needs for this series. YTD runs from January of
 *  the last point's year, so in July it needs 7 months and in February, 2. */
export function horizonMonths(
  horizon: TimeHorizon,
  series: { date: string }[]
): number {
  if (horizon !== "YTD") return FIXED_MONTHS[horizon];
  const last = lastDate(series);
  return last ? last.getUTCMonth() + 1 : 12;
}

/** Earliest date a horizon includes, relative to the series' last point. */
export function horizonCutoff(
  horizon: TimeHorizon,
  series: { date: string }[]
): Date {
  const last = lastDate(series) ?? new Date();
  if (horizon === "YTD") return new Date(Date.UTC(last.getUTCFullYear(), 0, 1));
  // Seven days back, in days — `getUTCMonth() - 0.25` is not a month, and
  // Date.UTC would take the fraction and hand back an invalid date.
  if (horizon === "1W") return new Date(last.getTime() - WEEK_MS);
  return new Date(
    Date.UTC(
      last.getUTCFullYear(),
      last.getUTCMonth() - FIXED_MONTHS[horizon],
      last.getUTCDate()
    )
  );
}

/** Trim a dated series to one horizon. */
export function filterByHorizon<T extends { date: string }>(
  series: T[],
  horizon: TimeHorizon
): T[] {
  const cutoff = horizonCutoff(horizon, series);
  return series.filter((p) => new Date(p.date) >= cutoff);
}

/** Months of history a dated series covers, counting both endpoints: 36 monthly
 *  points from 2023-08 to 2026-07 are 36 months of data, not the 35 steps
 *  between them, and that difference decides whether a 3Y tab is offered. */
export function spanInMonths(series: { date: string }[]): number {
  if (series.length < 2) return 0;
  const a = new Date(series[0].date);
  const b = lastDate(series);
  if (!b || Number.isNaN(a.getTime())) return 0;
  return (
    (b.getUTCFullYear() - a.getUTCFullYear()) * 12 +
    (b.getUTCMonth() - a.getUTCMonth()) +
    1
  );
}

/**
 * The subset of CHART_VIEWS this series can actually fill. Always returns at
 * least one window, so a very short series still renders a tab strip.
 *
 * Two tests, not one. The span test rejects a window longer than the history
 * (a 5Y tab over three years of data). The point-count test rejects a window
 * the history is too COARSE to draw: a quarterly series has one observation in
 * any three-month window, and one point renders no line at all — so quarterly
 * cards legitimately show fewer tabs than monthly ones.
 */
export function horizonsFor(series: { date: string }[]): TimeHorizon[] {
  const span = spanInMonths(series);
  const fits = CHART_VIEWS.filter(
    (h) =>
      horizonMonths(h, series) <= span && filterByHorizon(series, h).length >= 2
  );
  return fits.length ? fits : CHART_VIEWS.slice(-1);
}

/** Preferred default, clamped to what the series supports. */
export function defaultHorizon(
  available: TimeHorizon[],
  preferred: TimeHorizon
): TimeHorizon {
  return available.includes(preferred) ? preferred : available[available.length - 1];
}

/* ── Monthly trends with a per-row asOf (the bond yield table) ───────────────
   These are bare number arrays, one point per calendar month, ending at the
   row's own asOf — which differs per country by a day or two, and by months
   for the OECD monthly series. So a window is a trailing point count computed
   from that row's asOf rather than a date filter. */

/** Months a horizon covers for a trend ending at `asOf`. */
function monthsForAsOf(horizon: TimeHorizon, asOf: string): number {
  if (horizon !== "YTD") return FIXED_MONTHS[horizon];
  const end = new Date(`${asOf}T00:00:00Z`);
  return Number.isNaN(end.getTime()) ? 12 : end.getUTCMonth() + 1;
}

/** Trailing points of a monthly trend that a horizon covers. */
export function monthlyHorizonSlice<T>(
  trend: T[],
  asOf: string,
  horizon: TimeHorizon
): T[] {
  return trend.slice(-Math.min(trend.length, monthsForAsOf(horizon, asOf)));
}

/** Windows a monthly trend ending at `asOf` can fill, on the same two tests as
 *  `horizonsFor`: the window must fit the history and hold at least 2 points.
 *  A row whose asOf is in January therefore has no YTD. */
export function monthlyHorizonsFor(length: number, asOf: string): TimeHorizon[] {
  const fits = CHART_VIEWS.filter((h) => {
    const need = monthsForAsOf(h, asOf);
    return need <= length && need >= 2;
  });
  return fits.length ? fits : CHART_VIEWS.slice(-1);
}
