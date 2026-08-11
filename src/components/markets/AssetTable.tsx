"use client";

import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import type { CSSProperties } from "react";
import { formatChange, getChangeColor, FONT_MONO } from "@/lib/utils";
import {
  CHART_VIEWS,
  pointLabel,
  sliceFor,
  windowLabel,
  type ChartView,
} from "@/lib/chart-window";
import SciFiCard, { CardHeader } from "@/components/ui/SciFiCard";
import TrendSparkline from "@/components/markets/TrendSparkline";
import { ChangeStack } from "@/components/markets/StatStack";

/* Shared table for the single-series asset classes — commodities, currencies
   and crypto. They differ only in what the secondary label says (unit, pair,
   symbol) and how the price is formatted, so they pass rows in this shape
   rather than each maintaining its own near-identical table. */

export interface AssetRow {
  key: string;
  icon: string;
  name: string;
  /** Secondary line under the name: "USD/bbl", "EUR/USD", "BTC-USD". */
  sub: string;
  /** Preformatted, because $84.62, 1.3421 and 99.66 all want different rules. */
  price: string;
  dailyChange: number;
  weekChange: number;
  monthChange: number;
  ytdChange: number;
  sparkline: number[];
  /** Outbound quote page, when there is one for this instrument. */
  href?: string;
  hrefTitle?: string;
}

const TH_STYLE: CSSProperties = {
  color: "var(--color-text-muted)",
  fontFamily: FONT_MONO,
  fontSize: "10px",
  letterSpacing: "0.1em",
};

export default function AssetTable({
  title,
  subtitle,
  rows,
  formatTooltip = (n) => n.toFixed(2),
}: {
  title: string;
  subtitle: string;
  rows: AssetRow[];
  formatTooltip?: (value: number) => string;
}) {
  const [chartView, setChartView] = useState<ChartView>("YTD");

  return (
    <SciFiCard>
      <CardHeader title={title} subtitle={subtitle} />
      <div className="overflow-x-auto">
        <table className="w-full text-xs" style={{ tableLayout: "fixed", minWidth: 440 }}>
          {/* Sized to sit two-up: at 1280px wide each card gets ~590px. */}
          <colgroup>
            <col style={{ width: "31%" }} />
            <col style={{ width: "20%" }} />
            <col style={{ width: "17%" }} />
            <col style={{ width: "32%" }} />
          </colgroup>
          <thead>
            <tr
              style={{
                background: "rgba(167,139,250,0.04)",
                borderBottom: "1px solid var(--color-space-border)",
              }}
            >
              {["Name", "Last", "Change"].map((h) => (
                <th
                  key={h}
                  className="px-4 py-2.5 text-left font-semibold tracking-widest uppercase whitespace-nowrap"
                  style={TH_STYLE}
                >
                  {h}
                </th>
              ))}
              <th className="px-4 py-2.5 text-left" style={TH_STYLE}>
                <div className="flex items-center gap-1">
                  {CHART_VIEWS.map((v) => (
                    <button
                      key={v}
                      onClick={() => setChartView(v)}
                      className="px-1.5 py-0.5 rounded transition-all"
                      style={{
                        fontFamily: FONT_MONO,
                        fontSize: "10px",
                        letterSpacing: "0.08em",
                        fontWeight: chartView === v ? 700 : 500,
                        color:
                          chartView === v ? "var(--color-neon-cyan)" : "var(--color-text-muted)",
                        background: chartView === v ? "rgba(167,139,250,0.12)" : "transparent",
                        border:
                          chartView === v
                            ? "1px solid rgba(167,139,250,0.3)"
                            : "1px solid transparent",
                      }}
                    >
                      {v}
                    </button>
                  ))}
                </div>
                <div
                  style={{
                    fontSize: "9px",
                    letterSpacing: "0.05em",
                    opacity: 0.7,
                    marginTop: "3px",
                    textTransform: "none",
                  }}
                >
                  {windowLabel(chartView)}
                </div>
              </th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row, i) => {
              const slice = sliceFor(chartView, row.sparkline);
              return (
                <tr
                  key={row.key}
                  style={{
                    borderBottom:
                      i < rows.length - 1 ? "1px solid rgba(44,38,72,0.7)" : "none",
                  }}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{row.icon}</span>
                      <div className="min-w-0">
                        {row.href ? (
                          <a
                            href={row.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={row.hrefTitle}
                            className="group inline-flex items-center gap-1 font-semibold text-[var(--color-text-primary)] transition-colors hover:text-[var(--color-neon-cyan)]"
                          >
                            <span className="underline-offset-2 group-hover:underline">
                              {row.name}
                            </span>
                            <ArrowUpRight
                              size={11}
                              strokeWidth={2.5}
                              className="opacity-35 transition-opacity group-hover:opacity-100"
                              aria-hidden
                            />
                          </a>
                        ) : (
                          <span
                            className="font-semibold"
                            style={{ color: "var(--color-text-primary)" }}
                          >
                            {row.name}
                          </span>
                        )}
                        <div
                          style={{
                            color: "var(--color-text-muted)",
                            fontFamily: FONT_MONO,
                            fontSize: "10px",
                          }}
                        >
                          {row.sub}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className="font-bold"
                      style={{
                        fontFamily: FONT_MONO,
                        color: "var(--color-text-primary)",
                        fontSize: "13px",
                      }}
                    >
                      {row.price}
                    </span>
                    <div
                      className={`font-semibold ${getChangeColor(row.dailyChange)}`}
                      style={{ fontFamily: FONT_MONO, fontSize: "10px" }}
                    >
                      {formatChange(row.dailyChange)} today
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <ChangeStack
                      items={[
                        { label: "1W", value: row.weekChange },
                        { label: "1M", value: row.monthChange },
                        { label: "YTD", value: row.ytdChange },
                      ]}
                    />
                  </td>

                  <td className="px-4 py-3">
                    <TrendSparkline
                      values={slice}
                      labels={slice.map((_, j) => pointLabel(j, slice.length))}
                      ariaLabel={`${row.name}, ${windowLabel(chartView)}`}
                      format={formatTooltip}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </SciFiCard>
  );
}
