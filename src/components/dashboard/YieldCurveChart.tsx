"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import type { TimeHorizon, YieldCurve } from "@/types";
import { FONT_MONO } from "@/lib/utils";
import { useTheme, CHART_COLORS, withAlpha } from "@/lib/use-theme";
import type { EChartsOption } from "echarts";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

const HORIZONS: TimeHorizon[] = ["6M", "1Y", "3Y"];

const MONTHS: Record<TimeHorizon, number> = {
  "1W": 0.25, "1M": 1, "3M": 3, "6M": 6, "1Y": 12, "3Y": 36, "5Y": 60,
};

/** Trim a monthly series to the horizon, anchored to its own last point. */
function filterByHorizon(
  series: { date: string; value: number }[],
  horizon: TimeHorizon
): { date: string; value: number }[] {
  if (!series.length) return series;
  const cutoff = new Date(series[series.length - 1].date);
  cutoff.setMonth(cutoff.getMonth() - MONTHS[horizon]);
  return series.filter((p) => new Date(p.date) >= cutoff);
}

interface Props {
  curve: YieldCurve;
}

export default function YieldCurveChart({ curve }: Props) {
  const [horizon, setHorizon] = useState<TimeHorizon>("1Y");
  const theme = useTheme();
  const c = CHART_COLORS[theme];

  const shortPts = filterByHorizon(curve.short.series, horizon);
  const longPts = filterByHorizon(curve.long.series, horizon);
  const dates = shortPts.map((p) => p.date);

  // Sign, not size, is the story: a negative spread means the long end yields
  // less than the short end — an inversion, which is what the pair is read for.
  const inverted = curve.spreadBps < 0;

  const option: EChartsOption = {
    backgroundColor: "transparent",
    grid: { top: 12, bottom: 28, left: 48, right: 16 },
    // Legend lives in the header as coloured chips so identity is never
    // carried by the line colour alone.
    legend: { show: false },
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
      axisPointer: { type: "line", lineStyle: { color: c.axisLine, width: 1 } },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      formatter: (params: any) => {
        const rows = Array.isArray(params) ? params : [params];
        if (!rows.length) return "";
        const byName = new Map<string, number>(
          rows.map((r: { seriesName: string; value: number }) => [r.seriesName, Number(r.value)])
        );
        const s = byName.get(curve.short.label);
        const l = byName.get(curve.long.label);
        // Spread is recomputed at the hovered month, not carried from the
        // headline — the two would disagree everywhere except the last point.
        const spread =
          s != null && l != null && Number.isFinite(s) && Number.isFinite(l)
            ? Math.round((l - s) * 100)
            : null;
        const line = (label: string, value: number | undefined, color: string) =>
          value == null || !Number.isFinite(value)
            ? ""
            : `<div style="display:flex;align-items:center;gap:6px;margin-top:2px">
                 <span style="width:8px;height:8px;border-radius:2px;background:${color}"></span>
                 <span style="color:${c.tooltipMuted};font-size:10px">${label}</span>
                 <span style="font-weight:700;font-size:12px;margin-left:auto">${value.toFixed(2)}%</span>
               </div>`;
        return `<div style="padding:2px 4px;min-width:150px">
          <div style="color:${c.tooltipMuted};font-size:10px">${rows[0].axisValue}</div>
          ${line(curve.short.label, s, c.series1)}
          ${line(curve.long.label, l, c.series2)}
          ${
            spread == null
              ? ""
              : `<div style="margin-top:4px;padding-top:4px;border-top:1px solid ${c.tooltipBorder};font-size:10px;color:${c.tooltipMuted}">
                   spread <span style="font-weight:700;color:${c.tooltipText}">${spread >= 0 ? "+" : ""}${spread}bp</span>
                 </div>`
          }
        </div>`;
      },
    },
    xAxis: {
      type: "category",
      data: dates,
      boundaryGap: false,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: c.axisLabel,
        fontFamily: "Space Mono, monospace",
        fontSize: 10,
        formatter: (val: string) => val.slice(0, 7),
        interval: Math.floor(dates.length / 5),
        margin: 12,
      },
    },
    // One axis: both series are percentages, so they share a scale and the gap
    // between the lines IS the spread. A second axis would make that gap a
    // drawing artefact rather than a fact.
    yAxis: {
      type: "value",
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
        name: curve.short.label,
        type: "line",
        data: shortPts.map((p) => p.value),
        smooth: 0.3,
        symbol: "none",
        showSymbol: false,
        lineStyle: { width: 2, color: c.series1 },
        emphasis: {
          scale: false,
          itemStyle: { color: c.series1, borderColor: c.tooltipBg, borderWidth: 2 },
        },
        // The band between the two lines is the spread. Stacking would misstate
        // the levels, so it is drawn as a fill from the short line up to the
        // long one via areaStyle on the long series only.
        z: 3,
      },
      {
        name: curve.long.label,
        type: "line",
        data: longPts.map((p) => p.value),
        smooth: 0.3,
        symbol: "none",
        showSymbol: false,
        lineStyle: { width: 2, color: c.series2 },
        emphasis: {
          scale: false,
          itemStyle: { color: c.series2, borderColor: c.tooltipBg, borderWidth: 2 },
        },
        areaStyle: {
          color: {
            type: "linear",
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: withAlpha(c.series2, theme === "dark" ? 0.18 : 0.13) },
              { offset: 1, color: withAlpha(c.series2, 0) },
            ],
          },
        },
        z: 2,
      },
    ],
  };

  const chip = (label: string, value: number, color: string) => (
    <div className="flex items-center gap-1.5">
      <span
        aria-hidden
        style={{ width: 8, height: 8, borderRadius: 2, background: color, display: "inline-block" }}
      />
      <span className="text-xs" style={{ color: "var(--color-text-muted)", fontFamily: FONT_MONO }}>
        {label}
      </span>
      <span
        className="text-xs font-bold"
        style={{ color: "var(--color-text-primary)", fontFamily: FONT_MONO }}
      >
        {value.toFixed(2)}%
      </span>
    </div>
  );

  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{
        background: "var(--color-space-card)",
        border: "1px solid var(--color-space-border)",
      }}
    >
      <div className="flex items-start justify-between p-4 pb-2 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-xl">{curve.flag}</span>
          <div className="min-w-0">
            <h3 className="font-semibold text-sm" style={{ color: "var(--color-text-primary)" }}>
              {curve.short.label}/{curve.long.label} Yield Curve
            </h3>
            <p className="text-xs mt-0.5" style={{ color: "var(--color-text-muted)" }}>
              {curve.asOf} · {curve.country}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1 shrink-0">
          <div
            className="font-bold text-xl leading-none"
            style={{ fontFamily: FONT_MONO, color: inverted ? c.down : "var(--color-text-primary)" }}
          >
            {curve.spreadBps >= 0 ? "+" : ""}
            {curve.spreadBps}
            <span className="text-xs font-normal" style={{ color: "var(--color-text-muted)" }}>
              {" "}
              bp
            </span>
          </div>
          <div
            className="text-xs font-semibold"
            style={{ fontFamily: FONT_MONO, color: inverted ? c.down : "var(--color-text-muted)" }}
          >
            {inverted ? "inverted" : "upward sloping"}
          </div>
        </div>
      </div>

      {/* Legend — always present, since two series share the plot. */}
      <div className="flex items-center gap-4 px-4 pb-1">
        {chip(curve.short.label, curve.short.value, c.series1)}
        {chip(curve.long.label, curve.long.value, c.series2)}
      </div>

      <div className="flex items-center gap-1 px-4 pb-2">
        {HORIZONS.map((h) => (
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

      <div className="px-2 pb-3">
        <ReactECharts option={option} style={{ height: 160 }} opts={{ renderer: "svg" }} notMerge />
      </div>

      <div
        className="px-4 pb-3 text-xs leading-relaxed"
        style={{
          color: "var(--color-text-muted)",
          borderTop: "1px solid var(--color-space-border)",
          paddingTop: "8px",
        }}
      >
        {curve.long.name} minus {curve.short.name}, currently{" "}
        {curve.spreadBps >= 0 ? "+" : ""}
        {curve.spreadBps}bp
        {inverted
          ? " — the long end yields less than the 10-year, an inversion."
          : ", so the curve slopes upward across the long end."}{" "}
        {curve.source}
      </div>
    </div>
  );
}
