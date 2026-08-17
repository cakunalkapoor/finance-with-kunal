"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { AI_STOCKS, AI_INDEX_SERIES, AI_SERIES_POINTS } from "@/lib/ai-data";
import { useTheme, CHART_COLORS, withAlpha } from "@/lib/use-theme";
import {
  CHART_VIEWS,
  pointLabel,
  sliceFor,
  windowLabel,
  type ChartView,
} from "@/lib/chart-window";
import { FONT_MONO } from "@/lib/utils";
import SciFiCard, { CardHeader } from "@/components/ui/SciFiCard";
import type { EChartsOption } from "echarts";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

/*
 * "How is AI affecting the stock market?" answered with arithmetic rather than
 * assertion — the one section on /ai computed from data the site fetches
 * itself, against every global index the Markets page carries, over five years.
 *
 * Method, stated plainly because the method IS the caveat:
 *
 *   • Every series is rebased to 100 at the START OF THE SELECTED WINDOW, so
 *     switching 3M/YTD/3Y re-anchors rather than re-slicing a fixed baseline.
 *   • The basket is EQUAL-weighted, not cap-weighted. Cap weighting would just
 *     redraw the S&P — NVIDIA and Microsoft would be most of it. Equal weight
 *     asks a different question: how did the typical AI name do?
 *   • Returns are PRICE returns in each line's own listing currency. No
 *     dividends, no FX conversion. That last one matters more here than it did
 *     when this chart only held US series: the Nikkei's five-year gain is
 *     partly a weaker yen, and a Canadian reader converting to CAD would see
 *     different numbers. Stated in the footnote rather than silently corrected,
 *     because an FX-adjusted index return needs a stated base currency and this
 *     site doesn't have one.
 *
 * The line chart shows the paths; the ranked list gives each index its identity
 * back, since twelve muted lines are legible as a field but not individually.
 * Clicking a row lifts that index out of the field and into the chart.
 */

/** Accent hex per theme — ECharts can't read the CSS vars. Mirrors --color-neon-cyan. */
const ACCENT = { light: "#37683f", dark: "#b9f227" } as const;

/** The field of indices: one muted colour, not twelve categorical ones. A
 *  12-hue palette is unreadable at 1px and implies distinctions the chart isn't
 *  making — the comparison is basket-vs-field, with identity in the list. */
const FIELD = { light: "#9aa091", dark: "#5c6553" } as const;

const BASKET_ID = "__basket__";

/** Rebase a window of prices so its first REAL point is 100, preserving the
 *  leading nulls of a listing younger than the window. */
function rebase(values: (number | null)[]): (number | null)[] {
  const base = values.find((v): v is number => v !== null);
  if (!base) return values.map(() => null);
  return values.map((v) => (v === null ? null : Math.round((v / base) * 10000) / 100));
}

/**
 * The AI basket: an equal-weighted index, chained off weekly returns.
 *
 * Chained rather than "rebase each name to 100 and average", which is what this
 * chart did while every series covered the full window. Three names don't —
 * Arm listed Sept 2023, GE Vernova Apr 2024, Constellation Feb 2022 — and
 * averaging rebased levels would drag the basket toward 100 on the week each one
 * appears, inventing a drop that never happened.
 *
 * Chaining sidesteps that: each step averages the weekly returns of the names
 * present in BOTH that week and the previous one, then compounds. A new
 * constituent contributes from its second observation onward and never injects a
 * level discontinuity — the same way an index absorbs an addition.
 */
function chainedEqualWeight(slices: (number | null)[][]): number[] {
  const length = slices[0]?.length ?? 0;
  const level: number[] = new Array(length);
  level[0] = 100;

  for (let t = 1; t < length; t++) {
    let sum = 0;
    let n = 0;
    for (const s of slices) {
      const prev = s[t - 1];
      const curr = s[t];
      if (prev !== null && curr !== null && prev !== 0) {
        sum += curr / prev - 1;
        n += 1;
      }
    }
    // No overlapping pair (impossible with this universe, but a series could go
    // fully null): carry the level rather than break the line.
    level[t] = n === 0 ? level[t - 1] : level[t - 1] * (1 + sum / n);
  }

  return level.map((v) => Math.round(v * 100) / 100);
}

