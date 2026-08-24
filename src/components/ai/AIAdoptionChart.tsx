"use client";

import dynamic from "next/dynamic";
import { AI_ADOPTION_BY_SIZE, AI_ADOPTION_NATIONAL_RANGE } from "@/lib/ai-data";
import { useTheme, CHART_COLORS } from "@/lib/use-theme";
import SciFiCard, { CardHeader } from "@/components/ui/SciFiCard";
import type { EChartsOption } from "echarts";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

/*
 * Which US nonfarm employer businesses report using AI.
 *
 * The Census Bureau's Business Trends and Outlook Survey is the only
 * nationally representative, regularly published measure of US business AI
 * use. Every other adoption number in circulation is a vendor survey run by a
 * company selling AI, which is a bad way to learn whether people are buying AI.
 *
 * The latest BTOS table publishes point estimates for all seven employment-size
 * bands, so the chart renders the full set rather than selecting only large
 * firms. Every bar and the national reference use the same survey period.
 */

const ACCENT = { light: "#37683f", dark: "#b9f227" } as const;

export default function AIAdoptionChart() {
  const theme = useTheme();
  const c = CHART_COLORS[theme];
  const [nationalLow, nationalHigh] = AI_ADOPTION_NATIONAL_RANGE;
  const formatPct = (value: number) => (Number.isInteger(value) ? `${value}` : value.toFixed(1));
  const nationalRate = nationalLow === nationalHigh ? nationalHigh : (nationalLow + nationalHigh) / 2;
  const nationalLabel =
    nationalLow === nationalHigh
      ? `${formatPct(nationalHigh)}%`
      : `${formatPct(nationalLow)}–${formatPct(nationalHigh)}%`;
  const largestValue = Math.max(nationalHigh, ...AI_ADOPTION_BY_SIZE.map((point) => point.value));
  const xAxisMax = Math.ceil((largestValue + 5) / 10) * 10;

  const option: EChartsOption = {
    backgroundColor: "transparent",
    grid: { top: 16, bottom: 26, left: 132, right: 48 },
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
        const p = Array.isArray(params) ? params[0] : params;
        return `<div style="padding:2px 4px">
          <div style="color:${c.tooltipMuted};font-size:10px">${p.name}</div>
          <div style="font-weight:700;font-size:13px">${p.value}% use AI</div>
          <div style="color:${c.tooltipMuted};font-size:10px;margin-top:2px">National rate ${nationalLabel}</div>
        </div>`;
      },
    },
    xAxis: {
      type: "value",
      max: xAxisMax,
      splitNumber: 3,
      splitLine: { lineStyle: { color: c.grid, width: 1 } },
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: c.axisLabel,
        fontFamily: "Space Mono, monospace",
        fontSize: 10,
        formatter: (val: number) => `${val}%`,
      },
    },
    yAxis: {
      type: "category",
      data: AI_ADOPTION_BY_SIZE.map((p) => p.label),
      inverse: true,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: c.axisLabel,
        fontFamily: "Space Mono, monospace",
        fontSize: 10,
        margin: 10,
      },
    },
    series: [
      {
        type: "bar",
        data: AI_ADOPTION_BY_SIZE.map((p) => p.value),
        barMaxWidth: 22,
        itemStyle: { color: ACCENT[theme], borderRadius: [0, 3, 3, 0] },
        label: {
          show: true,
          position: "right",
          color: c.axisLabel,
          fontFamily: "Space Mono, monospace",
          fontSize: 10,
          formatter: "{c}%",
        },
        // National estimate drawn as a dashed reference using the same BTOS
        // period as every employment-size bar.
        markLine: {
          silent: true,
          symbol: "none",
          lineStyle: { color: c.series2, width: 1.2, type: "dashed" },
          label: {
            formatter: `National ${nationalLabel}`,
            color: c.series2,
            fontFamily: "Space Mono, monospace",
            fontSize: 9,
            position: "insideEndTop",
          },
          data: [{ xAxis: nationalRate }],
        },
      },
    ],
  };

  return (
    <SciFiCard glow="purple">
      <CardHeader
        title="Which US employer businesses are using AI"
        subtitle="Nonfarm employer businesses · share using AI in any business function · by employment size · Jul 13–26, 2026"
      />

      <div className="px-2">
        <ReactECharts
          option={option}
          style={{ height: Math.max(220, AI_ADOPTION_BY_SIZE.length * 36 + 48), width: "100%" }}
          opts={{ renderer: "svg" }}
          notMerge
        />
      </div>

      <p
        className="border-t px-4 py-3 leading-5"
        style={{
          color: "var(--color-text-muted)",
          fontSize: "11px",
          borderColor: "var(--color-space-border)",
        }}
      >
        The national estimate is {nationalLabel}. All {AI_ADOPTION_BY_SIZE.length} bars reproduce
        Census-published employment-size estimates for US nonfarm employer businesses in the Jul
        13–26 reference period, released Aug 13; they are survey estimates rather than
        administrative counts. The size comparison is descriptive and does not by itself measure
        AI&rsquo;s effect on output or employment. Source: US Census Bureau Business Trends and
        Outlook Survey.
      </p>
    </SciFiCard>
  );
}
