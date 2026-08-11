"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { ArrowUpRight } from "lucide-react";
import { ETFS } from "@/lib/site-data";
import { yahooEtfUrl } from "@/lib/external-links";
import { formatChange, getChangeColor, FONT_MONO } from "@/lib/utils";
import SciFiCard, { CardHeader } from "@/components/ui/SciFiCard";
import type { CSSProperties } from "react";
import type { EChartsOption } from "echarts";
import type { ETF } from "@/types";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

type ChartView = "YTD" | "52W" | "3Y";

// Same windows as the equity table: the sparkline is ~156 weekly points across
// the trailing ~3 years, so YTD ≈ the last 28 weeks and 52W the last 52.
const YTD_WEEKS = 28;
const WEEKS_52 = 52;

function SparklineChart({ data, view }: { data: number[]; view: ChartView }) {
  const slice =
    view === "YTD" ? data.slice(-YTD_WEEKS) : view === "52W" ? data.slice(-WEEKS_52) : data;
  const min = Math.min(...slice);
  const max = Math.max(...slice);
  // Colour follows the trend of the *visible* window, so it stays truthful when
  // the reader toggles between YTD and 3Y.
  const positive = slice[slice.length - 1] >= slice[0];
  const color = positive ? "#34d399" : "#fb7185";
  const option: EChartsOption = {
    animation: false,
    grid: { top: 2, bottom: 2, left: 2, right: 2 },
    xAxis: { type: "category", show: false, data: slice.map((_, i) => i) },
    yAxis: { type: "value", show: false, min: min * 0.997, max: max * 1.003 },
    series: [
      {
        type: "line",
        data: slice,
        smooth: true,
        symbol: "none",
        lineStyle: { width: 1.5, color },
        areaStyle: {
          color: {
            type: "linear",
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: positive ? "rgba(52,211,153,0.16)" : "rgba(251,113,133,0.16)" },
              { offset: 1, color: "rgba(0,0,0,0)" },
            ],
          },
        },
      },
    ],
  };
  return (
    <ReactECharts option={option} style={{ height: 36, width: 100 }} opts={{ renderer: "svg" }} />
  );
}

const TH_STYLE: CSSProperties = {
  color: "var(--color-text-muted)",
  fontFamily: FONT_MONO,
  fontSize: "10px",
  letterSpacing: "0.1em",
};

/* Grouped by where the fund is listed, then ordered by exposure inside each
   group — never by return, since a ranked fund list reads as a recommendation. */
const GROUPS: { listing: ETF["listing"]; label: string; flag: string }[] = [
  { listing: "Canada", label: "Listed in Canada", flag: "🇨🇦" },
  { listing: "United States", label: "Listed in the US", flag: "🇺🇸" },
];

const COLUMN_COUNT = 7;

