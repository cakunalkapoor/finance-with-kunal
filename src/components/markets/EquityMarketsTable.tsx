"use client";

import dynamic from "next/dynamic";
import { EQUITY_INDICES } from "@/lib/mock-data";
import { formatNumber, formatChange, getChangeColor } from "@/lib/utils";
import SciFiCard, { CardHeader } from "@/components/ui/SciFiCard";
import type { EChartsOption } from "echarts";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

function SparklineChart({ data, positive }: { data: number[]; positive: boolean }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const option: EChartsOption = {
    animation: false,
    grid: { top: 2, bottom: 2, left: 2, right: 2 },
    xAxis: { type: "category", show: false, data: data.map((_, i) => i) },
    yAxis: { type: "value", show: false, min: min * 0.998, max: max * 1.002 },
    series: [
      {
        type: "line",
        data,
        smooth: true,
        symbol: "none",
        lineStyle: {
          width: 1.5,
          color: positive ? "#10d98e" : "#f43f5e",
        },
        areaStyle: {
          color: {
            type: "linear",
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: positive ? "rgba(16,217,142,0.15)" : "rgba(244,63,94,0.15)" },
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
      style={{ height: 36, width: 80 }}
      opts={{ renderer: "svg" }}
    />
  );
}

export default function EquityMarketsTable() {
  return (
    <SciFiCard glow="cyan" cornerAccent>
      <CardHeader
        title="Global Equity Markets"
        subtitle="Top 10 Major Indices"
      />
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr
              style={{
                background: "rgba(0,212,255,0.04)",
                borderBottom: "1px solid var(--color-space-border)",
              }}
            >
              {["Index", "Last", "1W", "1M", "YTD", "12W Chart"].map((h) => (
                <th
                  key={h}
                  className="px-4 py-2.5 text-left font-semibold tracking-widest uppercase"
                  style={{
                    color: "var(--color-text-muted)",
                    fontFamily: "var(--font-space-mono), monospace",
                    fontSize: "10px",
                    letterSpacing: "0.1em",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {EQUITY_INDICES.map((idx, i) => {
              const weekPos = idx.weekChange >= 0;
              const ytdPos = idx.ytdChange >= 0;
              return (
                <tr
                  key={idx.symbol}
                  style={{
                    borderBottom: i < EQUITY_INDICES.length - 1
                      ? "1px solid rgba(26,39,68,0.6)"
                      : "none",
                  }}
                >
                  {/* Index name */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{idx.flag}</span>
                      <div>
                        <div
                          className="font-semibold"
                          style={{ color: "var(--color-text-primary)" }}
                        >
                          {idx.name}
                        </div>
                        <div
                          style={{
                            color: "var(--color-text-muted)",
                            fontFamily: "var(--font-space-mono), monospace",
                            fontSize: "10px",
                          }}
                        >
                          {idx.region}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Last price */}
                  <td className="px-4 py-3">
                    <div
                      className="font-bold font-data"
                      style={{
                        color: "var(--color-text-primary)",
                        fontFamily: "var(--font-space-mono), monospace",
                      }}
                    >
                      {formatNumber(idx.value, idx.value > 10000 ? 0 : 2)}
                    </div>
                    <div
                      className={getChangeColor(idx.dailyChange)}
                      style={{ fontSize: "10px", fontFamily: "var(--font-space-mono), monospace" }}
                    >
                      {formatChange(idx.dailyChange)}
                    </div>
                  </td>

                  {/* Week */}
                  <td className="px-4 py-3">
                    <span
                      className={`font-data px-2 py-0.5 rounded text-xs font-semibold ${getChangeColor(idx.weekChange)}`}
                      style={{
                        background: weekPos
                          ? "rgba(16,217,142,0.12)"
                          : "rgba(244,63,94,0.12)",
                        fontFamily: "var(--font-space-mono), monospace",
                      }}
                    >
                      {formatChange(idx.weekChange)}
                    </span>
                  </td>

                  {/* Month */}
                  <td className="px-4 py-3">
                    <span
                      className={`font-data ${getChangeColor(idx.monthChange)}`}
                      style={{ fontFamily: "var(--font-space-mono), monospace" }}
                    >
                      {formatChange(idx.monthChange)}
                    </span>
                  </td>

                  {/* YTD */}
                  <td className="px-4 py-3">
                    <span
                      className={`font-data px-2 py-0.5 rounded text-xs font-semibold ${getChangeColor(idx.ytdChange)}`}
                      style={{
                        background: ytdPos
                          ? "rgba(16,217,142,0.12)"
                          : "rgba(244,63,94,0.12)",
                        fontFamily: "var(--font-space-mono), monospace",
                      }}
                    >
                      {formatChange(idx.ytdChange)}
                    </span>
                  </td>

                  {/* Sparkline */}
                  <td className="px-4 py-3">
                    <SparklineChart data={idx.sparkline} positive={weekPos} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </SciFiCard>
  );
}
