"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { ArrowUpRight } from "lucide-react";
import { EQUITY_INDICES } from "@/lib/site-data";
import { INVESTING_INDEX_URL } from "@/lib/external-links";
import { formatNumber, formatChange, getChangeColor, FONT_MONO } from "@/lib/utils";
import {
  CHART_VIEWS,
  pointLabel,
  sliceFor,
  windowLabel,
  type ChartView,
} from "@/lib/chart-window";
import SciFiCard, { CardHeader } from "@/components/ui/SciFiCard";
import type { EChartsOption } from "echarts";

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
  // Color follows the trend of the *visible* window, so it stays correct when
  // the user toggles between YTD and 52W.
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
      // Weekly points — the date is good to about a week, so label the month.
      formatter: (params) => {
        const p = Array.isArray(params) ? params[0] : params;
        const i = Number(p.dataIndex);
        return `${pointLabel(i, slice.length)}<br/><strong>${formatNumber(Number(p.value), 2)}</strong>`;
      },
    },
    xAxis: {
      type: "category",
      data: slice.map((_, i) => pointLabel(i, slice.length)),
      axisLine: { show: false },
      axisTick: { show: false },
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
      // Fills the chart column instead of a fixed 100px, so the table doesn't
      // end in dead space — matches ETFTable.
      style={{ height: 54, width: "100%", minWidth: 100 }}
      opts={{ renderer: "svg" }}
      aria-label={label}
    />
  );
}

// P/E cell — shows current P/E and % variance from 10-year average
function PECell({ pe, pe10yAvg }: { pe: number; pe10yAvg: number }) {
  const variancePct = Math.round(((pe - pe10yAvg) / pe10yAvg) * 100);
  const isAbove = variancePct > 0;

  // Colour scale: >20% premium → red; 0–20% → amber; at/below avg → green
  let varColor: string;
  let varBg: string;
  if (isAbove && variancePct > 20) {
    varColor = "#e11d48";
    varBg   = "rgba(225,29,72,0.10)";
  } else if (isAbove) {
    varColor = "#d97706";
    varBg   = "rgba(217,119,6,0.10)";
  } else {
    varColor = "#059669";
    varBg   = "rgba(5,150,105,0.10)";
  }

  return (
    <div className="flex flex-col gap-0.5 min-w-[80px]">
      <div className="font-bold" style={{ fontFamily: FONT_MONO, color: "var(--color-text-primary)", fontSize: "12px" }}>
        {pe.toFixed(1)}x
      </div>
      <div className="flex items-center gap-1">
        <span
          className="px-1.5 py-0.5 rounded font-semibold"
          style={{ background: varBg, color: varColor, fontFamily: FONT_MONO, fontSize: "10px" }}
        >
          {isAbove ? "+" : ""}{variancePct}%
        </span>
        <span style={{ color: "var(--color-text-muted)", fontFamily: FONT_MONO, fontSize: "10px" }}>
          vs 10Y
        </span>
      </div>
    </div>
  );
}

// Trailing 30-day annualized realized-volatility cell, color-coded by level:
//   < 15 green (calm), 15–25 yellow (elevated), > 25 red (high vol).
// Computed from each index's daily log-returns (see fetch-yahoo.py::derive).
function VolCell({ value }: { value?: number }) {
  if (value == null) {
    return (
      <span style={{ color: "var(--color-text-muted)", fontFamily: FONT_MONO }}>—</span>
    );
  }
  const color = value < 15 ? "#34d399" : value < 25 ? "#f59e0b" : "#fb7185";
  const bg =
    value < 15
      ? "rgba(52,211,153,0.11)"
      : value < 25
      ? "rgba(245,158,11,0.13)"
      : "rgba(251,113,133,0.13)";
  return (
    <span
      className="px-2 py-0.5 rounded text-xs font-semibold"
      style={{ background: bg, color, fontFamily: FONT_MONO }}
    >
      {value.toFixed(1)}%
    </span>
  );
}