export default function AIMarketImpact() {
  // Defaults to 3Y, the longest rung the site-wide ladder offers. The series
  // hold five years, but the strip is deliberately the same everywhere.
  const [view, setView] = useState<ChartView>("3Y");
  const [highlight, setHighlight] = useState<string | null>(null);
  const theme = useTheme();
  const c = CHART_COLORS[theme];

  const { basket, indices, labels, dispersion, ranked, coverage, buyAndHold } = useMemo(() => {
    const windows = AI_STOCKS.map((s) => sliceFor(view, s.sparkline));
    const length = Math.min(...windows.map((s) => s.length));
    const basketSeries = chainedEqualWeight(windows);

    const indexSeries = AI_INDEX_SERIES.map((idx) => ({
      ...idx,
      rebased: rebase(sliceFor(view, idx.series)).slice(-length),
    }));

    /* Dispersion is computed only over names that traded for the WHOLE window.
       A name that listed halfway through has a shorter return, and ranking it
       against a full-window return would be comparing different lengths of
       time — which is exactly the mistake the grid alignment exists to stop. */
    const fullWindow = AI_STOCKS.map((s, i) => ({ stock: s, w: windows[i] })).filter(
      ({ w }) => w[0] !== null,
    );
    const stockReturns = fullWindow
      .map(({ stock, w }) => {
        const first = w[0] as number;
        const last = w[w.length - 1] as number;
        return { ticker: stock.ticker, flag: stock.flag, pct: (last / first - 1) * 100 };
      })
      .sort((a, b) => b.pct - a.pct);

    /** Window return of a rebased series, from its first real point. */
    const pctOf = (series: (number | null)[]) => {
      const live = series.filter((v): v is number => v !== null);
      if (live.length < 2) return 0;
      return (live[live.length - 1] / live[0] - 1) * 100;
    };

    const rankedRows = [
      {
        id: BASKET_ID,
        label: "AI basket",
        flag: "🤖",
        pct: basketSeries[basketSeries.length - 1] - 100,
        isBasket: true,
      },
      ...indexSeries.map((idx) => ({
        id: idx.symbol,
        label: idx.name,
        flag: idx.flag,
        pct: pctOf(idx.rebased),
        isBasket: false,
      })),
    ].sort((a, b) => b.pct - a.pct);

    return {
      basket: basketSeries,
      indices: indexSeries,
      labels: Array.from({ length }, (_, i) => pointLabel(i, length)),
      dispersion: {
        best: stockReturns[0],
        worst: stockReturns[stockReturns.length - 1],
        spread: stockReturns.length
          ? stockReturns[0].pct - stockReturns[stockReturns.length - 1].pct
          : 0,
      },
      ranked: rankedRows,
      coverage: { full: fullWindow.length, total: AI_STOCKS.length },
      /* Chaining weekly returns implies weekly REBALANCING, and on a basket
         this volatile that assumption is worth real percentage points — the
         rebalanced index and an equal-weighted buy-and-hold of the same names
         diverge by tens of points over five years (the diversification return).
         Neither is more correct; publishing only one without saying which would
         be. So the buy-and-hold figure is computed here and quoted alongside. */
      buyAndHold: stockReturns.length
        ? stockReturns.reduce((a, r) => a + r.pct, 0) / stockReturns.length
        : 0,
    };
  }, [view]);

  const basketReturn = basket.length ? basket[basket.length - 1] - 100 : 0;
  const basketRank = ranked.findIndex((r) => r.isBasket) + 1;
  const bestIndex = ranked.find((r) => !r.isBasket);
  const worstIndex = [...ranked].reverse().find((r) => !r.isBasket);

  // Zero baseline for the ranked bars: some windows have negative returns
  // (Hang Seng is roughly flat over five years), so bars grow both ways from a
  // computed zero rather than from the left edge.
  const pcts = ranked.map((r) => r.pct);
  const minPct = Math.min(0, ...pcts);
  const maxPct = Math.max(0, ...pcts);
  const span = maxPct - minPct || 1;
  const zeroAt = ((0 - minPct) / span) * 100;

  const signed = (n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(1)}%`;

  const option: EChartsOption = {
    backgroundColor: "transparent",
    grid: { top: 14, bottom: 28, left: 46, right: 14 },
    tooltip: {
      trigger: "axis",
      backgroundColor: c.tooltipBg,
      borderColor: c.tooltipBorder,
      borderWidth: 1,
      extraCssText: `box-shadow: ${c.tooltipShadow}; border-radius: 6px; max-height: 340px;`,
      textStyle: { color: c.tooltipText, fontFamily: "Space Mono, monospace", fontSize: 11 },
      axisPointer: { type: "line", lineStyle: { color: c.axisLine, width: 1 } },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      formatter: (params: any) => {
        const rows = Array.isArray(params) ? params : [params];
        if (rows.length === 0) return "";
        const sorted = [...rows].sort((a, b) => Number(b.value) - Number(a.value));
        const body = sorted
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((p: any) => {
            const change = Number(p.value) - 100;
            const isBasket = p.seriesName.startsWith("AI basket");
            return `<div style="display:flex;gap:12px;justify-content:space-between${
              isBasket ? `;font-weight:700;color:${ACCENT[theme]}` : ""
            }">
              <span>${p.seriesName}</span>
              <span>${change >= 0 ? "+" : ""}${change.toFixed(1)}%</span>
            </div>`;
          })
          .join("");
        return `<div style="padding:2px 4px">
          <div style="color:${c.tooltipMuted};font-size:10px;margin-bottom:3px">${sorted[0].axisValue}</div>
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
    series: [
      // Indices first so the basket draws over the top of them.
      ...indices.map((idx) => {
        const lifted = highlight === idx.symbol;
        return {
          name: `${idx.flag} ${idx.name}`,
          type: "line" as const,
          data: idx.rebased,
          smooth: 0.25,
          symbol: "none" as const,
          z: lifted ? 3 : 1,
          lineStyle: {
            width: lifted ? 2 : 1,
            color: lifted ? c.series1 : FIELD[theme],
            opacity: lifted ? 1 : highlight ? 0.28 : 0.55,
          },
          itemStyle: { color: lifted ? c.series1 : FIELD[theme] },
        };
      }),
      {
        name: "AI basket (equal-weight)",
        type: "line",
        data: basket,
        smooth: 0.25,
        symbol: "none",
        z: 5,
        lineStyle: { width: 2.6, color: ACCENT[theme] },
        itemStyle: { color: ACCENT[theme] },
        areaStyle: {
          color: {
            type: "linear" as const,
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: withAlpha(ACCENT[theme], theme === "dark" ? 0.22 : 0.16) },
              { offset: 1, color: withAlpha(ACCENT[theme], 0) },
            ],
          },
        },
      },
    ],
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

  return (
    <SciFiCard glow="cyan">
      <CardHeader
        title="AI stocks vs every global market"
        subtitle={`Equal-weighted basket of ${AI_STOCKS.length} AI-exposed listings against ${AI_INDEX_SERIES.length} global indices · all in USD, rebased to 100 · ${windowLabel(view, AI_SERIES_POINTS)}`}
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

      <div className="grid grid-cols-1 gap-2 xl:grid-cols-[minmax(0,1.35fr)_minmax(300px,1fr)]">
        <div className="px-2">
          <ReactECharts
            option={option}
            style={{ height: 340, width: "100%" }}
            opts={{ renderer: "svg" }}
            notMerge
          />
        </div>

        {/* Ranked returns. The chart shows twelve indices as one field; this is
            where they get their names back. Rows are buttons: clicking lifts
            that index out of the field and into the chart. */}
        <div className="px-4 pb-2 xl:pr-5 xl:pl-0">
          <div className="mb-2 flex items-baseline justify-between">
            <p
              className="text-[10px] font-bold uppercase"
              style={{
                color: "var(--color-text-muted)",
                fontFamily: FONT_MONO,
                letterSpacing: "0.1em",
              }}
            >
              Ranked · {windowLabel(view, AI_SERIES_POINTS)}
            </p>
            {highlight && (
              <button
                onClick={() => setHighlight(null)}
                className="text-[10px] underline underline-offset-2"
                style={{ color: "var(--color-text-muted)", fontFamily: FONT_MONO }}
              >
                clear
              </button>
            )}
          </div>

          <div className="space-y-1">
            {ranked.map((row) => {
              const active = highlight === row.id;
              const width = (Math.abs(row.pct) / span) * 100;
              const positive = row.pct >= 0;
              const barColor = row.isBasket
                ? "var(--color-neon-cyan)"
                : active
                  ? "var(--color-neon-purple)"
                  : "var(--color-text-muted)";

              return (
                <button
                  key={row.id}
                  onClick={() =>
                    row.isBasket ? undefined : setHighlight(active ? null : row.id)
                  }
                  aria-pressed={row.isBasket ? undefined : active}
                  className="flex w-full items-center gap-2 rounded px-1 py-0.5 text-left transition-colors"
                  style={{
                    background: active ? "var(--color-wash)" : "transparent",
                    cursor: row.isBasket ? "default" : "pointer",
                  }}
                >
                  <span className="w-3.5 shrink-0 text-[11px]">{row.flag}</span>
                  <span
                    className="w-[86px] shrink-0 truncate text-[10px]"
                    style={{
                      fontFamily: FONT_MONO,
                      color: row.isBasket
                        ? "var(--color-neon-cyan)"
                        : "var(--color-text-secondary)",
                      fontWeight: row.isBasket ? 700 : 400,
                    }}
                    title={row.label}
                  >
                    {row.label}
                  </span>

                  {/* Zero-anchored bar — negatives grow left, positives right. */}
                  <span className="relative h-2.5 min-w-0 grow overflow-hidden rounded-sm">
                    <span
                      className="absolute inset-y-0 w-px"
                      style={{ left: `${zeroAt}%`, background: "var(--color-space-border)" }}
                    />
                    <span
                      className="absolute inset-y-0 rounded-sm"
                      style={{
                        left: positive ? `${zeroAt}%` : `${zeroAt - width}%`,
                        width: `${width}%`,
                        background: barColor,
                        opacity: row.isBasket || active ? 1 : 0.5,
                      }}
                    />
                  </span>

                  <span
                    className="w-[54px] shrink-0 text-right text-[10px] font-semibold"
                    style={{
                      fontFamily: FONT_MONO,
                      color: row.isBasket
                        ? "var(--color-neon-cyan)"
                        : positive
                          ? "var(--color-market-up)"
                          : "var(--color-market-down)",
                    }}
                  >
                    {signed(row.pct)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div
        className="grid grid-cols-2 gap-4 border-t px-4 py-3 sm:grid-cols-4"
        style={{ borderColor: "var(--color-space-border)" }}
      >
        {stat("AI basket", signed(basketReturn), basketReturn >= 0 ? "up" : "down")}
        {stat("Rank", `${basketRank} of ${ranked.length}`)}
        {stat(
          "Best index",
          bestIndex ? `${bestIndex.flag} ${signed(bestIndex.pct)}` : "—",
          bestIndex && bestIndex.pct >= 0 ? "up" : "down",
        )}
        {stat("Best–worst stock spread", `${dispersion.spread.toFixed(0)}pp`)}
      </div>

      <p
        className="px-4 pb-3 leading-5"
        style={{ color: "var(--color-text-muted)", fontSize: "11px" }}
      >
        Over this window the basket returned {signed(basketReturn)}, ranking {basketRank} of{" "}
        {ranked.length} against the world&rsquo;s major indices — best of them{" "}
        {bestIndex?.label} at {bestIndex ? signed(bestIndex.pct) : "—"}, weakest{" "}
        {worstIndex?.label} at {worstIndex ? signed(worstIndex.pct) : "—"}. Inside the basket{" "}
        {dispersion.best.ticker} returned {signed(dispersion.best.pct)} and{" "}
        {dispersion.worst.ticker} {signed(dispersion.worst.pct)}, a{" "}
        {dispersion.spread.toFixed(0)} point spread within the same theme
        {coverage.full < coverage.total && (
          <>
            {" "}
            — measured across the {coverage.full} names that traded for the whole window, since the
            other {coverage.total - coverage.full} listed part-way through it
          </>
        )}
        . The basket is an equal-weighted index chained off weekly returns, so a constituent that
        lists mid-window joins without dropping the line. Chaining implies weekly rebalancing,
        which on a basket this volatile is worth real percentage points: buying the same names
        equal-weighted at the start and holding returned {signed(buyAndHold)}{" "}
        over this window against the index&rsquo;s {signed(basketReturn)}. Equal rather than cap
        weighting either way, so it answers how the typical AI name did rather than restating the
        index. Every line is in{" "}
        <strong style={{ color: "var(--color-text-secondary)" }}>US dollars</strong>{" "}
        — each daily close converted at that day&rsquo;s rate before anything is derived — so a gap between two
        lines is a performance gap and not partly a currency move. That matters: the Nikkei returned
        about +149% in yen over five years but roughly +63% in dollars. Price returns only, so
        dividends are excluded. Membership is a judgement call and the basket is not investable.
      </p>
    </SciFiCard>
  );
}
