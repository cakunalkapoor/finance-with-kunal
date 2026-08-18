"use client";

import { FONT_MONO } from "@/lib/utils";
import type { ChartView } from "@/lib/chart-window";

/**
 * The chart-window tab strip, shared by every table that offers one — equities,
 * ETFs, the three asset tables, and the /ai stack table.
 *
 * Extracted because it was copy-pasted four times with the same inline styles,
 * and the copies had already drifted in formatting. One strip means the ladder
 * cannot look different in one table from another.
 *
 * It is deliberately TIGHT. The strip lives inside a table column, and the
 * markets page puts these tables in a two-column grid, so that column is only
 * ~150px wide. At the original `px-1.5` + `gap-1` + `0.08em` tracking, six
 * rungs wanted ~195px, pushed `3Y` past the card edge and put a horizontal
 * scrollbar on Global Equity Markets (28px) and ETFs (8px). Adding `1W` is what
 * tipped it over; five rungs had just fitted.
 *
 * `flex-wrap` is the actual guarantee, not the tightening. Tightening buys
 * enough room at today's column widths, but a longer label, another rung or a
 * narrower breakpoint would eat it again — and the failure mode of a fixed
 * table column is a scrollbar, which is what this is here to prevent. Wrapping
 * to a second row is the graceful version of running out of space.
 */
export default function ChartViewTabs({
  views,
  value,
  onChange,
}: {
  views: readonly ChartView[];
  value: ChartView;
  onChange: (view: ChartView) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-px gap-y-1">
      {views.map((v) => {
        const active = value === v;
        return (
          <button
            key={v}
            onClick={() => onChange(v)}
            aria-pressed={active}
            className="rounded px-1 py-0.5 transition-all"
            style={{
              fontFamily: FONT_MONO,
              fontSize: "10px",
              /* No tracking. On a six-rung strip in a ~150px column the extra
                 0.08em was ~5px — the difference between one row and two. The
                 padding stays at 4px so the active rung still reads as a pill. */
              letterSpacing: "0",
              fontWeight: active ? 700 : 500,
              color: active ? "var(--color-neon-cyan)" : "var(--color-text-muted)",
              background: active ? "rgba(167,139,250,0.12)" : "transparent",
              border: active
                ? "1px solid rgba(167,139,250,0.3)"
                : "1px solid transparent",
            }}
          >
            {v}
          </button>
        );
      })}
    </div>
  );
}
