"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { HEATMAP_INDICES } from "@/lib/site-data";
import { getCompanyName } from "@/lib/ticker-names";
import { FONT_MONO } from "@/lib/utils";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

// Softer emerald greens — easier on the eye
function getHeatColor(change: number): string {
  if (change > 3)   return "#065f46"; // emerald-900
  if (change > 1.5) return "#059669"; // emerald-600
  if (change > 0.5) return "#10b981"; // emerald-500
  if (change > 0)   return "#34d399"; // emerald-400
  if (change > -0.5) return "#f87171"; // red-400
  if (change > -1.5) return "#ef4444"; // red-500
  if (change > -3)   return "#dc2626"; // red-600
  return "#991b1b";                    // red-800
}

function getBorderColor(change: number): string {
  if (change > 0) return "rgba(52, 211, 153, 0.28)";  // emerald
  return "rgba(251, 113, 133, 0.28)";                  // rose
}

import SciFiCard, { CardHeader } from "@/components/ui/SciFiCard";

export default function MarketHeatmap() {
  const [activeId, setActiveId] = useState(HEATMAP_INDICES[0].id);
  // Force a repaint once web fonts finish loading — canvas labels can render
  // blank if the custom font isn't ready at first paint.
  const [fontReady, setFontReady] = useState(false);
  useEffect(() => {
    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
    if (fonts?.ready) {
      fonts.ready.then(() => setFontReady(true));
    } else {
      setFontReady(true);
    }
  }, []);

  const activeIndex =
    HEATMAP_INDICES.find((i) => i.id === activeId) ?? HEATMAP_INDICES[0];
  const sectors = activeIndex.sectors;

  const treemapData = sectors.map((sector) => ({
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
      backgroundColor: "rgba(255,255,255,0.98)",
      borderColor: "rgba(124,58,237,0.30)",
      borderWidth: 1,
      extraCssText: "box-shadow: 0 8px 24px rgba(30,27,58,0.12); border-radius: 6px;",
      textStyle: {
        color: "#1e1b3a",
        fontFamily: "Space Mono, monospace",
        fontSize: 12,
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      formatter: (params: any) => {
        const sector = sectors.find(
          (s) => s.name === params.name || s.children?.some((c) => c.ticker === params.name)
        );
        const stock = sector?.children?.find((c) => c.ticker === params.name);
        const change = stock ? stock.change : (sector?.change ?? 0);
        const sign = change >= 0 ? "+" : "";
        const val = typeof params.value === "number" ? params.value.toFixed(1) : params.value;
        // For stock tiles, show ticker + company name. For sector tiles, just the name.
        const companyName = stock ? getCompanyName(params.name) : null;
        const headerHtml = companyName
          ? `<div style="font-weight:700;color:#1e1b3a;font-size:13px">${params.name}</div>
             <div style="color:#524b7a;font-size:11px;margin-bottom:4px">${companyName}</div>`
          : `<div style="font-weight:700;color:#1e1b3a;margin-bottom:4px">${params.name}</div>`;
        return `<div style="padding:4px 2px;min-width:160px">
            ${headerHtml}
            <div style="display:flex;align-items:baseline;gap:6px">
              <span style="color:${change >= 0 ? "#059669" : "#e11d48"};font-size:15px;font-weight:700">${sign}${change.toFixed(2)}%</span>
              <span style="color:#9590b8;font-size:10px;font-weight:600;letter-spacing:0.04em">1W</span>
            </div>
            <div style="color:#9590b8;font-size:10px;margin-top:2px">Index weight: ${val}%</div>
          </div>`;
      },
    },
    series: [
      {
        type: "treemap",
        data: treemapData,
        // Pin to all four edges — zero internal margin
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        width: "100%",
        height: "100%",
        roam: false,
        nodeClick: false,
        breadcrumb: { show: false },
        // Hide tiles too small to read (< 400 sq-px); they still appear in tooltip / legend
        visibleMin: 400,
        label: {
          show: true,
          fontFamily: "Space Mono, monospace",
          color: "rgba(255,255,255,0.95)",
          fontWeight: "bold",
          fontSize: 10,
          lineHeight: 13,
        },
        upperLabel: {
          show: true,
          height: 24,
          fontFamily: "Space Grotesk, system-ui",
          fontSize: 11,
          fontWeight: 700,
          color: "#ffffff",
          backgroundColor: "rgba(0,0,0,0.35)",
          padding: [3, 8],
        },
        itemStyle: {
          gapWidth: 2,
          borderRadius: 2,
        },
        levels: [
          {
            itemStyle: { gapWidth: 3, borderWidth: 1, borderRadius: 3 },
            upperLabel: { show: true },
          },
          {
            itemStyle: { gapWidth: 1, borderWidth: 1, borderRadius: 1 },
            label: { show: true },
          },
        ],
      },
    ],
  };

  const stockCount = sectors.reduce((s, sec) => s + (sec.children?.length ?? 0), 0);

  return (
    <SciFiCard glow="cyan" cornerAccent>
      <CardHeader
        title="Market Heatmap"
        subtitle={activeIndex.description}
        action={
          <div className="flex items-center gap-3 text-xs" style={{ fontFamily: FONT_MONO }}>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ background: "#059669" }} />
              <span style={{ color: "var(--color-text-muted)" }}>Positive</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm" style={{ background: "#ef4444" }} />
              <span style={{ color: "var(--color-text-muted)" }}>Negative</span>
            </div>
          </div>
        }
      />

      {/* Index selector */}
      <div className="px-4 sm:px-5 pb-1 flex items-center gap-2 flex-wrap">
        {HEATMAP_INDICES.map((idx) => {
          const active = idx.id === activeId;
          return (
            <button
              key={idx.id}
              onClick={() => setActiveId(idx.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{
                fontFamily: FONT_MONO,
                color: active ? "var(--color-neon-cyan)" : "var(--color-text-secondary)",
                background: active ? "rgba(167,139,250,0.12)" : "rgba(124,58,237,0.025)",
                border: active
                  ? "1px solid rgba(167,139,250,0.4)"
                  : "1px solid var(--color-space-border)",
                letterSpacing: "0.04em",
              }}
            >
              <span className="text-sm">{idx.flag}</span>
              {idx.name}
            </button>
          );
        })}
        <span
          className="ml-auto text-xs hidden sm:block"
          style={{
            color: "var(--color-text-muted)",
            fontFamily: FONT_MONO,
          }}
        >
          {stockCount} constituents · {sectors.length} sectors
        </span>
      </div>

      <div className="overflow-hidden rounded-b-none" style={{ margin: "0 12px" }}>
        <ReactECharts
          key={`${activeId}-${fontReady}`}
          option={option}
          style={{ height: 580 }}
          opts={{ renderer: "svg" }}
          notMerge
        />
      </div>

      {/* Sector legend */}
      <div className="px-4 pb-4 flex flex-wrap gap-2">
        {sectors.map((s) => {
          const pos = s.change >= 0;
          return (
            <div
              key={s.name}
              className="flex items-center gap-1.5 px-2 py-1 rounded text-xs"
              style={{
                background: pos ? "rgba(52,211,153,0.07)" : "rgba(251,113,133,0.07)",
                border: `1px solid ${pos ? "rgba(52,211,153,0.18)" : "rgba(251,113,133,0.18)"}`,
              }}
            >
              <span style={{ color: "var(--color-text-secondary)" }}>{s.name}</span>
              <span
                className="font-semibold"
                style={{
                  color: pos ? "#34d399" : "#fb7185",
                  fontFamily: FONT_MONO,
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