// Mini horizontal range bar showing where current price sits in 52W range
function RangeBar({ value, low, high }: { value: number; low: number; high: number }) {
  const pct = Math.round(((value - low) / (high - low)) * 100);
  const fmt = (n: number) => formatNumber(n, n > 10000 ? 0 : 2);

  return (
    <div className="flex flex-col gap-1 min-w-[110px]">
      {/* High */}
      <div
        className="font-semibold"
        style={{
          fontFamily: FONT_MONO,
          fontSize: "10px",
          color: "var(--color-market-up)",
        }}
      >
        H: {fmt(high)}
      </div>

      {/* Range bar */}
      <div
        className="relative h-1 rounded-full overflow-visible"
        style={{ background: "var(--color-space-border)" }}
      >
        {/* Filled portion */}
        <div
          className="absolute top-0 left-0 h-full rounded-full"
          style={{
            width: `${pct}%`,
            background: "linear-gradient(90deg, rgba(167,139,250,0.4), rgba(167,139,250,0.8))",
          }}
        />
        {/* Current price marker */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full"
          style={{
            left: `calc(${pct}% - 3px)`,
            background: "var(--color-neon-cyan)",
            boxShadow: "0 0 4px var(--color-neon-cyan)",
          }}
        />
      </div>

      {/* Low */}
      <div
        className="font-semibold"
        style={{
          fontFamily: FONT_MONO,
          fontSize: "10px",
          color: "var(--color-market-down)",
        }}
      >
        L: {fmt(low)}
      </div>
    </div>
  );
}

const TH_STYLE = {
  color: "var(--color-text-muted)",
  fontFamily: FONT_MONO,
  fontSize: "10px",
  letterSpacing: "0.1em",
};

export default function EquityMarketsTable() {
  const [chartView, setChartView] = useState<ChartView>("YTD");

  return (
    <SciFiCard glow="cyan" cornerAccent>
      <CardHeader
        title="Global Equity Markets"
        subtitle="11 Major Indices · 30d realized volatility · click an index for full detail on Investing.com"
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
              <th className="px-4 py-2.5 text-left font-semibold tracking-widest uppercase" style={TH_STYLE}>Index</th>
              <th className="px-4 py-2.5 text-left font-semibold tracking-widest uppercase" style={TH_STYLE}>Last</th>
              <th className="px-4 py-2.5 text-left font-semibold tracking-widest uppercase" style={TH_STYLE}>1W</th>
              <th className="px-4 py-2.5 text-left font-semibold tracking-widest uppercase" style={TH_STYLE}>1M</th>
              <th className="px-4 py-2.5 text-left font-semibold tracking-widest uppercase" style={TH_STYLE}>YTD</th>
              <th className="px-4 py-2.5 text-left font-semibold tracking-widest uppercase" style={TH_STYLE}>
                <div>VOL</div>
                <div style={{ fontSize: "9px", letterSpacing: "0.05em", opacity: 0.7, marginTop: "1px" }}>30d realized</div>
              </th>
              <th className="px-4 py-2.5 text-left font-semibold tracking-widest uppercase" style={TH_STYLE}>
                <div>P/E RATIO</div>
                <div style={{ fontSize: "9px", letterSpacing: "0.05em", opacity: 0.7, marginTop: "1px" }}>vs 10Y avg</div>
              </th>
              <th className="px-4 py-2.5 text-left font-semibold tracking-widest uppercase" style={TH_STYLE}>52W Range</th>

              {/* Chart column with YTD / 52W toggle */}
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
                        border: chartView === v ? "1px solid rgba(167,139,250,0.3)" : "1px solid transparent",
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
            {EQUITY_INDICES.map((idx, i) => {
              const weekPos = idx.weekChange >= 0;
              const ytdPos  = idx.ytdChange >= 0;
              return (
                <tr
                  key={idx.symbol}
                  style={{
                    borderBottom: i < EQUITY_INDICES.length - 1
                      ? "1px solid rgba(44,38,72,0.7)"
                      : "none",
                  }}
                >
                  {/* Name — opens the index page on Investing.com */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{idx.flag}</span>
                      <div>
                        <a
                          href={INVESTING_INDEX_URL[idx.symbol]}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={`${idx.name} on Investing.com`}
                          className="group inline-flex items-center gap-1 font-semibold text-[var(--color-text-primary)] transition-colors hover:text-[var(--color-neon-cyan)]"
                        >
                          <span className="underline-offset-2 group-hover:underline">{idx.name}</span>
                          <ArrowUpRight
                            size={11}
                            strokeWidth={2.5}
                            className="opacity-35 transition-opacity group-hover:opacity-100"
                            aria-hidden
                          />
                        </a>
                        <div style={{ color: "var(--color-text-muted)", fontFamily: FONT_MONO, fontSize: "10px" }}>
                          {idx.region}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Last */}
                  <td className="px-4 py-3">
                    <div className="font-bold" style={{ fontFamily: FONT_MONO, color: "var(--color-text-primary)" }}>
                      {formatNumber(idx.value, idx.value > 10000 ? 0 : 2)}
                    </div>
                    <div className={getChangeColor(idx.dailyChange)} style={{ fontSize: "10px", fontFamily: FONT_MONO }}>
                      {formatChange(idx.dailyChange)}
                    </div>
                  </td>

                  {/* 1W */}
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-semibold ${getChangeColor(idx.weekChange)}`}
                      style={{ background: weekPos ? "rgba(52,211,153,0.11)" : "rgba(251,113,133,0.11)", fontFamily: FONT_MONO }}
                    >
                      {formatChange(idx.weekChange)}
                    </span>
                  </td>

                  {/* 1M */}
                  <td className="px-4 py-3">
                    <span className={getChangeColor(idx.monthChange)} style={{ fontFamily: FONT_MONO }}>
                      {formatChange(idx.monthChange)}
                    </span>
                  </td>

                  {/* YTD */}
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-semibold ${getChangeColor(idx.ytdChange)}`}
                      style={{ background: ytdPos ? "rgba(52,211,153,0.11)" : "rgba(251,113,133,0.11)", fontFamily: FONT_MONO }}
                    >
                      {formatChange(idx.ytdChange)}
                    </span>
                  </td>

                  {/* 30-day realized volatility, computed from daily log-returns */}
                  <td className="px-4 py-3">
                    <VolCell value={idx.realizedVol} />
                  </td>

                  {/* P/E Ratio */}
                  <td className="px-4 py-3">
                    <PECell pe={idx.pe} pe10yAvg={idx.pe10yAvg} />
                  </td>

                  {/* 52W Range */}
                  <td className="px-4 py-3">
                    <RangeBar value={idx.value} low={idx.low52w} high={idx.high52w} />
                  </td>

                  {/* Chart */}
                  <td className="px-4 py-3">
                    <SparklineChart
                      data={idx.sparkline}
                      view={chartView}
                      label={`${idx.name} price, ${windowLabel(chartView)}`}
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
