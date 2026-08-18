"use client";

import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { EQUITY_INDICES } from "@/lib/site-data";
import { INVESTING_INDEX_URL } from "@/lib/external-links";
import { formatNumber, formatChange, getChangeColor, FONT_MONO } from "@/lib/utils";
import {
  labelsFor,
  seriesFor,
  viewsFor,
  windowLabel,
  type ChartView,
} from "@/lib/chart-window";
import SciFiCard, { CardHeader } from "@/components/ui/SciFiCard";
import TrendSparkline from "@/components/markets/TrendSparkline";
import { ChangeStack } from "@/components/markets/StatStack";

// P/E cell — shows current P/E and % variance from 10-year average.
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

  /* One tab strip serves every row, so 1W is offered only when EVERY row can
     draw it — otherwise switching to it would blank the rows that came back
     without a daily series. */
  const views = viewsFor(
    EQUITY_INDICES.every((r) => (r.daily?.length ?? 0) >= 2)
  );
  /* The span named in the header. For 1W these are one row's real sessions:
     exchanges keep different calendars, so a Tokyo row's six sessions can end a
     day either side of New York's. Each row's own tooltip carries its own
     dates; this is the same order of approximation the weekly labels already
     make, and it is stated to the day rather than the month. */
  const headerDays = EQUITY_INDICES[0]?.dailyDates;

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
              dropped: periods in "Change" and the 52W range under the price.

              There is no valuation column. Index P/E lived here until an audit
              found the figures had never been sourced — they arrived with the
              original mock dataset and no fetcher ever wrote them. Yahoo
              supplies no P/E for an index (verified across all twelve symbols:
              trailingPE, forwardPE, priceToBook and trailingEps all come back
              empty), so there is nothing to wire up. Don't reinstate the column
              without a provider that actually publishes index multiples. */}
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
                <div>Volatility</div>
                <div style={{ fontSize: "9px", letterSpacing: "0.05em", opacity: 0.7, marginTop: "1px" }}>30d realized</div>
              </th>

              {/* Chart column with the shared 1W / 3M / 6M / YTD / 2Y / 3Y toggle */}
              <th className="px-4 py-2.5 text-left" style={TH_STYLE}>
                <div className="flex items-center gap-1">
                  {views.map((v) => (
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
                  {windowLabel(chartView, 156, headerDays)}
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

                  {/* Trailing 30-day realized volatility, computed from daily
                      closes in fetch-yahoo.py. Index P/E used to sit above it,
                      but those figures were never sourced — see the header. */}
                  <td className="px-4 py-3">
                    <VolCell value={idx.realizedVol} />
                  </td>

                  {/* Chart */}
                  <td className="px-4 py-3">
                    {(() => {
                      const slice = seriesFor(chartView, idx.sparkline, idx.daily);
                      return (
                        <TrendSparkline
                          values={slice}
                          labels={labelsFor(chartView, slice.length, idx.dailyDates)}
                          ariaLabel={`${idx.name} price, ${windowLabel(chartView, 156, idx.dailyDates)}`}
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
