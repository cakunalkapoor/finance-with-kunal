import { DATA_UPDATED_AT } from "@/lib/site-data";

/* Shared window maths for the sparkline columns in EquityMarketsTable and
   ETFTable.

   Both charts render `sparkline`: 156 points across the trailing 756 trading
   days (see fetch-yahoo.py::derive), downsampled evenly, so one point is one
   week and the LAST point is the latest close. Everything below counts weeks
   back from that last point.

   Dates are therefore accurate to about a week, never to the day — which is
   why labels are month-and-year and never "Aug 11". */

export type ChartView = "YTD" | "52W" | "3Y";

export const CHART_VIEWS: ChartView[] = ["YTD", "52W", "3Y"];

const WEEK_MS = 7 * 86_400_000;

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

/** How many trailing points a view shows. */
export function sliceLength(view: ChartView, total: number): number {
  if (view === "3Y") return total;
  const weeks = view === "YTD" ? ytdWeeks() : 52;
  return Math.min(total, Math.max(2, weeks));
}

export function sliceFor(view: ChartView, data: number[]): number[] {
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
export function windowLabel(view: ChartView, total = 156): string {
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
