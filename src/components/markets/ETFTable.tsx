"use client";

import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { ETFS } from "@/lib/site-data";
import { yahooEtfUrl } from "@/lib/external-links";
import { formatChange, getChangeColor, FONT_MONO } from "@/lib/utils";
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
import type { CSSProperties } from "react";
import type { ETF } from "@/types";

const TH_STYLE: CSSProperties = {
  color: "var(--color-text-muted)",
  fontFamily: FONT_MONO,
  fontSize: "10px",
  letterSpacing: "0.1em",
};

/* Grouped by where the fund is listed, then ordered by exposure inside each
   group — never by return, since a ranked fund list reads as a recommendation. */
const GROUPS: { listing: ETF["listing"]; label: string; flag: string }[] = [
  { listing: "Canada", label: "Listed in Canada", flag: "🇨🇦" },
  { listing: "United States", label: "Listed in the US", flag: "🇺🇸" },
];

const COLUMN_COUNT = 4;

export default function ETFTable() {
  const [chartView, setChartView] = useState<ChartView>("YTD");

  return (
    <SciFiCard glow="cyan" cornerAccent>
      <CardHeader
        title="ETFs"
        subtitle="16 funds · grouped by exposure, not ranked · hover a chart for the value at that point · click a ticker for the full quote on Yahoo Finance"
      />
      <div className="overflow-x-auto">
        <table className="w-full text-xs" style={{ tableLayout: "fixed", minWidth: 500 }}>
          {/* Sized to sit two-up with the equity table. Exposure moves into the
              fund cell and the three periods share one cell, so a half-width
              card fits without losing anything. */}
          <colgroup>
            <col style={{ width: "34%" }} />
            <col style={{ width: "19%" }} />
            <col style={{ width: "17%" }} />
            <col style={{ width: "30%" }} />
          </colgroup>
          <thead>
            <tr
              style={{
                background: "rgba(167,139,250,0.04)",
                borderBottom: "1px solid var(--color-space-border)",
              }}
            >
              {["Fund", "Last", "Change"].map((h) => (
                <th
                  key={h}
                  className="px-4 py-2.5 text-left font-semibold tracking-widest uppercase whitespace-nowrap"
                  style={TH_STYLE}
                >
                  {h}
                </th>
              ))}

              {/* Chart column with the YTD / 52W / 3Y toggle */}
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
                        border:
                          chartView === v
                            ? "1px solid rgba(167,139,250,0.3)"
                            : "1px solid transparent",
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
            {GROUPS.map(({ listing, label, flag }) => {
              const rows = ETFS.filter((e) => e.listing === listing);
              if (rows.length === 0) return null;

              return [
                <tr key={label} style={{ background: "rgba(167,139,250,0.02)" }}>
                  <td
                    colSpan={COLUMN_COUNT}
                    className="px-4 py-2 font-semibold uppercase"
                    style={{
                      ...TH_STYLE,
                      color: "var(--color-text-secondary)",
                      borderTop: "1px solid var(--color-space-border)",
                      borderBottom: "1px solid var(--color-space-border)",
                    }}
                  >
                    {flag} {label}
                  </td>
                </tr>,

                ...rows.map((etf, i) => (
                  <tr
                    key={etf.symbol}
                    style={{
                      borderBottom:
                        i < rows.length - 1 ? "1px solid rgba(44,38,72,0.7)" : "none",
                    }}
                  >
                    {/* Ticker — opens the quote on Yahoo, which is also the price source */}
                    <td className="px-4 py-3">
                      <a
                        href={yahooEtfUrl(etf.symbol)}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={`${etf.ticker} on Yahoo Finance`}
                        className="group inline-flex items-center gap-1 font-semibold text-[var(--color-text-primary)] transition-colors hover:text-[var(--color-neon-cyan)]"
                      >
                        <span
                          className="underline-offset-2 group-hover:underline"
                          style={{ fontFamily: FONT_MONO }}
                        >
                          {etf.ticker}
                        </span>
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
                        {etf.name}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-1">
                        <span
                          className="rounded px-1 py-0.5"
                          style={{
                            background: "rgba(167,139,250,0.10)",
                            color: "var(--color-text-secondary)",
                            fontFamily: FONT_MONO,
                            fontSize: "9px",
                          }}
                        >
                          {etf.exposure}
                        </span>
                      {etf.hedged && (
                        <span
                          className="ml-1.5 rounded px-1 py-0.5"
                          title="Currency-hedged share class — returns strip out the CAD/USD move"
                          style={{
                            background: "rgba(124,58,237,0.10)",
                            color: "var(--color-neon-purple)",
                            fontFamily: FONT_MONO,
                            fontSize: "9px",
                          }}
                        >
                          HEDGED
                        </span>
                      )}
                      </div>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className="font-bold"
                        style={{
                          fontFamily: FONT_MONO,
                          color: "var(--color-text-primary)",
                          fontSize: "13px",
                        }}
                      >
                        {etf.value.toFixed(2)}
                      </span>
                      <span
                        className="ml-1"
                        style={{
                          color: "var(--color-text-muted)",
                          fontFamily: FONT_MONO,
                          fontSize: "10px",
                        }}
                      >
                        {etf.currency}
                      </span>
                      <div
                        className={`font-semibold ${getChangeColor(etf.dailyChange)}`}
                        style={{ fontFamily: FONT_MONO, fontSize: "10px" }}
                      >
                        {formatChange(etf.dailyChange)} today
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <ChangeStack
                        items={[
                          { label: "1W", value: etf.weekChange },
                          { label: "1M", value: etf.monthChange },
                          { label: "YTD", value: etf.ytdChange },
                        ]}
                      />
                    </td>

                    <td className="px-4 py-3">
                      {(() => {
                        const slice = sliceFor(chartView, etf.sparkline);
                        return (
                          <TrendSparkline
                            values={slice}
                            labels={slice.map((_, j) => pointLabel(j, slice.length))}
                            ariaLabel={`${etf.ticker} price, ${windowLabel(chartView)}`}
                          />
                        );
                      })()}
                    </td>
                  </tr>
                )),
              ];
            })}
          </tbody>
        </table>
      </div>

      <p
        className="px-4 py-3 leading-5"
        style={{
          color: "var(--color-text-muted)",
          fontSize: "11px",
          borderTop: "1px solid var(--color-space-border)",
        }}
      >
        Listed for reference, not as recommendations, and not investment advice. Canadian and US
        funds are quoted in their own listing currency and are not directly comparable: VSP hedges
        the CAD/USD move that VFV leaves in, which is most of the gap between their returns.
      </p>
    </SciFiCard>
  );
}
