"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import type { EconomicIndicator, TimeHorizon } from "@/types";
import { formatEconomicValue, getChangeColor, FONT_MONO } from "@/lib/utils";
import { useTheme, CHART_COLORS } from "@/lib/use-theme";
import { horizonsFor, defaultHorizon, filterByHorizon } from "@/lib/chart-window";
import { ECONOMIC_CONTEXT } from "@/lib/commentary";
import { economicTitle, economicPeriod, economicUnit, economicDeltaUnit, economicStatus, economicTimestamp, economicObservationLabel } from "@/lib/economy-view";
import ChartViewTabs from "@/components/markets/ChartViewTabs";
import type { EChartsOption } from "echarts";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

export default function EconomicChart({ indicator }: { indicator: EconomicIndicator }) {
  const horizons = horizonsFor(indicator.timeSeries);
  const [horizon, setHorizon] = useState<TimeHorizon>(defaultHorizon(horizons, "YTD"));
  const theme = useTheme();
  const c = CHART_COLORS[theme];
  const filtered = filterByHorizon(indicator.timeSeries, horizon);
  const displayValue = (value: number) => formatEconomicValue(value, indicator.category, indicator.unit);
  const lineColor = theme === "dark" ? "#b9f227" : "#37683f";
  const referenceColor = theme === "dark" ? "#edc76d" : "#916c1e";
  const isPMI = indicator.category === "pmi";
  const first = filtered[0], last = filtered.at(-1);
  const history = indicator.timeSeries;
  const low = Math.min(...history.map(p => p.value));
  const high = Math.max(...history.map(p => p.value));
  const position = high === low ? 50 : Math.max(0, Math.min(100, (indicator.value - low) / (high - low) * 100));
  const option: EChartsOption = {
    backgroundColor: "transparent", animation: false,
    grid: { top: 18, bottom: 12, left: 8, right: 16, containLabel: true },
    tooltip: {
      trigger: "axis", backgroundColor: c.tooltipBg, borderColor: c.tooltipBorder, borderWidth: 1,
      textStyle: { color: c.tooltipText, fontFamily: "Space Mono, monospace", fontSize: 11 },
      axisPointer: { type: "line", lineStyle: { color: c.axisLine, width: 1 } },
      formatter: (params) => {
        const point = (Array.isArray(params) ? params[0] : params) as { value?: unknown };
        if (!Array.isArray(point?.value)) return "";
        const date = new Date(Number(point.value[0])).toISOString().slice(0, 10);
        return `<div style="padding:2px 4px"><div style="color:${c.tooltipMuted};margin-bottom:3px">${economicObservationLabel(indicator, date)}</div><strong>${displayValue(Number(point.value[1]))} ${economicUnit(indicator)}</strong></div>`;
      },
    },
    xAxis: {
      type: "time", min: first ? economicTimestamp(first.date) : undefined, max: last ? economicTimestamp(last.date) : undefined,
      splitNumber: 3, axisLine: { show: false }, axisTick: { show: false },
      axisLabel: { color: c.axisLabel, fontFamily: "Space Mono, monospace", fontSize: 10, hideOverlap: true,
        formatter: (value: number) => new Intl.DateTimeFormat("en-US", { month: "short", ...(indicator.id === "us-jobless-claims" && horizon === "1W" ? { day: "numeric" as const } : { year: "2-digit" as const }), timeZone: "UTC" }).format(value) },
      splitLine: { show: false },
    },
    yAxis: {
      type: "value", scale: true, splitNumber: 2,
      ...(isPMI ? {
        min: ({ min, max }: { min: number; max: number }) => Math.floor((Math.min(min, 50) - Math.max((max - min) * 0.12, 0.3)) * 10) / 10,
        max: ({ min, max }: { min: number; max: number }) => Math.ceil((Math.max(max, 50) + Math.max((max - min) * 0.12, 0.3)) * 10) / 10,
      } : {}),
      splitLine: { lineStyle: { color: c.grid, width: 1 } },
      axisLabel: { color: c.axisLabel, fontFamily: "Space Mono, monospace", fontSize: 10, formatter: (value: number) => displayValue(value) },
      axisLine: { show: false }, axisTick: { show: false },
    },
    series: [{
      type: "line", data: filtered.map(p => [economicTimestamp(p.date), p.value]),
      smooth: false, showSymbol: false, lineStyle: { width: 2, color: lineColor }, itemStyle: { color: lineColor },
      ...(isPMI ? { markLine: { silent: true, symbol: "none", lineStyle: { color: referenceColor, type: "dashed", width: 1 }, label: { formatter: "50 · no change", position: "insideEndTop", color: referenceColor, fontSize: 10 }, data: [{ yAxis: 50 }] } } : {}),
    }],
  };
  return (
    <article id={`indicator-${indicator.id}`} data-indicator={indicator.id} aria-label={`${indicator.country}: ${economicTitle(indicator)}`} className="min-w-0 overflow-hidden rounded-lg border" style={{ background: "var(--color-space-card)", borderColor: "var(--color-space-border)" }}>
      <div className="p-4 pb-2">
        <div className="flex min-h-12 items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold leading-5" style={{ color: "var(--color-text-primary)" }}><span aria-hidden>{indicator.flag}</span> {economicTitle(indicator)}</h3>
            <p className="mt-1 text-[11px] leading-5" style={{ color: "var(--color-text-muted)" }}>{indicator.country} · {economicPeriod(indicator)}</p>
          </div>
          <span className="shrink-0 rounded px-1.5 py-1 text-[10px]" style={{ color: "var(--color-neon-cyan)", background: "var(--color-wash)", fontFamily: FONT_MONO }}>{economicStatus(indicator)}</span>
        </div>
        <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1" style={{ fontFamily: FONT_MONO }}>
          <strong className="text-[28px] leading-9 tracking-tight" style={{ color: "var(--color-text-primary)" }}>{displayValue(indicator.value)}</strong>
          <span className="text-[11px]" style={{ color: "var(--color-text-muted)" }}>{economicUnit(indicator)}</span>
        </div>
        <p className={`mt-0.5 text-[11px] leading-5 ${getChangeColor(indicator.change, indicator.isPositiveGood)}`} style={{ fontFamily: FONT_MONO }}>
          {indicator.change > 0 ? "+" : indicator.change < 0 ? "−" : ""}{displayValue(Math.abs(indicator.change))} {economicDeltaUnit(indicator)}
          <span style={{ color: "var(--color-text-muted)" }}> vs prior {displayValue(indicator.previousValue)}</span>
        </p>
        <div className="mt-2 min-h-7" role="group" aria-label={`${indicator.name} chart window`}><ChartViewTabs views={horizons} value={horizon} onChange={setHorizon} comfortable /></div>
      </div>
      <div role="img" aria-label={`${indicator.name}: ${first?.date ?? "unavailable"} to ${last?.date ?? "unavailable"}; latest ${displayValue(indicator.value)} ${economicUnit(indicator)}${isPMI ? "; 50 marks no change in surveyed activity" : ""}`} className="px-1">
        <ReactECharts option={option} style={{ height: 220 }} opts={{ renderer: "svg" }} notMerge />
      </div>
      {history.length > 1 && <section aria-label="Observed history range" className="mx-4 mb-4 rounded-md p-3" style={{ background: "var(--color-wash)" }}>
        <div className="flex justify-between gap-3 text-[10px]" style={{ color: "var(--color-text-secondary)", fontFamily: FONT_MONO }}><span>Low {displayValue(low)}</span><span>High {displayValue(high)}</span></div>
        <div className="relative my-2 h-1 rounded-full" style={{ background: "var(--color-space-border)" }}><span className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2" style={{ left: `${position}%`, background: "var(--color-neon-cyan)", borderColor: "var(--color-space-card)" }} /></div>
        <p className="text-[10px] leading-4" style={{ color: "var(--color-text-muted)" }}>Observed history · {economicObservationLabel(indicator, history[0].date)}–{economicObservationLabel(indicator, history.at(-1)!.date)} · {history.length} readings. Marker: latest.</p>
      </section>}
      {ECONOMIC_CONTEXT[indicator.id] && <section className="px-4 pb-4"><h4 className="mb-1 text-[10px] font-semibold uppercase tracking-wide" style={{ color: "var(--color-neon-cyan)" }}>What it means</h4><p className="text-xs leading-6" style={{ color: "var(--color-text-secondary)" }}>{ECONOMIC_CONTEXT[indicator.id]}</p></section>}
      <details className="group border-t px-4" style={{ borderColor: "var(--color-space-border)" }}>
        <summary className="cursor-pointer py-3 text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>Source &amp; measurement</summary>
        <div className="space-y-4 pb-4 text-xs leading-6">
          <p style={{ color: "var(--color-text-muted)" }}>{indicator.description}</p>
        </div>
      </details>
    </article>
  );
}
