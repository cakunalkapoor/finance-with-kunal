"use client";

import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { AI_STOCKS, AI_STOCKS_ASOF, AI_SERIES_POINTS } from "@/lib/ai-data";
import { yahooSymbolUrl } from "@/lib/external-links";
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
import type { CSSProperties } from "react";
import type { AIStockLayer } from "@/types";

const TH_STYLE: CSSProperties = {
  color: "var(--color-text-muted)",
  fontFamily: FONT_MONO,
  fontSize: "10px",
  letterSpacing: "0.1em",
};

/* Grouped by position in the AI stack, and ordered within a group by nothing
   more meaningful than where they sit in the chain — never by return, since a
   ranked list of stocks reads as a recommendation. Same rule as ETFTable. */
const GROUPS: { layer: AIStockLayer; label: string; blurb: string }[] = [
  {
    layer: "platform",
    label: "Models, clouds & applications",
    blurb: "Sell the output — where AI revenue is actually booked",
  },
  {
    layer: "silicon",
    label: "Silicon & equipment",
    blurb: "Sell the compute, and the machines that make it",
  },
  {
    layer: "infra",
    label: "Power, cooling & interconnect",
    blurb: "Sell the building, the electricity and the network",
  },
  {
    layer: "systems",
    label: "Systems & memory",
    blurb: "Assemble the racks; supply the tightest input in the chain",
  },
];

const COLUMN_COUNT = 4;

