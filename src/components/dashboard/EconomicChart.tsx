"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import type { EconomicIndicator, TimeHorizon } from "@/types";
import { formatEconomicValue, getChangeColor, FONT_MONO } from "@/lib/utils";
import { useTheme, CHART_COLORS, withAlpha } from "@/lib/use-theme";
import { horizonsFor, defaultHorizon, filterByHorizon } from "@/lib/chart-window";
import type { EChartsOption } from "echarts";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });


interface Props {
  indicator: EconomicIndicator;
}

export default function EconomicChart({ indicator }: Props) {
  const horizons = horizonsFor(indicator.timeSeries);
  const [horizon, setHorizon] = useState<TimeHorizon>(
    defaultHorizon(horizons, "YTD")
  );
  const theme = useTheme();
  const c = CHART_COLORS[theme];

  const filtered = filterByHorizon(indicator.timeSeries, horizon);
  const isUp = indicator.direction === "up";
  const goodColor = indicator.isPositiveGood
    ? isUp ? c.up : c.down
    : isUp ? c.down : c.up;
  const displayValue = (value: number) =>
    formatEconomicValue(value, indicator.category, indicator.unit);

  const option: EChartsOption = {
    backgroundColor: "transparent",
    grid: { top: 12, bottom: 28, left: 48, right: 16 },
    tooltip: {
      trigger: "axis",
      backgroundColor: c.tooltipBg,
      borderColor: c.tooltipBorder,
      borderWidth: 1,
      extraCssText: `box-shadow: ${c.tooltipShadow}; border-radius: 6px;`,
      textStyle: {
        color: c.tooltipText,
        fontFamily: "Space Mono, monospace",
        fontSize: 11,
      },
      // Thin vertical guide instead of the default heavy shadow band.
      axisPointer: {
        type: "line",
        lineStyle: { color: c.axisLine, width: 1 },
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      formatter: (params: any) => {
        const p = Array.isArray(params) ? params[0] : params;
        if (!p) return "";
        return `<div style="padding:2px 4px">
          <div style="color:${c.tooltipMuted};font-size:10px">${p.axisValue}</div>
          <div style="font-weight:700;font-size:13px;color:${goodColor}">${displayValue(Number(p.value))} ${indicator.unit}</div>
        </div>`;
      },
    },
    xAxis: {
      type: "category",
      data: filtered.map((p) => p.date),
      boundaryGap: false,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: c.axisLabel,
        fontFamily: "Space Mono, monospace",
        fontSize: 10,
        formatter: (val: string) => val.slice(0, 7),
        interval: Math.floor(filtered.length / 5),
        margin: 12,
      },
    },
    yAxis: {
      type: "value",
      // Fewer, softer, solid hairlines — dashed lines at full border weight
      // read as visual noise behind a 160px sparkline.
      splitNumber: 3,
      scale: true,
      splitLine: { lineStyle: { color: c.grid, width: 1 } },
      axisLabel: {
        color: c.axisLabel,
        fontFamily: "Space Mono, monospace",
        fontSize: 10,
        formatter: (val: number) => `${val}`,
        margin: 10,
      },
      axisLine: { show: false },
      axisTick: { show: false },
    },
    series: [
      {
        type: "line",
        data: filtered.map((p) => p.value),
        smooth: 0.3,
        symbol: "none",
        lineStyle: { width: 1.75, color: goodColor },
        // Emphasise the hovered point without cluttering the line itself.
        showSymbol: false,
        emphasis: {
          scale: false,
          itemStyle: { color: goodColor, borderColor: c.tooltipBg, borderWidth: 2 },
        },
        areaStyle: {
          color: {
            type: "linear",
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: withAlpha(goodColor, theme === "dark" ? 0.22 : 0.16) },
              { offset: 1, color: withAlpha(goodColor, 0) },
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
            {displayValue(indicator.value)} <span className="text-xs font-normal" style={{ color: "var(--color-text-muted)" }}>{indicator.unit}</span>
          </div>
          <div
            className={`text-xs font-semibold ${getChangeColor(indicator.change, indicator.isPositiveGood)}`}
            style={{ fontFamily: FONT_MONO }}
          >
            {indicator.change >= 0 ? "▲" : "▼"}{" "}
            {displayValue(Math.abs(indicator.change))}{" "}
            vs prev {displayValue(indicator.previousValue)} {indicator.unit}
          </div>
        </div>
      </div>

      {/* Time horizon tabs */}
      <div className="flex items-center gap-1 px-4 pb-2">
        {horizons.map((h) => (
          <button
            key={h}
            onClick={() => setHorizon(h)}
            className="px-2 py-0.5 rounded text-xs font-semibold transition-all"
            style={{
              fontFamily: FONT_MONO,
              color: horizon === h ? "var(--color-neon-cyan)" : "var(--color-text-muted)",
              background: horizon === h ? "var(--color-neon-cyan-glow)" : "transparent",
              border: `1px solid ${horizon === h ? "var(--color-neon-cyan-dim)" : "transparent"}`,
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
