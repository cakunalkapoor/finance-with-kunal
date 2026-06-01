"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import type { EconomicIndicator, TimeHorizon } from "@/types";
import { getChangeColor, FONT_MONO } from "@/lib/utils";
import type { EChartsOption } from "echarts";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

const HORIZONS: TimeHorizon[] = ["3M", "6M", "1Y", "3Y", "5Y"];

function filterByHorizon(
  series: { date: string; value: number }[],
  horizon: TimeHorizon
): { date: string; value: number }[] {
  // Anchor the window to the most recent data point (not a frozen date) so the
  // horizon tabs stay correct as new data is published.
  const now = series.length
    ? new Date(series[series.length - 1].date)
    : new Date();
  const months: Record<TimeHorizon, number> = {
    "1W": 0.25,
    "1M": 1,
    "3M": 3,
    "6M": 6,
    "1Y": 12,
    "3Y": 36,
    "5Y": 60,
  };
  const cutoff = new Date(now);
  cutoff.setMonth(cutoff.getMonth() - months[horizon]);
  return series.filter((p) => new Date(p.date) >= cutoff);
}

interface Props {
  indicator: EconomicIndicator;
}

export default function EconomicChart({ indicator }: Props) {
  const [horizon, setHorizon] = useState<TimeHorizon>("1Y");

  const filtered = filterByHorizon(indicator.timeSeries, horizon);
  const isUp = indicator.direction === "up";
  const goodColor = indicator.isPositiveGood
    ? isUp ? "#34d399" : "#fb7185"
    : isUp ? "#fb7185" : "#34d399";

  const option: EChartsOption = {
    backgroundColor: "transparent",
    grid: { top: 12, bottom: 28, left: 48, right: 16 },
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(255,255,255,0.98)",
      borderColor: "rgba(124,58,237,0.28)",
      borderWidth: 1,
      extraCssText: "box-shadow: 0 8px 24px rgba(30,27,58,0.12); border-radius: 6px;",
      textStyle: {
        color: "#1e1b3a",
        fontFamily: "Space Mono, monospace",
        fontSize: 11,
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      formatter: (params: any) => {
        const p = Array.isArray(params) ? params[0] : params;
        if (!p) return "";
        return `<div style="padding:2px 4px">
          <div style="color:#524b7a;font-size:10px">${p.axisValue}</div>
          <div style="font-weight:700;font-size:13px;color:${goodColor}">${p.value} ${indicator.unit}</div>
        </div>`;
      },
    },
    xAxis: {
      type: "category",
      data: filtered.map((p) => p.date),
      axisLine: { lineStyle: { color: "rgba(229,225,241,1)" } },
      axisTick: { show: false },
      axisLabel: {
        color: "#9590b8",
        fontFamily: "Space Mono, monospace",
        fontSize: 10,
        formatter: (val: string) => val.slice(0, 7),
        interval: Math.floor(filtered.length / 6),
      },
    },
    yAxis: {
      type: "value",
      splitLine: { lineStyle: { color: "rgba(229,225,241,0.7)", type: "dashed" } },
      axisLabel: {
        color: "#9590b8",
        fontFamily: "Space Mono, monospace",
        fontSize: 10,
        formatter: (val: number) => `${val}`,
      },
      axisLine: { show: false },
    },
    series: [
      {
        type: "line",
        data: filtered.map((p) => p.value),
        smooth: 0.3,
        symbol: "none",
        lineStyle: { width: 2, color: goodColor },
        areaStyle: {
          color: {
            type: "linear",
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: goodColor.replace(")", ",0.18)").replace("rgb", "rgba") },
              { offset: 1, color: "rgba(0,0,0,0)" },
            ],
          },
        },
      },
    ],
  };

  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{
        background: "var(--color-space-card)",
        border: "1px solid var(--color-space-border)",
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between p-4 pb-2">
        <div className="flex items-center gap-3">
          <span className="text-xl">{indicator.flag}</span>
          <div>
            <h3
              className="font-semibold text-sm"
              style={{ color: "var(--color-text-primary)" }}
            >
              {indicator.name}
            </h3>
            <p
              className="text-xs mt-0.5"
              style={{ color: "var(--color-text-muted)" }}
            >
              {indicator.period} · {indicator.country}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          <div
            className="font-bold text-xl leading-none"
            style={{
              fontFamily: FONT_MONO,
              color: goodColor,
            }}
          >
            {indicator.value} <span className="text-xs font-normal" style={{ color: "var(--color-text-muted)" }}>{indicator.unit}</span>
          </div>
          <div
            className={`text-xs font-semibold ${getChangeColor(indicator.change, indicator.isPositiveGood)}`}
            style={{ fontFamily: FONT_MONO }}
          >
            {indicator.change >= 0 ? "▲" : "▼"}{" "}
            {Math.abs(indicator.change).toFixed(2)}{" "}
            vs prev {indicator.previousValue} {indicator.unit}
          </div>
        </div>
      </div>

      {/* Time horizon tabs */}
      <div className="flex items-center gap-1 px-4 pb-2">
        {HORIZONS.map((h) => (
          <button
            key={h}
            onClick={() => setHorizon(h)}
            className="px-2 py-0.5 rounded text-xs font-semibold transition-all"
            style={{
              fontFamily: FONT_MONO,
              color: horizon === h ? "var(--color-neon-cyan)" : "var(--color-text-muted)",
              background: horizon === h ? "rgba(167,139,250,0.1)" : "transparent",
              border: horizon === h ? "1px solid rgba(167,139,250,0.28)" : "1px solid transparent",
              letterSpacing: "0.06em",
            }}
          >
            {h}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="px-2 pb-3">
        <ReactECharts option={option} style={{ height: 160 }} opts={{ renderer: "svg" }} notMerge />
      </div>

      {/* Description */}
      <div
        className="px-4 pb-3 text-xs leading-relaxed"
        style={{
          color: "var(--color-text-muted)",
          borderTop: "1px solid var(--color-space-border)",
          paddingTop: "8px",
        }}
      >
        {indicator.description}
      </div>
    </div>
  );
}
