"use client";

import dynamic from "next/dynamic";
import { AI_ADOPTION_BY_SIZE, AI_ADOPTION_NATIONAL_RANGE } from "@/lib/ai-data";
import { useTheme, CHART_COLORS } from "@/lib/use-theme";
import SciFiCard, { CardHeader } from "@/components/ui/SciFiCard";
import type { EChartsOption } from "echarts";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

/*
 * Who is actually using this.
 *
 * The Census Bureau's Business Trends and Outlook Survey is the only
 * nationally representative, regularly published measure of US business AI
 * use. Every other adoption number in circulation is a vendor survey run by a
 * company selling AI, which is a bad way to learn whether people are buying AI.
 *
 * Only the two large-firm bands are plotted because they are the only two the
 * Census publishes as point estimates — firms under 20 employees are described
 * as "less than 20%" with no figure, and the 20–99 band isn't broken out. Those
 * are stated as text beneath the chart rather than drawn as invented bars.
 */

const ACCENT = { light: "#37683f", dark: "#b9f227" } as const;

export default function AIAdoptionChart() {
  const theme = useTheme();
  const c = CHART_COLORS[theme];
  const [nationalLow, nationalHigh] = AI_ADOPTION_NATIONAL_RANGE;

  const option: EChartsOption = {
    backgroundColor: "transparent",
    grid: { top: 16, bottom: 26, left: 96, right: 40 },
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
          <div style="color:${c.tooltipMuted};font-size:10px;margin-top:2px">National rate ${nationalLow}–${nationalHigh}%</div>
        </div>`;
      },
    },
    xAxis: {
      type: "value",
      max: 45,
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
        barMaxWidth: 26,
        itemStyle: { color: ACCENT[theme], borderRadius: [0, 3, 3, 0] },
        label: {
          show: true,
          position: "right",
          color: c.axisLabel,
          fontFamily: "Space Mono, monospace",
          fontSize: 10,
          formatter: "{c}%",
        },
        // National rate drawn as a band behind the bars: the gap between the
        // bars and this line IS the finding.
        markLine: {
          silent: true,
          symbol: "none",
          lineStyle: { color: c.series2, width: 1.2, type: "dashed" },
          label: {
            formatter: `National ${nationalLow}–${nationalHigh}%`,
            color: c.series2,
            fontFamily: "Space Mono, monospace",
            fontSize: 9,
            position: "insideEndTop",
          },
          data: [{ xAxis: nationalHigh }],
        },
      },
    ],
  };

  return (
    <SciFiCard glow="purple">
      <CardHeader
        title="Who is actually using it"
        subtitle="Share of US firms using AI in a business function · by employment size · Dec 2025 – May 2026"
      />

      <div className="px-2">
        <ReactECharts
          option={option}
          style={{ height: 170, width: "100%" }}
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
        Adoption is a large-firm phenomenon: {AI_ADOPTION_BY_SIZE[1].value}% of firms with 250+
        employees against a national rate of {nationalLow}–{nationalHigh}%. Smaller bands are not
        plotted because the Census does not publish them as point estimates — firms under 20
        employees are characterised only as &ldquo;less than 20%&rdquo;, and adoption there did not
        change significantly over the period. Source: US Census Bureau Business Trends and Outlook
        Survey, the only nationally representative measure of business AI use.
      </p>
    </SciFiCard>
  );
}
