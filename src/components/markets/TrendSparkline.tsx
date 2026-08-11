"use client";

import dynamic from "next/dynamic";
import type { EChartsOption } from "echarts";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

/* The one sparkline used by every table on the Markets page — equities, ETFs,
   bonds, commodities, currencies and crypto.

   It takes `labels` already resolved by the caller (weekly for price series,
   monthly for bond trends, see lib/chart-window.ts) so it never has to know
   the cadence of what it's drawing. The first and last labels are pinned under
   the line, which is what tells a reader WHEN the shape happened; the rest are
   available on hover. */

export const SPARKLINE_HEIGHT = 52;

export default function TrendSparkline({
  values,
  labels,
  ariaLabel,
  format = (n) => n.toFixed(2),
  /** Bond yields fall when prices rise, so "up is good" isn't universal. */
  positiveIsUp = true,
  height = SPARKLINE_HEIGHT,
}: {
  values: number[];
  labels: string[];
  ariaLabel: string;
  format?: (value: number) => string;
  positiveIsUp?: boolean;
  height?: number;
}) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  // Colour follows the trend of the *visible* window, so it stays truthful
  // when the reader switches YTD / 52W / 3Y.
  const rising = values[values.length - 1] >= values[0];
  const good = positiveIsUp ? rising : !rising;
  const color = good ? "#34d399" : "#fb7185";
  const wash = good ? "rgba(52,211,153,0.16)" : "rgba(251,113,133,0.16)";

  const option: EChartsOption = {
    animation: false,
    // Bottom gutter holds the two date anchors.
    grid: { top: 3, bottom: 15, left: 2, right: 2 },
    tooltip: {
      trigger: "axis",
      confine: true,
      backgroundColor: "rgba(20,22,18,0.94)",
      borderWidth: 0,
      padding: [4, 8],
      textStyle: { color: "#f2f1eb", fontSize: 11 },
      formatter: (params) => {
        const p = Array.isArray(params) ? params[0] : params;
        return `${p.name}<br/><strong>${format(Number(p.value))}</strong>`;
      },
    },
    xAxis: {
      type: "category",
      data: labels,
      boundaryGap: false,
      axisLine: { show: false },
      axisTick: { show: false },
      // Only the two ends — anything more is unreadable at this size.
      axisLabel: {
        show: true,
        showMinLabel: true,
        showMaxLabel: true,
        interval: Math.max(1, labels.length - 2),
        color: "var(--color-text-muted)",
        fontSize: 9,
        margin: 5,
      },
    },
    yAxis: { type: "value", show: false, min: min * 0.997, max: max * 1.003 },
    series: [
      {
        type: "line",
        data: values,
        smooth: true,
        symbol: "none",
        lineStyle: { width: 1.5, color },
        areaStyle: {
          color: {
            type: "linear",
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: wash },
              { offset: 1, color: "rgba(0,0,0,0)" },
            ],
          },
        },
      },
    ],
  };

  return (
    <ReactECharts
      option={option}
      style={{ height, width: "100%", minWidth: 96 }}
      opts={{ renderer: "svg" }}
      aria-label={ariaLabel}
    />
  );
}
