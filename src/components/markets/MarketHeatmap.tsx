"use client";

import dynamic from "next/dynamic";
import { HEATMAP_DATA } from "@/lib/mock-data";
import SciFiCard, { CardHeader } from "@/components/ui/SciFiCard";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

function getHeatColor(change: number): string {
  if (change > 3) return "#007a45";
  if (change > 1.5) return "#00a855";
  if (change > 0.5) return "#00c966";
  if (change > 0) return "#00d98a";
  if (change > -0.5) return "#d92b2b";
  if (change > -1.5) return "#b51f1f";
  if (change > -3) return "#8f1414";
  return "#6e0000";
}

function getBorderColor(change: number): string {
  if (change > 0) return "rgba(16, 217, 142, 0.3)";
  return "rgba(244, 63, 94, 0.3)";
}

export default function MarketHeatmap() {
  // Build label strings without function formatters to avoid ECharts TS strictness
  const treemapData = HEATMAP_DATA.map((sector) => ({
    name: sector.name,
    value: sector.value,
    label: {
      show: true,
      formatter: `{b}\n${sector.change >= 0 ? "+" : ""}${sector.change.toFixed(2)}%`,
    },
    itemStyle: {
      color: getHeatColor(sector.change),
      borderColor: getBorderColor(sector.change),
      borderWidth: 2,
      gapWidth: 3,
    },
    children: sector.children?.map((stock) => ({
      name: stock.ticker,
      value: stock.value,
      label: {
        show: true,
        formatter: `{b}\n${stock.change >= 0 ? "+" : ""}${stock.change.toFixed(2)}%`,
      },
      itemStyle: {
        color: getHeatColor(stock.change),
        borderColor: getBorderColor(stock.change),
        borderWidth: 1,
        gapWidth: 2,
      },
    })),
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const option: any = {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "item",
      backgroundColor: "rgba(8,12,24,0.95)",
      borderColor: "rgba(0,212,255,0.3)",
      borderWidth: 1,
      textStyle: {
        color: "#e2e8ff",
        fontFamily: "Space Mono, monospace",
        fontSize: 12,
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      formatter: (params: any) => {
        const sector = HEATMAP_DATA.find(
          (s) => s.name === params.name || s.children?.some((c) => c.ticker === params.name)
        );
        const stock = sector?.children?.find((c) => c.ticker === params.name);
        const change = stock ? stock.change : (sector?.change ?? 0);
        const sign = change >= 0 ? "+" : "";
        const val = typeof params.value === "number" ? params.value.toFixed(1) : params.value;
        return `<div style="padding:4px 2px">
            <div style="font-weight:700;color:#e2e8ff;margin-bottom:4px">${params.name}</div>
            <div style="color:${change >= 0 ? "#10d98e" : "#f43f5e"};font-size:14px;font-weight:700">${sign}${change.toFixed(2)}%</div>
            <div style="color:#4a5880;font-size:10px;margin-top:2px">Wt: ${val}%</div>
          </div>`;
      },
    },
    series: [
      {
        type: "treemap",
        data: treemapData,
        width: "100%",
        height: "100%",
        roam: false,
        nodeClick: false,
        breadcrumb: { show: false },
        label: {
          show: true,
          fontFamily: "Space Mono, monospace",
          color: "rgba(255,255,255,0.9)",
          fontWeight: "bold",
          fontSize: 11,
          lineHeight: 16,
        },
        upperLabel: {
          show: true,
          height: 28,
          fontFamily: "Space Grotesk, system-ui",
          fontSize: 12,
          fontWeight: 700,
          color: "#ffffff",
          backgroundColor: "rgba(0,0,0,0.4)",
          padding: [4, 8],
        },
        itemStyle: {
          gapWidth: 3,
          borderRadius: 3,
        },
        levels: [
          {
            itemStyle: { gapWidth: 4, borderWidth: 2, borderRadius: 4 },
            upperLabel: { show: true },
          },
          {
            itemStyle: { gapWidth: 2, borderWidth: 1, borderRadius: 2 },
            label: { show: true },
          },
        ],
      },
    ],
  };

  return (
    <SciFiCard glow="cyan" cornerAccent>
      <CardHeader
        title="S&P 500 Market Heatmap"
        subtitle="Live sector performance by market cap weight"
        action={
          <div className="flex items-center gap-3 text-xs" style={{ fontFamily: "var(--font-space-mono), monospace" }}>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ background: "#00a855" }} />
              <span style={{ color: "var(--color-text-muted)" }}>Positive</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ background: "#b51f1f" }} />
              <span style={{ color: "var(--color-text-muted)" }}>Negative</span>
            </div>
          </div>
        }
      />
      <div className="p-3">
        <ReactECharts
          option={option}
          style={{ height: 480 }}
          opts={{ renderer: "canvas" }}
          notMerge
        />
      </div>

      {/* Sector legend strip */}
      <div className="px-4 pb-4 flex flex-wrap gap-2">
        {HEATMAP_DATA.map((s) => {
          const pos = s.change >= 0;
          return (
            <div
              key={s.name}
              className="flex items-center gap-1.5 px-2 py-1 rounded text-xs"
              style={{
                background: pos ? "rgba(16,217,142,0.08)" : "rgba(244,63,94,0.08)",
                border: `1px solid ${pos ? "rgba(16,217,142,0.15)" : "rgba(244,63,94,0.15)"}`,
              }}
            >
              <span style={{ color: "var(--color-text-secondary)" }}>{s.name}</span>
              <span
                className="font-semibold"
                style={{
                  color: pos ? "#10d98e" : "#f43f5e",
                  fontFamily: "var(--font-space-mono), monospace",
                }}
              >
                {pos ? "+" : ""}{s.change.toFixed(2)}%
              </span>
            </div>
          );
        })}
      </div>
    </SciFiCard>
  );
}
