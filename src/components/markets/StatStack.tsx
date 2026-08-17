import { formatChange, getChangeColor, FONT_MONO } from "@/lib/utils";

/* Half-width cards can't afford one column per period — 1W, 1M and YTD as
   separate columns need ~85px each, and at two-up a card only has ~590px to
   spend. Stacking the three as label/value pairs inside ONE cell keeps every
   number (nothing is dropped) and costs ~95px instead of ~255px. */

export function ChangeStack({
  items,
  digits = 2,
  suffix = "%",
  /** Bond moves are already in percentage POINTS, so they're signed but not "%". */
  raw = false,
}: {
  /** A `null` value renders as a dash — some rows genuinely have no figure for
   *  a period, and showing nothing is better than showing the wrong period's. */
  items: { label: string; value: number | null | undefined }[];
  digits?: number;
  suffix?: string;
  raw?: boolean;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      {items.map(({ label, value }) => (
        <div key={label} className="flex items-baseline justify-between gap-2">
          <span
            style={{
              fontFamily: FONT_MONO,
              fontSize: "9px",
              letterSpacing: "0.06em",
              color: "var(--color-text-muted)",
            }}
          >
            {label}
          </span>
          <span
            className={`font-semibold ${
              value == null ? "" : getChangeColor(value, !raw)
            }`}
            style={{
              fontFamily: FONT_MONO,
              fontSize: "11px",
              ...(value == null ? { color: "var(--color-text-muted)" } : {}),
            }}
          >
            {value == null
              ? "—"
              : raw
                ? `${value >= 0 ? "+" : ""}${value.toFixed(digits)}${suffix}`
                : formatChange(value)}
          </span>
        </div>
      ))}
    </div>
  );
}
