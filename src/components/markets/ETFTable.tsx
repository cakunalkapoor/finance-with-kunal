"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { ArrowUpRight } from "lucide-react";
import { ETFS } from "@/lib/site-data";
import { yahooEtfUrl } from "@/lib/external-links";
import { formatChange, getChangeColor, FONT_MONO } from "@/lib/utils";
import {
  CHART_VIEWS,
  pointLabel,
  sliceFor,
  windowLabel,
  type ChartView,
} from "@/lib/chart-window";
import SciFiCard, { CardHeader } from "@/components/ui/SciFiCard";
import type { CSSProperties } from "react";
import type { EChartsOption } from "echarts";
import type { ETF } from "@/types";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

function SparklineChart({
  data,
  view,
  label,
}: {
  data: number[];
  view: ChartView;
  label: string;
}) {
  const slice = sliceFor(view, data);
  const min = Math.min(...slice);
  const max = Math.max(...slice);
  // Colour follows the trend of the *visible* window, so it stays truthful when
  // the reader toggles between YTD and 3Y.
  const positive = slice[slice.length - 1] >= slice[0];
  const color = positive ? "#34d399" : "#fb7185";

  const option: EChartsOption = {
    animation: false,
    // Room at the bottom for the axis labels that say WHEN this line is.
    grid: { top: 3, bottom: 16, left: 2, right: 2 },
    tooltip: {
      trigger: "axis",
      confine: true,
      backgroundColor: "rgba(20,22,18,0.94)",
      borderWidth: 0,
      textStyle: { color: "#f2f1eb", fontSize: 11 },
      // Points are weekly, so the date is good to about a week — label the
      // month, never a specific day.
      formatter: (params) => {
        const p = Array.isArray(params) ? params[0] : params;
        const i = Number(p.dataIndex);
        return `${pointLabel(i, slice.length)}<br/><strong>${Number(p.value).toFixed(2)}</strong>`;
      },
    },
    xAxis: {
      type: "category",
      data: slice.map((_, i) => pointLabel(i, slice.length)),
      axisLine: { show: false },
      axisTick: { show: false },
      // Two anchors only — first and last. More would not fit at this size.
      axisLabel: {
        show: true,
        showMinLabel: true,
        showMaxLabel: true,
        interval: slice.length - 2,
        color: "#8a8a7d",
        fontSize: 9,
        fontFamily: "monospace",
        margin: 6,
      },
    },
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
    <ReactECharts
      option={option}
      // Fills the chart column rather than sitting at a fixed 100px, which
      // otherwise left ~135px of dead space at the right edge of every row.
      style={{ height: 54, width: "100%", minWidth: 100 }}
      opts={{ renderer: "svg" }}
      aria-label={label}
    />
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
        subtitle="16 funds · grouped by exposure, not ranked · hover a chart for the value at that point · click a ticker for the full quote on Yahoo Finance"
      />
      <div className="overflow-x-auto">
        <table className="w-full text-xs" style={{ tableLayout: "fixed", minWidth: 900 }}>
          {/* Explicit split: with only 7 columns the browser hands all the slack
              to the last one, which parked a 100px sparkline in a 236px cell.
              minWidth above keeps the columns readable before the card scrolls. */}
          <colgroup>
            <col style={{ width: "23%" }} />
            <col style={{ width: "15%" }} />
            <col style={{ width: "13%" }} />
            <col style={{ width: "8%" }} />
            <col style={{ width: "8%" }} />
            <col style={{ width: "8%" }} />
            <col style={{ width: "25%" }} />
          </colgroup>
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
                {/* Every row shares one window, so name the span once here. */}
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
                      <SparklineChart
                        data={etf.sparkline}
                        view={chartView}
                        label={`${etf.ticker} price, ${windowLabel(chartView)}`}
                      />
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
