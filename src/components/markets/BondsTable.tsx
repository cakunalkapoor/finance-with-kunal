"use client";

import dynamic from "next/dynamic";
import { BOND_YIELDS } from "@/lib/mock-data";
import { formatChange, getChangeColor } from "@/lib/utils";
import SciFiCard, { CardHeader } from "@/components/ui/SciFiCard";
import type { EChartsOption } from "echarts";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });

function YieldTrendChart({ data, positive }: { data: number[]; positive: boolean }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const option: EChartsOption = {
    animation: false,
    grid: { top: 2, bottom: 2, left: 2, right: 2 },
    xAxis: { type: "category", show: false, data: data.map((_, i) => i) },
    yAxis: { type: "value", show: false, min: min - 0.05, max: max + 0.05 },
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
      },
    ],
  };
  return (
    <ReactECharts option={option} style={{ height: 32, width: 80 }} opts={{ renderer: "svg" }} />
  );
}

export default function BondsTable() {
  return (
    <SciFiCard>
      <CardHeader
        title="Government Bond Yields"
        subtitle="10-Year Benchmark Rates"
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
              {["Country", "Yield", "1D", "1M", "1Y", "Trend"].map((h) => (
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
            {BOND_YIELDS.map((bond, i) => (
              <tr
                key={bond.country}
                style={{
                  borderBottom:
                    i < BOND_YIELDS.length - 1
                      ? "1px solid rgba(26,39,68,0.6)"
                      : "none",
                }}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{bond.flag}</span>
                    <div>
                      <div style={{ color: "var(--color-text-primary)", fontWeight: 600 }}>
                        {bond.country}
                      </div>
                      <div
                        style={{
                          color: "var(--color-text-muted)",
                          fontFamily: "var(--font-space-mono), monospace",
                          fontSize: "10px",
                        }}
                      >
                        {bond.maturity} Treasury
                      </div>
                    </div>
                  </div>
                </td>

                <td className="px-4 py-3">
                  <span
                    className="font-bold"
                    style={{
                      fontFamily: "var(--font-space-mono), monospace",
                      color: "var(--color-neon-cyan)",
                      fontSize: "13px",
                    }}
                  >
                    {bond.yield.toFixed(2)}%
                  </span>
                </td>

                {[bond.dailyMove, bond.oneMonthMove, bond.oneYearMove].map((v, idx) => (
                  <td key={idx} className="px-4 py-3">
                    <span
                      className={getChangeColor(v, false)}
                      style={{ fontFamily: "var(--font-space-mono), monospace" }}
                    >
                      {v >= 0 ? "+" : ""}{v.toFixed(2)}%
                    </span>
                  </td>
                ))}

                <td className="px-4 py-3">
                  <YieldTrendChart
                    data={bond.trend}
                    positive={bond.oneYearMove < 0}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SciFiCard>
  );
}
