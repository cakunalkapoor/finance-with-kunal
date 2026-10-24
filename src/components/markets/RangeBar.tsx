import type { MarketRange52w } from "@/types";
import { rangePosition } from "@/lib/range-position";
import { formatNumber, FONT_MONO } from "@/lib/utils";

/** Fixed 52-week context, independent of the neighbouring chart's horizon. */
export default function RangeBar({
  value, range, label, format = (n) => formatNumber(n, n > 10000 ? 0 : 2),
  missingReason = "A full year of daily observations is unavailable.",
  showSource = false,
}: {
  value: number;
  range: MarketRange52w;
  label: string;
  format?: (value: number) => string;
  missingReason?: string;
  showSource?: boolean;
}) {
  const position = rangePosition(value, range.low52w, range.high52w);
  if (position == null) {
    return <div className="mt-1 text-[9px] leading-4 whitespace-normal"
      style={{ color: "var(--color-text-muted)", fontFamily: FONT_MONO }} title={missingReason}>
      52W range unavailable
    </div>;
  }
  const low = range.low52w!;
  const high = range.high52w!;
  const basis = range.range52wBasis === "published-yield-range"
    ? "Published 52-week yield range, including intraday observations"
    : "Daily closing range over 52 calendar weeks";
  const description = `${label}: ${basis}. Low ${format(low)}; high ${format(high)}; current ${format(value)}.${range.range52wAsOf ? ` Range as of ${range.range52wAsOf}.` : ""}${range.range52wSource ? ` Source: ${range.range52wSource}.` : ""}`;

  return (
    <div className="mt-1.5 flex w-full min-w-0 flex-col gap-1 text-[10px]" style={{ fontFamily: FONT_MONO }}>
      <div role="img" aria-label={description} title={description} className="flex min-w-0 flex-col gap-1">
        <div className="font-semibold" style={{ color: "var(--color-market-up)" }}>H: {format(high)}</div>
        <div className="relative h-1 rounded-full" style={{ background: "var(--color-space-border)" }} aria-hidden>
          <div className="absolute top-0 left-0 h-full rounded-full" style={{ width: `${position}%`, background: "linear-gradient(90deg, rgba(167,139,250,0.4), rgba(167,139,250,0.8))" }} />
          <div className="absolute top-1/2 -translate-y-1/2 size-1.5 rounded-full" style={{ left: `calc(${position}% - 3px)`, background: "var(--color-neon-cyan)", boxShadow: "0 0 4px var(--color-neon-cyan)" }} />
        </div>
        <div className="font-semibold" style={{ color: "var(--color-market-down)" }}>L: {format(low)}</div>
      </div>
      {showSource && range.range52wSourceUrl && (
        <a href={range.range52wSourceUrl} target="_blank" rel="noopener noreferrer"
          className="text-[9px] underline underline-offset-2 whitespace-normal"
          style={{ color: "var(--color-text-muted)" }}
          title={description} aria-label={`${label}: 52-week range source, ${range.range52wSource ?? "provider"}`}>
          52W source
        </a>
      )}
    </div>
  );
}
