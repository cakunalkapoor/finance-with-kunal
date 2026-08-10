"use client";

import dynamic from "next/dynamic";
import { ArrowUpRight } from "lucide-react";
import { BOND_YIELDS, DATA_UPDATED_AT } from "@/lib/site-data";
import { INVESTING_BOND_URL } from "@/lib/external-links";
import { getChangeColor, FONT_MONO } from "@/lib/utils";
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
          color: positive ? "#34d399" : "#fb7185",
        },
      },
    ],
  };
  return (
    <ReactECharts option={option} style={{ height: 32, width: 80 }} opts={{ renderer: "svg" }} />
  );
}

// The UK, India and South Korea have no free daily yield feed and sit on FRED's
// monthly OECD series, which can lag by 1-3 months. Rather than let a stale
// number pass as current, every row shows the observation date, and anything
// older than a normal monthly publication cycle is called out.
const STALE_AFTER_DAYS = 45;
const REFRESHED_AT = new Date(DATA_UPDATED_AT).getTime();

function asOfAgeDays(asOf: string): number {
  const t = Date.parse(`${asOf}T00:00:00Z`);
  if (!Number.isFinite(t) || !Number.isFinite(REFRESHED_AT)) return 0;
  return Math.max(0, Math.round((REFRESHED_AT - t) / 86_400_000));
}

function formatAsOf(asOf: string): string {
  const [y, m, d] = asOf.split("-").map(Number);
  if (!y || !m || !d) return asOf;
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default function BondsTable() {
  return (
    <SciFiCard>
      <CardHeader
        title="Government Bond Yields"
        subtitle="10-Year Benchmark Rates · each row shows its observation date; ⚠ marks a monthly series still awaiting its next print · click a country for the full curve on Investing.com"
      />
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr
              style={{
                background: "rgba(167,139,250,0.04)",
                borderBottom: "1px solid var(--color-space-border)",
              }}
            >
              {["Country", "Yield", "1D", "1M", "1Y", "Trend"].map((h) => (
                <th
                  key={h}
                  className="px-4 py-2.5 text-left font-semibold tracking-widest uppercase"
                  style={{
                    color: "var(--color-text-muted)",
                    fontFamily: FONT_MONO,
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
                      ? "1px solid rgba(44,38,72,0.7)"
                      : "none",
                }}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{bond.flag}</span>
                    <div>
                      <a
                        href={INVESTING_BOND_URL[bond.country]}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={`${bond.country} ${bond.maturity} bond yield on Investing.com`}
                        className="group inline-flex items-center gap-1 font-semibold text-[var(--color-text-primary)] transition-colors hover:text-[var(--color-neon-cyan)]"
                      >
                        <span className="underline-offset-2 group-hover:underline">{bond.country}</span>
                        <ArrowUpRight
                          size={11}
                          strokeWidth={2.5}
                          className="opacity-35 transition-opacity group-hover:opacity-100"
                          aria-hidden
                        />
                      </a>
                      <div
                        style={{
                          color: "var(--color-text-muted)",
                          fontFamily: FONT_MONO,
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
                      fontFamily: FONT_MONO,
                      color: "var(--color-neon-cyan)",
                      fontSize: "13px",
                    }}
                  >
                    {bond.yield.toFixed(2)}%
                  </span>
                  {(() => {
                    const age = asOfAgeDays(bond.asOf);
                    const stale = age > STALE_AFTER_DAYS;
                    return (
                      <div
                        title={`${bond.source} · ${bond.cadence} series · observed ${formatAsOf(bond.asOf)}`}
                        style={{
                          color: stale ? "#d97706" : "var(--color-text-muted)",
                          fontFamily: FONT_MONO,
                          fontSize: "10px",
                          marginTop: "2px",
                        }}
                      >
                        {stale ? "⚠ " : ""}{formatAsOf(bond.asOf)}
                      </div>
                    );
                  })()}
                </td>

                {[bond.dailyMove, bond.oneMonthMove, bond.oneYearMove].map((v, idx) => (
                  <td key={idx} className="px-4 py-3">
                    <span
                      className={getChangeColor(v, false)}
                      style={{ fontFamily: FONT_MONO }}
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