export default function AIStockTable() {
  const [chartView, setChartView] = useState<ChartView>("YTD");

  return (
    <SciFiCard glow="cyan" cornerAccent>
      <CardHeader
        title="The AI stack, priced"
        subtitle={`${AI_STOCKS.length} listings · grouped by layer, not sector · not ranked · hover a chart for the value at that point · close of ${AI_STOCKS_ASOF}`}
      />
      <div className="overflow-x-auto">
        <table className="w-full text-xs" style={{ tableLayout: "fixed", minWidth: 560 }}>
          <colgroup>
            <col style={{ width: "32%" }} />
            <col style={{ width: "20%" }} />
            <col style={{ width: "17%" }} />
            <col style={{ width: "31%" }} />
          </colgroup>
          <thead>
            <tr
              style={{
                background: "rgba(167,139,250,0.04)",
                borderBottom: "1px solid var(--color-space-border)",
              }}
            >
              {["Company", "Last", "Change"].map((h) => (
                <th
                  key={h}
                  className="px-4 py-2.5 text-left font-semibold tracking-widest uppercase whitespace-nowrap"
                  style={TH_STYLE}
                >
                  {h}
                </th>
              ))}

              {/* The one site-wide ladder: 3M / 6M / YTD / 2Y / 3Y */}
              <th className="px-4 py-2.5 text-left" style={TH_STYLE}>
                <div className="flex items-center gap-1">
                  {CHART_VIEWS.map((v) => (
                    <button
                      key={v}
                      onClick={() => setChartView(v)}
                      className="rounded px-1.5 py-0.5 transition-all"
                      style={{
                        fontFamily: FONT_MONO,
                        fontSize: "10px",
                        letterSpacing: "0.08em",
                        fontWeight: chartView === v ? 700 : 500,
                        color: chartView === v ? "var(--color-neon-cyan)" : "var(--color-text-muted)",
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
                  {windowLabel(chartView, AI_SERIES_POINTS)}
                </div>
              </th>
            </tr>
          </thead>

          <tbody>
            {GROUPS.map(({ layer, label, blurb }) => {
              const rows = AI_STOCKS.filter((s) => s.layer === layer);
              if (rows.length === 0) return null;

              return [
                <tr key={label} style={{ background: "rgba(167,139,250,0.02)" }}>
                  <td
                    colSpan={COLUMN_COUNT}
                    className="px-4 py-2"
                    style={{
                      borderTop: "1px solid var(--color-space-border)",
                      borderBottom: "1px solid var(--color-space-border)",
                    }}
                  >
                    <span
                      className="font-semibold uppercase"
                      style={{ ...TH_STYLE, color: "var(--color-text-secondary)" }}
                    >
                      {label}
                    </span>
                    <span
                      className="ml-2"
                      style={{ color: "var(--color-text-muted)", fontSize: "10px" }}
                    >
                      {blurb}
                    </span>
                  </td>
                </tr>,

                ...rows.map((stock, i) => {
                  /* Drop the leading nulls of a listing younger than the window
                     (Arm, GE Vernova, Constellation). Nulls only ever lead, so
                     what's left is contiguous — and passing the SHORTER length
                     to pointLabel is what makes the axis honest: the labels
                     then count back from the last close and the sparkline
                     correctly reads as starting at the IPO, not five years ago. */
                  const slice = sliceFor(chartView, stock.sparkline).filter(
                    (v): v is number => v !== null,
                  );
                  if (slice.length < 2) return null;
                  return (
                    <tr
                      key={stock.symbol}
                      style={{
                        borderBottom:
                          i < rows.length - 1 ? "1px solid rgba(44,38,72,0.7)" : "none",
                      }}
                    >
                      <td className="px-4 py-3">
                        <a
                          href={yahooSymbolUrl(stock.symbol)}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={`${stock.ticker} on Yahoo Finance`}
                          className="group inline-flex items-center gap-1 font-semibold text-[var(--color-text-primary)] transition-colors hover:text-[var(--color-neon-cyan)]"
                        >
                          <span
                            className="underline-offset-2 group-hover:underline"
                            style={{ fontFamily: FONT_MONO }}
                          >
                            {stock.ticker}
                          </span>
                          <ArrowUpRight
                            size={11}
                            strokeWidth={2.5}
                            className="opacity-35 transition-opacity group-hover:opacity-100"
                            aria-hidden
                          />
                        </a>
                        <div
                          className="flex items-center gap-1"
                          style={{
                            color: "var(--color-text-muted)",
                            fontFamily: FONT_MONO,
                            fontSize: "10px",
                          }}
                        >
                          <span title={stock.country}>{stock.flag}</span>
                          <span className="truncate">{stock.company}</span>
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
                          {/* Won and yen quote in whole units; TWD to one place */}
                          {stock.currency === "KRW" || stock.currency === "JPY"
                            ? stock.value.toLocaleString("en-US", { maximumFractionDigits: 0 })
                            : stock.value.toFixed(2)}
                        </span>
                        <span
                          className="ml-1"
                          style={{
                            color: "var(--color-text-muted)",
                            fontFamily: FONT_MONO,
                            fontSize: "10px",
                          }}
                        >
                          {stock.currency}
                        </span>
                        <div
                          className={`font-semibold ${getChangeColor(stock.dailyChange)}`}
                          style={{ fontFamily: FONT_MONO, fontSize: "10px" }}
                        >
                          {formatChange(stock.dailyChange)} today
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <ChangeStack
                          items={[
                            { label: "1W", value: stock.weekChange },
                            { label: "1M", value: stock.monthChange },
                            { label: "YTD", value: stock.ytdChange },
                          ]}
                        />
                      </td>

                      <td className="px-4 py-3">
                        <TrendSparkline
                          values={slice}
                          labels={slice.map((_, j) => pointLabel(j, slice.length))}
                          ariaLabel={`${stock.ticker} price, ${windowLabel(chartView, AI_SERIES_POINTS)}`}
                        />
                      </td>
                    </tr>
                  );
                }),
              ];
            })}
          </tbody>
        </table>
      </div>

      <p
        className="px-4 py-3 leading-5"
        style={{
          color: "var(--color-text-muted)",
          fontSize: "11px",
          borderTop: "1px solid var(--color-space-border)",
        }}
      >
        Listed for reference, not as recommendations, and not investment advice. Membership is a
        judgement call, not a definition — there is no official &ldquo;AI sector&rdquo;, and most of
        these companies earn plenty of revenue that has nothing to do with AI. Each row is quoted
        in its own listing currency — won, yen, New Taiwan dollars and euros alongside the dollar
        rows — so prices are not comparable across rows. Only the percentage columns are.
      </p>
    </SciFiCard>
  );
}
