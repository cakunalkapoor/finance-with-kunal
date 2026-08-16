"use client";

import dynamic from "next/dynamic";
import { ArrowUpRight, TrendingUp } from "lucide-react";
import { AI_CAPEX, AI_CAPEX_PRIOR_YEAR_SOURCE } from "@/lib/ai-data";
import { useTheme, CHART_COLORS } from "@/lib/use-theme";
import { FONT_MONO } from "@/lib/utils";
import SciFiCard, { CardHeader } from "@/components/ui/SciFiCard";
import type { EChartsOption } from "echarts";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

/*
 * Hyperscaler capex — the number that turns "AI is a big deal" into a cash
 * flow statement.
 *
 * Guidance ranges are drawn as a solid bar to the low end plus a hatched
 * extension to the high end, rather than a midpoint: the midpoint is a number
 * nobody published, and for Alphabet the $175–205B range is 30 billion dollars
 * of genuine uncertainty that a single bar would hide.
 */

const ACCENT = { light: "#37683f", dark: "#b9f227" } as const;

export default function AICapexChart() {
  const theme = useTheme();
  const c = CHART_COLORS[theme];
  const accent = ACCENT[theme];

  const companies = AI_CAPEX.map((p) => p.company);
  const priorYear = AI_CAPEX.map((p) => p.priorYear);
  const guidanceLow = AI_CAPEX.map((p) => p.low);
  const guidanceRange = AI_CAPEX.map((p) => Math.round((p.high - p.low) * 10) / 10);

  const totalLow = AI_CAPEX.reduce((sum, p) => sum + p.low, 0);
  const totalHigh = AI_CAPEX.reduce((sum, p) => sum + p.high, 0);
  const totalPrior = AI_CAPEX.reduce((sum, p) => sum + p.priorYear, 0);

  const option: EChartsOption = {
    backgroundColor: "transparent",
    grid: { top: 30, bottom: 26, left: 44, right: 12 },
    legend: {
      top: 0,
      left: 0,
      itemWidth: 10,
      itemHeight: 10,
      textStyle: { color: c.axisLabel, fontFamily: "Space Mono, monospace", fontSize: 10 },
      data: ["Prior year actual", "2026 guidance"],
    },
    tooltip: {
      trigger: "axis",
      backgroundColor: c.tooltipBg,
      borderColor: c.tooltipBorder,
      borderWidth: 1,
      extraCssText: `box-shadow: ${c.tooltipShadow}; border-radius: 6px;`,
      textStyle: { color: c.tooltipText, fontFamily: "Space Mono, monospace", fontSize: 11 },
      axisPointer: { type: "shadow" },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      formatter: (params: any) => {
        const rows = Array.isArray(params) ? params : [params];
        const idx = rows[0]?.dataIndex ?? 0;
        const plan = AI_CAPEX[idx];
        const range =
          plan.low === plan.high ? `$${plan.low}B` : `$${plan.low}–${plan.high}B`;
        const growth = Math.round(((plan.low / plan.priorYear) - 1) * 100);
        return `<div style="padding:2px 4px;max-width:230px">
          <div style="font-weight:700;margin-bottom:3px">${plan.company}</div>
          <div style="color:${c.tooltipMuted};font-size:10px">Prior year</div>
          <div>$${plan.priorYear}B</div>
          <div style="color:${c.tooltipMuted};font-size:10px;margin-top:3px">2026 guidance</div>
          <div>${range} <span style="color:${c.up}">+${growth}%</span></div>
          <div style="color:${c.tooltipMuted};font-size:10px;margin-top:4px;white-space:normal;line-height:1.4">${plan.note}</div>
        </div>`;
      },
    },
    xAxis: {
      type: "category",
      data: companies,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: c.axisLabel,
        fontFamily: "Space Mono, monospace",
        fontSize: 10,
        margin: 10,
      },
    },
    yAxis: {
      type: "value",
      splitNumber: 4,
      splitLine: { lineStyle: { color: c.grid, width: 1 } },
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: c.axisLabel,
        fontFamily: "Space Mono, monospace",
        fontSize: 10,
        formatter: (val: number) => `$${val}B`,
        margin: 8,
      },
    },
    series: [
      {
        name: "Prior year actual",
        type: "bar",
        data: priorYear,
        barMaxWidth: 26,
        itemStyle: { color: c.series1, borderRadius: [3, 3, 0, 0] },
      },
      {
        name: "2026 guidance",
        type: "bar",
        stack: "guide",
        data: guidanceLow,
        barMaxWidth: 26,
        itemStyle: { color: accent },
      },
      {
        // The uncertain part of a published range, drawn lighter so it reads as
        // "up to" rather than as committed spend. Hidden from the legend since
        // it isn't a separate concept.
        name: "Guidance range",
        type: "bar",
        stack: "guide",
        data: guidanceRange,
        barMaxWidth: 26,
        itemStyle: {
          color: theme === "dark" ? "rgba(185,242,39,0.28)" : "rgba(55,104,63,0.26)",
          borderRadius: [3, 3, 0, 0],
        },
      },
    ],
  };

  return (
    <SciFiCard glow="cyan">
      <CardHeader
        title="What the buildout costs"
        subtitle="Published 2026 capital expenditure plans vs the prior year · USD billions"
        action={
          <span
            className="flex items-center gap-1 rounded px-2 py-0.5"
            style={{
              fontFamily: FONT_MONO,
              fontSize: "10px",
              color: "var(--color-neon-cyan)",
              border: "1px solid rgba(167,139,250,0.28)",
              background: "rgba(167,139,250,0.08)",
            }}
          >
            <TrendingUp size={11} />${totalLow}–{totalHigh}B
          </span>
        }
      />

      <div className="px-2">
        <ReactECharts
          option={option}
          style={{ height: 260, width: "100%" }}
          opts={{ renderer: "svg" }}
          notMerge
        />
      </div>

      <div className="grid grid-cols-1 gap-2 px-4 pb-3 sm:grid-cols-2">
        {AI_CAPEX.map((plan) => (
          <a
            key={plan.ticker}
            href={plan.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-start gap-2 rounded p-2 transition-colors hover:bg-[var(--color-wash)]"
          >
            <span
              className="mt-0.5 shrink-0 font-bold"
              style={{ fontFamily: FONT_MONO, fontSize: "10px", color: "var(--color-neon-cyan)" }}
            >
              {plan.ticker}
            </span>
            <span className="min-w-0 grow">
              <span
                className="block text-[11px] leading-4"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {plan.note}
              </span>
              <span
                className="mt-0.5 flex items-center gap-1 text-[10px]"
                style={{ color: "var(--color-text-muted)", fontFamily: FONT_MONO }}
              >
                {plan.raised && (
                  <span style={{ color: "var(--color-neon-purple)" }}>RAISED ·</span>
                )}
                <span className="truncate underline-offset-2 group-hover:underline">
                  {plan.source}
                </span>
                <ArrowUpRight size={9} strokeWidth={2.5} className="shrink-0 opacity-40" aria-hidden />
              </span>
            </span>
          </a>
        ))}
      </div>

      <p
        className="border-t px-4 py-3 leading-5"
        style={{
          color: "var(--color-text-muted)",
          fontSize: "11px",
          borderColor: "var(--color-space-border)",
        }}
      >
        Combined ${totalLow}–{totalHigh}B against ${totalPrior.toFixed(0)}B the prior year. The
        2026 bars are each company&rsquo;s most recently published guidance, not a January plan —
        three of the four raised during the year, and the paler segment is the part of a range
        still labelled &ldquo;up to&rdquo;. Capex guidance is a forecast a company can revise at
        will, not a reported result. Prior-year bars come from a single comparable series —{" "}
        <a
          href={AI_CAPEX_PRIOR_YEAR_SOURCE.url}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2"
          style={{ color: "var(--color-text-secondary)" }}
        >
          {AI_CAPEX_PRIOR_YEAR_SOURCE.label}
        </a>
        , calendar-quarter and inclusive of finance leases, because Microsoft&rsquo;s June
        fiscal year-end makes headline &ldquo;FY2025&rdquo; capex figures non-comparable across
        these four.
      </p>
    </SciFiCard>
  );
}
