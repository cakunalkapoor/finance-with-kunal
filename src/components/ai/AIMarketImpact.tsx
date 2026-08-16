"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { AI_STOCKS } from "@/lib/ai-data";
import { EQUITY_INDICES } from "@/lib/site-data";
import { useTheme, CHART_COLORS, withAlpha } from "@/lib/use-theme";
import { CHART_VIEWS, pointLabel, sliceFor, windowLabel, type ChartView } from "@/lib/chart-window";
import { FONT_MONO } from "@/lib/utils";
import SciFiCard, { CardHeader } from "@/components/ui/SciFiCard";
import type { EChartsOption } from "echarts";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

/*
 * "How is AI affecting the stock market?" answered with arithmetic rather than
 * assertion — this is the one section on /ai computed from data the site
 * already fetches, not curated from a headline.
 *
 * Method, stated plainly because the method IS the caveat:
 *   • Every series is rebased to 100 at the START OF THE SELECTED WINDOW, so
 *     switching 3M/YTD/3Y re-anchors rather than re-slicing a fixed baseline.
 *   • The basket is EQUAL-weighted, not cap-weighted. Cap weighting would just
 *     redraw the S&P — NVIDIA and Microsoft would be most of it. Equal weight
 *     asks a different question: how did the typical AI name do?
 *   • It is a PRICE return in each stock's own listing currency. No dividends,
 *     no FX. That is defensible for a 24-name basket that pays almost nothing,
 *     and it keeps the KRW rows from needing a won/dollar series to be honest.
 *
 * The point of the chart is the gap between the basket and the index, and the
 * dispersion stat beneath it is the counterweight: a wide spread means "AI
 * stocks" moved as anything but a single trade.
 */

/** Accent hex per theme — ECharts can't read the CSS vars. Mirrors --color-neon-cyan. */
const ACCENT = { light: "#37683f", dark: "#b9f227" } as const;

type SeriesKey = "basket" | "sp500" | "ndx";

/** Rebase a window of prices so its first point is 100. */
function rebase(values: number[]): number[] {
  const base = values[0];
  if (!base) return values.map(() => 100);
  return values.map((v) => Math.round((v / base) * 10000) / 100);
}

