"use client";

import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { EQUITY_INDICES } from "@/lib/site-data";
import { INVESTING_INDEX_URL } from "@/lib/external-links";
import { formatNumber, formatChange, getChangeColor, FONT_MONO } from "@/lib/utils";
import {
  CHART_VIEWS,
  pointLabel,
  sliceFor,
  windowLabel,
  type ChartView,
} from "@/lib/chart-window";
import SciFiCard, { CardHeader } from "@/components/ui/SciFiCard";
import TrendSparkline from "@/components/markets/TrendSparkline";
import { ChangeStack } from "@/components/markets/StatStack";

// P/E cell — shows current P/E and % variance from 10-year average.
//
// Index P/E is hand-curated (no fetcher supplies it), so a newly added index
// has none until someone sources it. Render an explicit dash rather than
// substituting a plausible-looking number — this is a valuation figure on a
// finance site, and a wrong one is worse than a visibly absent one.
function PECell({ pe, pe10yAvg }: { pe?: number; pe10yAvg?: number }) {
  if (pe == null || pe10yAvg == null) {
    return (
      <span
        style={{ fontFamily: FONT_MONO, color: "var(--color-text-muted)", fontSize: "12px" }}
        title="Index P/E not yet sourced for this index"
      >
        —
      </span>
    );
  }
  const variancePct = Math.round(((pe - pe10yAvg) / pe10yAvg) * 100);
  const isAbove = variancePct > 0;

  // Colour scale: >20% premium → red; 0–20% → amber; at/below avg → green
  let varColor: string;
  let varBg: string;
  if (isAbove && variancePct > 20) {
    varColor = "#e11d48";
    varBg   = "rgba(225,29,72,0.10)";
  } else if (isAbove) {
    varColor = "#d97706";
    varBg   = "rgba(217,119,6,0.10)";
  } else {
    varColor = "#059669";
    varBg   = "rgba(5,150,105,0.10)";
  }

  return (
    <div className="flex w-full min-w-0 flex-col gap-0.5">
      <div className="font-bold" style={{ fontFamily: FONT_MONO, color: "var(--color-text-primary)", fontSize: "12px" }}>
        {pe.toFixed(1)}x
      </div>
      <div className="flex items-center gap-1">
        <span
          className="px-1.5 py-0.5 rounded font-semibold"
          style={{ background: varBg, color: varColor, fontFamily: FONT_MONO, fontSize: "10px" }}
        >
          {isAbove ? "+" : ""}{variancePct}%
        </span>
        <span style={{ color: "var(--color-text-muted)", fontFamily: FONT_MONO, fontSize: "10px" }}>
          vs 10Y
        </span>
      </div>
    </div>
  );
}

// Trailing 30-day annualized realized-volatility cell, color-coded by level:
//   < 15 green (calm), 15–25 yellow (elevated), > 25 red (high vol).
// Computed from each index's daily log-returns (see fetch-yahoo.py::derive).
function VolCell({ value }: { value?: number }) {
  if (value == null) {
    return (
      <span style={{ color: "var(--color-text-muted)", fontFamily: FONT_MONO }}>—</span>
    );
  }
  const color = value < 15 ? "#34d399" : value < 25 ? "#f59e0b" : "#fb7185";
  const bg =
    value < 15
      ? "rgba(52,211,153,0.11)"
      : value < 25
      ? "rgba(245,158,11,0.13)"
      : "rgba(251,113,133,0.13)";
  return (
    <span
      className="px-2 py-0.5 rounded text-xs font-semibold"
      style={{ background: bg, color, fontFamily: FONT_MONO }}
    >
      {value.toFixed(1)}%
    </span>
  );
}

