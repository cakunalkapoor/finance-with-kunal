"use client";

import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import {
  AI_STOCKS,
  AI_STOCKS_ASOF,
  AI_SERIES_POINTS,
  AI_DAILY_DATES,
} from "@/lib/ai-data";
import { yahooSymbolUrl } from "@/lib/external-links";
import { formatChange, getChangeColor, FONT_MONO } from "@/lib/utils";
import {
  labelsFor,
  pointLabel,
  seriesFor,
  viewsFor,
  windowLabel,
  type ChartView,
} from "@/lib/chart-window";
import SciFiCard, { CardHeader } from "@/components/ui/SciFiCard";
import TrendSparkline from "@/components/markets/TrendSparkline";
import ChartViewTabs from "@/components/markets/ChartViewTabs";
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

  /* All 40 /ai series sit on one shared daily grid, so availability is a single
     question rather than a per-row one. */
  const views = viewsFor(AI_DAILY_DATES.length >= 2);

  return (
    <SciFiCard glow="cyan" cornerAccent>
      <CardHeader
        title="The AI stack, priced"
        subtitle={`${AI_STOCKS.length} listings · all prices and returns in USD · grouped by layer, not sector · not ranked · hover a chart for the value at that point · close of ${AI_STOCKS_ASOF}`}
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
              {["Company", "Last (USD)", "Change"].map((h) => (
                <th
                  key={h}
                  className={`px-4 py-2.5 font-semibold tracking-widest uppercase whitespace-nowrap ${
                    // The price column is right-aligned so its decimals line up;
                    // the header has to follow it or it floats off to the left.
                    h === "Last (USD)" ? "text-right" : "text-left"
                  }`}
                  style={TH_STYLE}
                >
                  {h}
                </th>
              ))}

              {/* The one site-wide ladder: 1W / 3M / 6M / YTD / 2Y / 3Y */}
              <th className="px-4 py-2.5 text-left" style={TH_STYLE}>
                <ChartViewTabs views={views} value={chartView} onChange={setChartView} />
                <div
                  style={{
                    fontSize: "9px",
                    letterSpacing: "0.05em",
                    opacity: 0.7,
                    marginTop: "3px",
                    textTransform: "none",
                  }}
                >
                  {windowLabel(chartView, AI_SERIES_POINTS, AI_DAILY_DATES)}
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
                     what's left is contiguous. */
                  const raw = seriesFor(chartView, stock.sparkline, stock.daily);
                  const kept = raw
                    .map((v, j) => j)
                    .filter((j) => raw[j] !== null);
                  const slice = kept.map((j) => raw[j] as number);
                  if (slice.length < 2) return null;
                  /* Two label rules, because the two series carry time
                     differently. The weekly labels are DERIVED by counting back
                     from the last close, so they take the SHORTER length — that
                     is what makes an Arm sparkline read as starting at its IPO
                     rather than five years ago. The 1W labels are REAL dates off
                     the shared grid, so they are indexed by original position
                     instead: renumbering them would slide each point onto the
                     wrong day. */
                  const allLabels = labelsFor(chartView, raw.length, AI_DAILY_DATES);
                  const sliceLabels =
                    chartView === "1W"
                      ? kept.map((j) => allLabels[j])
                      : slice.map((_, j) => pointLabel(j, slice.length));
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

                      {/* Right-aligned so the decimal points line up down the
                          column — $8.08 and $1161.03 are meant to be compared at
                          a glance. That only works if the price sits alone on
                          its line, so the currency marker moved down beside the
                          daily change rather than trailing the number. */}
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        <div
                          className="font-bold"
                          style={{
                            fontFamily: FONT_MONO,
                            color: "var(--color-text-primary)",
                            fontSize: "13px",
                          }}
                        >
                          {/* Every row is USD — converted in the fetcher before
                              any figure was derived, so two decimals suit all
                              of them regardless of what the exchange quotes. */}
                          ${stock.value.toFixed(2)}
                        </div>
                        <div
                          className="flex items-baseline justify-end gap-1.5"
                          style={{ fontFamily: FONT_MONO, fontSize: "10px" }}
                        >
                          {stock.listingCurrency !== "USD" && (
                            <span
                              title={`Trades in ${stock.listingCurrency}; converted to USD at the rate on each close`}
                              style={{ color: "var(--color-text-muted)", fontSize: "9px" }}
                            >
                              ← {stock.listingCurrency}
                            </span>
                          )}
                          <span className={`font-semibold ${getChangeColor(stock.dailyChange)}`}>
                            {formatChange(stock.dailyChange)} today
                          </span>
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
                          labels={sliceLabels}
                          ariaLabel={`${stock.ticker} price, ${windowLabel(chartView, AI_SERIES_POINTS, AI_DAILY_DATES)}`}
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
        these companies earn plenty of revenue that has nothing to do with AI. Prices and returns
        are in <strong style={{ color: "var(--color-text-secondary)" }}>US dollars</strong>{" "}
        for every row, including the Korean, Japanese, Taiwanese and European listings: each daily close is
        converted at that day&rsquo;s rate before anything is derived from it, so a return here is
        what a dollar investor actually earned, currency move included. An arrow marks the currency
        a row trades in.
      </p>
    </SciFiCard>
  );
}
