"use client";

import dynamic from "next/dynamic";
import { AI_LAYOFF_MONTHS } from "@/lib/ai-data";
import { useTheme, CHART_COLORS } from "@/lib/use-theme";
import SciFiCard, { CardHeader } from "@/components/ui/SciFiCard";
import type { EChartsOption } from "echarts";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

/*
 * AI-attributed job cuts.
 *
 * The framing matters more here than anywhere else on the page. Challenger
 * counts the reason an employer PUTS IN ITS OWN ANNOUNCEMENT. So this series
 * measures how willing companies have become to say the word "AI" — which is
 * related to, but emphatically not the same as, how many jobs AI displaced. A
 * restructuring relabelled as an AI efficiency programme moves this line; a
 * quiet hiring freeze that never becomes an announcement does not.
 *
 * June 2026 is missing on purpose — the releases sourced in ai-data.ts give a
 * cumulative half-year figure but not June's own share, and inventing a point
 * to close the gap would be worse than the gap. The chart labels it.
 */

const ACCENT = { light: "#37683f", dark: "#b9f227" } as const;

export default function AILayoffsChart() {
  const theme = useTheme();
  const c = CHART_COLORS[theme];

  const months = AI_LAYOFF_MONTHS.map((m) => m.month.replace(" 2026", ""));
  const shares = AI_LAYOFF_MONTHS.map((m) => m.aiSharePct);

  const option: EChartsOption = {
    backgroundColor: "transparent",
    grid: { top: 16, bottom: 26, left: 38, right: 12 },
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
        const entry = AI_LAYOFF_MONTHS[rows[0]?.dataIndex ?? 0];
        const counts = [
          entry.aiCuts && `${entry.aiCuts.toLocaleString("en-US")} AI-attributed`,
          entry.totalCuts && `${entry.totalCuts.toLocaleString("en-US")} announced`,
        ]
          .filter(Boolean)
          .join(" of ");
        return `<div style="padding:2px 4px">
          <div style="color:${c.tooltipMuted};font-size:10px">${entry.month}</div>
          <div style="font-weight:700;font-size:13px">${entry.aiSharePct}% of announced cuts</div>
          ${counts ? `<div style="color:${c.tooltipMuted};font-size:10px;margin-top:2px">${counts}</div>` : ""}
        </div>`;
      },
    },
    xAxis: {
      type: "category",
      data: months,
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
      // 0 / 15 / 30 / 45 rather than splitNumber's 0 / 20 / 40 / 45, which put an
      // uneven 5-point gap at the top of the axis.
      max: 45,
      interval: 15,
      splitLine: { lineStyle: { color: c.grid, width: 1 } },
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: c.axisLabel,
        fontFamily: "Space Mono, monospace",
        fontSize: 10,
        formatter: (val: number) => `${val}%`,
        margin: 8,
      },
    },
    series: [
      {
        type: "bar",
        data: shares,
        barMaxWidth: 34,
        itemStyle: { color: ACCENT[theme], borderRadius: [3, 3, 0, 0] },
      },
    ],
  };

  return (
    <SciFiCard glow="purple">
      <CardHeader
        title="AI as the stated reason for job cuts"
        subtitle="Share of announced US job cuts naming AI · monthly, 2026"
      />

      <div className="px-2">
        <ReactECharts
          option={option}
          style={{ height: 210, width: "100%" }}
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
        This tracks <strong style={{ color: "var(--color-text-secondary)" }}>attribution, not
        measurement</strong> — it counts the reason employers give in their own announcements, so it
        moves when a restructuring gets relabelled as an AI programme, and misses displacement that
        never becomes a press release. June is absent because the releases cited give a cumulative
        half-year figure but not that month&rsquo;s own share; the gap is deliberate rather than
        interpolated. Source: Challenger, Gray &amp; Christmas.
      </p>
    </SciFiCard>
  );
}