// Mini horizontal range bar showing where current price sits in 52W range
function RangeBar({ value, low, high }: { value: number; low: number; high: number }) {
  const pct = Math.round(((value - low) / (high - low)) * 100);
  const fmt = (n: number) => formatNumber(n, n > 10000 ? 0 : 2);

  return (
    <div className="flex w-full min-w-0 flex-col gap-1">
      {/* High */}
      <div
        className="font-semibold"
        style={{
          fontFamily: FONT_MONO,
          fontSize: "10px",
          color: "var(--color-market-up)",
        }}
      >
        H: {fmt(high)}
      </div>

      {/* Range bar */}
      <div
        className="relative h-1 rounded-full overflow-visible"
        style={{ background: "var(--color-space-border)" }}
      >
        {/* Filled portion */}
        <div
          className="absolute top-0 left-0 h-full rounded-full"
          style={{
            width: `${pct}%`,
            background: "linear-gradient(90deg, rgba(167,139,250,0.4), rgba(167,139,250,0.8))",
          }}
        />
        {/* Current price marker */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full"
          style={{
            left: `calc(${pct}% - 3px)`,
            background: "var(--color-neon-cyan)",
            boxShadow: "0 0 4px var(--color-neon-cyan)",
          }}
        />
      </div>

      {/* Low */}
      <div
        className="font-semibold"
        style={{
          fontFamily: FONT_MONO,
          fontSize: "10px",
          color: "var(--color-market-down)",
        }}
      >
        L: {fmt(low)}
      </div>
    </div>
  );
}

const TH_STYLE = {
  color: "var(--color-text-muted)",
  fontFamily: FONT_MONO,
  fontSize: "10px",
  letterSpacing: "0.1em",
};

export default function EquityMarketsTable() {
  const [chartView, setChartView] = useState<ChartView>("YTD");

  return (
    <SciFiCard glow="cyan" cornerAccent>
      <CardHeader
        title="Global Equity Markets"
        // Counted from the data, not written out — the hardcoded "11" went
        // stale the moment an index was added.
        subtitle={`${EQUITY_INDICES.length} Major Indices · 30d realized volatility · click an index for full detail on Investing.com`}
      />
      <div className="overflow-x-auto">
        <table className="w-full text-xs" style={{ tableLayout: "fixed", minWidth: 560 }}>
          {/* Sized to sit two-up with the ETF table. Nine columns don't fit a
              half-width card, so related metrics share a cell instead of being
              dropped: periods in "Change", P/E + vol in "Valuation", and the
              52W range under the price. */}
          <colgroup>
            <col style={{ width: "21%" }} />
            <col style={{ width: "21%" }} />
            <col style={{ width: "15%" }} />
            <col style={{ width: "16%" }} />
            <col style={{ width: "27%" }} />
          </colgroup>
          <thead>
            <tr
              style={{
                background: "rgba(167,139,250,0.04)",
                borderBottom: "1px solid var(--color-space-border)",
              }}
            >
              <th className="px-4 py-2.5 text-left font-semibold tracking-widest uppercase" style={TH_STYLE}>Index</th>
              <th className="px-4 py-2.5 text-left font-semibold tracking-widest uppercase" style={TH_STYLE}>
                <div>Last</div>
                <div style={{ fontSize: "9px", letterSpacing: "0.05em", opacity: 0.7, marginTop: "1px" }}>52W range</div>
              </th>
              <th className="px-4 py-2.5 text-left font-semibold tracking-widest uppercase" style={TH_STYLE}>Change</th>
              <th className="px-4 py-2.5 text-left font-semibold tracking-widest uppercase" style={TH_STYLE}>
                <div>Valuation</div>
                <div style={{ fontSize: "9px", letterSpacing: "0.05em", opacity: 0.7, marginTop: "1px" }}>P/E vs 10Y · 30d vol</div>
              </th>

              {/* Chart column with the shared 3M / 6M / YTD / 2Y / 3Y toggle */}
              <th className="px-4 py-2.5 text-left" style={TH_STYLE}>
                <div className="flex items-center gap-1">
                  {CHART_VIEWS.map((v) => (
                    <button
                      key={v}
                      onClick={() => setChartView(v)}
                      className="px-1.5 py-0.5 rounded transition-all"
                      style={{
                        fontFamily: FONT_MONO,
                        fontSize: "10px",
                        letterSpacing: "0.08em",
                        fontWeight: chartView === v ? 700 : 500,
                        color: chartView === v ? "var(--color-neon-cyan)" : "var(--color-text-muted)",
                        background: chartView === v ? "rgba(167,139,250,0.12)" : "transparent",
                        border: chartView === v ? "1px solid rgba(167,139,250,0.3)" : "1px solid transparent",
                      }}
                    >
                      {v}
                    </button>
                  ))}
                </div>
                {/* Every row shares one window, so name the span once here. */}
                <div
                  style={{
                    fontSize: "9px",
                    letterSpacing: "0.05em",
                    opacity: 0.7,
                    marginTop: "3px",
                    textTransform: "none",
                  }}
                >
                  {windowLabel(chartView)}
                </div>
              </th>
            </tr>
          </thead>

          <tbody>
            {EQUITY_INDICES.map((idx, i) => {
              return (
                <tr
                  key={idx.symbol}
                  style={{
                    borderBottom: i < EQUITY_INDICES.length - 1
                      ? "1px solid rgba(44,38,72,0.7)"
                      : "none",
                  }}
                >
                  {/* Name — opens the index page on Investing.com */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{idx.flag}</span>
                      <div>
                        <a
                          href={INVESTING_INDEX_URL[idx.symbol]}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={`${idx.name} on Investing.com`}
                          className="group inline-flex items-center gap-1 font-semibold text-[var(--color-text-primary)] transition-colors hover:text-[var(--color-neon-cyan)]"
                        >
                          <span className="underline-offset-2 group-hover:underline">{idx.name}</span>
                          <ArrowUpRight
                            size={11}
                            strokeWidth={2.5}
                            className="opacity-35 transition-opacity group-hover:opacity-100"
                            aria-hidden
                          />
                        </a>
                        <div style={{ color: "var(--color-text-muted)", fontFamily: FONT_MONO, fontSize: "10px" }}>
                          {idx.region}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Last, with the 52W range bar tucked underneath */}
                  <td className="px-4 py-3">
                    <div className="font-bold" style={{ fontFamily: FONT_MONO, color: "var(--color-text-primary)" }}>
                      {formatNumber(idx.value, idx.value > 10000 ? 0 : 2)}
                    </div>
                    <div className={getChangeColor(idx.dailyChange)} style={{ fontSize: "10px", fontFamily: FONT_MONO }}>
                      {formatChange(idx.dailyChange)} today
                    </div>
                    <div className="mt-1.5">
                      <RangeBar value={idx.value} low={idx.low52w} high={idx.high52w} />
                    </div>
                  </td>

                  {/* 1W / 1M / YTD, grouped */}
                  <td className="px-4 py-3">
                    <ChangeStack
                      items={[
                        { label: "1W", value: idx.weekChange },
                        { label: "1M", value: idx.monthChange },
                        { label: "YTD", value: idx.ytdChange },
                      ]}
                    />
                  </td>

                  {/* Valuation: P/E against its 10Y average, plus realized vol */}
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1.5">
                      <PECell pe={idx.pe} pe10yAvg={idx.pe10yAvg} />
                      <VolCell value={idx.realizedVol} />
                    </div>
                  </td>

                  {/* Chart */}
                  <td className="px-4 py-3">
                    {(() => {
                      const slice = sliceFor(chartView, idx.sparkline);
                      return (
                        <TrendSparkline
                          values={slice}
                          labels={slice.map((_, j) => pointLabel(j, slice.length))}
                          ariaLabel={`${idx.name} price, ${windowLabel(chartView)}`}
                          format={(n) => formatNumber(n, 2)}
                        />
                      );
                    })()}
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