export default function ETFTable() {
  const [chartView, setChartView] = useState<ChartView>("YTD");

  return (
    <SciFiCard glow="cyan" cornerAccent>
      <CardHeader
        title="ETFs"
        subtitle="16 funds · grouped by exposure, not ranked · click a ticker for the full quote on Yahoo Finance"
      />
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr
              style={{
                background: "rgba(167,139,250,0.04)",
                borderBottom: "1px solid var(--color-space-border)",
              }}
            >
              {["Fund", "Exposure", "Last", "1W", "1M", "YTD"].map((h) => (
                <th
                  key={h}
                  className="px-4 py-2.5 text-left font-semibold tracking-widest uppercase whitespace-nowrap"
                  style={TH_STYLE}
                >
                  {h}
                </th>
              ))}

              {/* Chart column with the YTD / 52W / 3Y toggle */}
              <th className="px-4 py-2.5 text-left" style={TH_STYLE}>
                <div className="flex items-center gap-1">
                  {(["YTD", "52W", "3Y"] as ChartView[]).map((v) => (
                    <button
                      key={v}
                      onClick={() => setChartView(v)}
                      className="px-1.5 py-0.5 rounded transition-all"
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
                  <span className="ml-1 tracking-widest uppercase">Chart</span>
                </div>
              </th>
            </tr>
          </thead>

          <tbody>
            {GROUPS.map(({ listing, label, flag }) => {
              const rows = ETFS.filter((e) => e.listing === listing);
              if (rows.length === 0) return null;

              return [
                <tr key={label} style={{ background: "rgba(167,139,250,0.02)" }}>
                  <td
                    colSpan={COLUMN_COUNT}
                    className="px-4 py-2 font-semibold uppercase"
                    style={{
                      ...TH_STYLE,
                      color: "var(--color-text-secondary)",
                      borderTop: "1px solid var(--color-space-border)",
                      borderBottom: "1px solid var(--color-space-border)",
                    }}
                  >
                    {flag} {label}
                  </td>
                </tr>,

                ...rows.map((etf, i) => (
                  <tr
                    key={etf.symbol}
                    style={{
                      borderBottom:
                        i < rows.length - 1 ? "1px solid rgba(44,38,72,0.7)" : "none",
                    }}
                  >
                    {/* Ticker — opens the quote on Yahoo, which is also the price source */}
                    <td className="px-4 py-3">
                      <a
                        href={yahooEtfUrl(etf.symbol)}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={`${etf.ticker} on Yahoo Finance`}
                        className="group inline-flex items-center gap-1 font-semibold text-[var(--color-text-primary)] transition-colors hover:text-[var(--color-neon-cyan)]"
                      >
                        <span
                          className="underline-offset-2 group-hover:underline"
                          style={{ fontFamily: FONT_MONO }}
                        >
                          {etf.ticker}
                        </span>
                        <ArrowUpRight
                          size={11}
                          strokeWidth={2.5}
                          className="opacity-35 transition-opacity group-hover:opacity-100"
                          aria-hidden
                        />
                      </a>
                      <div
                        style={{
                          color: "var(--color-text-muted)",
                          fontFamily: FONT_MONO,
                          fontSize: "10px",
                        }}
                      >
                        {etf.name}
                      </div>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <span style={{ color: "var(--color-text-secondary)" }}>{etf.exposure}</span>
                      {etf.hedged && (
                        <span
                          className="ml-1.5 rounded px-1 py-0.5"
                          title="Currency-hedged share class — returns strip out the CAD/USD move"
                          style={{
                            background: "rgba(124,58,237,0.10)",
                            color: "var(--color-neon-purple)",
                            fontFamily: FONT_MONO,
                            fontSize: "9px",
                          }}
                        >
                          HEDGED
                        </span>
                      )}
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
                        {etf.value.toFixed(2)}
                      </span>
                      <span
                        className="ml-1"
                        style={{
                          color: "var(--color-text-muted)",
                          fontFamily: FONT_MONO,
                          fontSize: "10px",
                        }}
                      >
                        {etf.currency}
                      </span>
                      <div
                        className={`font-semibold ${getChangeColor(etf.dailyChange)}`}
                        style={{ fontFamily: FONT_MONO, fontSize: "10px" }}
                      >
                        {formatChange(etf.dailyChange)} today
                      </div>
                    </td>

                    {[etf.weekChange, etf.monthChange, etf.ytdChange].map((v, idx) => (
                      <td key={idx} className="px-4 py-3">
                        <span
                          className={`font-semibold ${getChangeColor(v)}`}
                          style={{ fontFamily: FONT_MONO }}
                        >
                          {formatChange(v)}
                        </span>
                      </td>
                    ))}

                    <td className="px-4 py-3">
                      <SparklineChart data={etf.sparkline} view={chartView} />
                    </td>
                  </tr>
                )),
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
        Listed for reference, not as recommendations, and not investment advice. Canadian and US
        funds are quoted in their own listing currency and are not directly comparable: VSP hedges
        the CAD/USD move that VFV leaves in, which is most of the gap between their returns.
      </p>
    </SciFiCard>
  );
}
