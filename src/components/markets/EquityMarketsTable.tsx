"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { EQUITY_INDICES } from "@/lib/mock-data";
import { formatNumber, formatChange, getChangeColor, FONT_MONO } from "@/lib/utils";
import SciFiCard, { CardHeader } from "@/components/ui/SciFiCard";
import type { EChartsOption } from "echarts";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

type ChartView = "YTD" | "52W";

// YTD ≈ last 22 weeks of the 52-point array
const YTD_WEEKS = 22;

function SparklineChart({
  data,
  view,
}: {
  data: number[];
  view: ChartView;
}) {
  const slice = view === "YTD" ? data.slice(-YTD_WEEKS) : data;
  const min = Math.min(...slice);
  const max = Math.max(...slice);
  // Color follows the trend of the *visible* window, so it stays correct when
  // the user toggles between YTD and 52W.
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
    <ReactECharts
      option={option}
      style={{ height: 36, width: 100 }}
      opts={{ renderer: "svg" }}
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
      <CardHeader title="Global Equity Markets" subtitle="Top 10 Major Indices" />
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
                <div>P/E RATIO</div>
                <div style={{ fontSize: "9px", letterSpacing: "0.05em", opacity: 0.7, marginTop: "1px" }}>vs 10Y avg</div>
              </th>
              <th className="px-4 py-2.5 text-left font-semibold tracking-widest uppercase" style={TH_STYLE}>52W Range</th>

              {/* Chart column with YTD / 52W toggle */}
              <th className="px-4 py-2.5 text-left" style={TH_STYLE}>
                <div className="flex items-center gap-1">
                  {(["YTD", "52W"] as ChartView[]).map((v) => (
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
                  <span className="ml-1 tracking-widest uppercase">Chart</span>
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
                  {/* Name */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{idx.flag}</span>
                      <div>
                        <div className="font-semibold" style={{ color: "var(--color-text-primary)" }}>
                          {idx.name}
                        </div>
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
                    <SparklineChart data={idx.sparkline} view={chartView} />
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