export default function AIMarketImpact() {
  const [view, setView] = useState<ChartView>("YTD");
  const theme = useTheme();
  const c = CHART_COLORS[theme];

  const { series, labels, dispersion } = useMemo(() => {
    // Each stock rebased inside the window, then averaged point-by-point.
    const slices = AI_STOCKS.map((s) => rebase(sliceFor(view, s.sparkline)));
    const length = Math.min(...slices.map((s) => s.length));
    const basket = Array.from({ length }, (_, i) => {
      const sum = slices.reduce((acc, s) => acc + s[i], 0);
      return Math.round((sum / slices.length) * 100) / 100;
    });

    const indexSeries = (symbol: string) => {
      const index = EQUITY_INDICES.find((q) => q.symbol === symbol);
      return index ? rebase(sliceFor(view, index.sparkline)).slice(-length) : [];
    };

    // Window return per name, for the best/worst/spread readout.
    const returns = AI_STOCKS.map((s) => {
      const w = sliceFor(view, s.sparkline);
      return { ticker: s.ticker, pct: (w[w.length - 1] / w[0] - 1) * 100 };
    }).sort((a, b) => b.pct - a.pct);

    return {
      labels: Array.from({ length }, (_, i) => pointLabel(i, length)),
      series: {
        basket,
        sp500: indexSeries("^GSPC"),
        ndx: indexSeries("^NDX"),
      } as Record<SeriesKey, number[]>,
      dispersion: {
        best: returns[0],
        worst: returns[returns.length - 1],
        spread: returns[0].pct - returns[returns.length - 1].pct,
      },
    };
  }, [view]);

  const basketReturn = series.basket.length ? series.basket[series.basket.length - 1] - 100 : 0;
  const spReturn = series.sp500.length ? series.sp500[series.sp500.length - 1] - 100 : 0;
  const excess = basketReturn - spReturn;

  const lines: { key: SeriesKey; name: string; color: string; width: number }[] = [
    { key: "basket", name: "AI basket (equal-weight)", color: ACCENT[theme], width: 2.4 },
    { key: "sp500", name: "S&P 500", color: c.series1, width: 1.6 },
    { key: "ndx", name: "NASDAQ 100", color: c.series2, width: 1.6 },
  ];

  const option: EChartsOption = {
    backgroundColor: "transparent",
    grid: { top: 34, bottom: 28, left: 44, right: 16 },
    legend: {
      top: 0,
      left: 0,
      itemWidth: 14,
      itemHeight: 2,
      textStyle: { color: c.axisLabel, fontFamily: "Space Mono, monospace", fontSize: 10 },
      data: lines.map((l) => l.name),
    },
    tooltip: {
      trigger: "axis",
      backgroundColor: c.tooltipBg,
      borderColor: c.tooltipBorder,
      borderWidth: 1,
      extraCssText: `box-shadow: ${c.tooltipShadow}; border-radius: 6px;`,
      textStyle: { color: c.tooltipText, fontFamily: "Space Mono, monospace", fontSize: 11 },
      axisPointer: { type: "line", lineStyle: { color: c.axisLine, width: 1 } },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      formatter: (params: any) => {
        const rows = Array.isArray(params) ? params : [params];
        if (rows.length === 0) return "";
        const body = rows
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((p: any) => {
            const change = Number(p.value) - 100;
            return `<div style="display:flex;gap:10px;justify-content:space-between">
              <span style="color:${p.color}">${p.seriesName}</span>
              <strong>${change >= 0 ? "+" : ""}${change.toFixed(1)}%</strong>
            </div>`;
          })
          .join("");
        return `<div style="padding:2px 4px">
          <div style="color:${c.tooltipMuted};font-size:10px;margin-bottom:3px">${rows[0].axisValue}</div>
          ${body}
        </div>`;
      },
    },
    xAxis: {
      type: "category",
      data: labels,
      boundaryGap: false,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: c.axisLabel,
        fontFamily: "Space Mono, monospace",
        fontSize: 10,
        interval: Math.max(1, Math.floor(labels.length / 5)),
        margin: 12,
      },
    },
    yAxis: {
      type: "value",
      scale: true,
      splitNumber: 4,
      splitLine: { lineStyle: { color: c.grid, width: 1 } },
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: c.axisLabel,
        fontFamily: "Space Mono, monospace",
        fontSize: 10,
        formatter: (val: number) => `${val}`,
        margin: 10,
      },
    },
    series: lines.map(({ key, name, color, width }) => ({
      name,
      type: "line",
      data: series[key],
      smooth: 0.25,
      symbol: "none",
      lineStyle: { width, color },
      itemStyle: { color },
      // Only the basket gets a fill — three washes stacked would be unreadable.
      ...(key === "basket"
        ? {
            areaStyle: {
              color: {
                type: "linear" as const,
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0, color: withAlpha(color, theme === "dark" ? 0.2 : 0.14) },
                  { offset: 1, color: withAlpha(color, 0) },
                ],
              },
            },
          }
        : {}),
    })),
  };

  const stat = (label: string, value: string, tone?: "up" | "down") => (
    <div>
      <p
        className="text-[10px] font-bold uppercase"
        style={{ color: "var(--color-text-muted)", fontFamily: FONT_MONO, letterSpacing: "0.1em" }}
      >
        {label}
      </p>
      <p
        className="mt-1 text-base font-bold"
        style={{
          fontFamily: FONT_MONO,
          color:
            tone === "up"
              ? "var(--color-market-up)"
              : tone === "down"
                ? "var(--color-market-down)"
                : "var(--color-text-primary)",
        }}
      >
        {value}
      </p>
    </div>
  );

  const signed = (n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(1)}%`;

  return (
    <SciFiCard glow="cyan">
      <CardHeader
        title="AI stocks vs the market"
        subtitle={`Equal-weighted basket of ${AI_STOCKS.length} AI-exposed listings, rebased to 100 · ${windowLabel(view)}`}
        action={
          <div className="flex items-center gap-1">
            {CHART_VIEWS.map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className="rounded px-1.5 py-0.5 transition-all"
                style={{
                  fontFamily: FONT_MONO,
                  fontSize: "10px",
                  letterSpacing: "0.08em",
                  fontWeight: view === v ? 700 : 500,
                  color: view === v ? "var(--color-neon-cyan)" : "var(--color-text-muted)",
                  background: view === v ? "rgba(167,139,250,0.12)" : "transparent",
                  border: view === v ? "1px solid rgba(167,139,250,0.3)" : "1px solid transparent",
                }}
              >
                {v}
              </button>
            ))}
          </div>
        }
      />

      <div className="px-2">
        <ReactECharts
          option={option}
          style={{ height: 300, width: "100%" }}
          opts={{ renderer: "svg" }}
          notMerge
        />
      </div>

      <div
        className="grid grid-cols-2 gap-4 border-t px-4 py-3 sm:grid-cols-4"
        style={{ borderColor: "var(--color-space-border)" }}
      >
        {stat("AI basket", signed(basketReturn), basketReturn >= 0 ? "up" : "down")}
        {stat("S&P 500", signed(spReturn), spReturn >= 0 ? "up" : "down")}
        {stat("Excess", signed(excess), excess >= 0 ? "up" : "down")}
        {stat("Best–worst spread", `${dispersion.spread.toFixed(0)}pp`)}
      </div>

      <p
        className="px-4 pb-3 leading-5"
        style={{ color: "var(--color-text-muted)", fontSize: "11px" }}
      >
        Over this window {dispersion.best.ticker} returned {signed(dispersion.best.pct)} and{" "}
        {dispersion.worst.ticker} {signed(dispersion.worst.pct)} — a {dispersion.spread.toFixed(0)}{" "}
        point spread inside the same theme. Equal-weighted price returns in each listing&rsquo;s own
        currency, excluding dividends; equal rather than cap weighting, so the basket answers how
        the typical AI name did rather than restating the index. Membership is a judgement call and
        the basket is not investable.
      </p>
    </SciFiCard>
  );
}
