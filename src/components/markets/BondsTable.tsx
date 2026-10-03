"use client";

import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { BOND_YIELDS, BOND_UPDATED_AT, POLICY_RATES } from "@/lib/site-data";
import { INVESTING_BOND_URL } from "@/lib/external-links";
import {
  monthlyPointLabel,
  monthlyWindowLabel,
  monthlyHorizonSlice,
  monthlyHorizonsFor,
  type ChartView,
} from "@/lib/chart-window";
import { FONT_MONO } from "@/lib/utils";
import SciFiCard, { CardHeader } from "@/components/ui/SciFiCard";
import TrendSparkline from "@/components/markets/TrendSparkline";
import { ChangeStack } from "@/components/markets/StatStack";

// Every row carries its own observation date. A daily source older than ten
// days needs attention even if the rest of the site was refreshed today.
const STALE_AFTER_DAYS = 10;
const REFRESHED_AT = new Date(BOND_UPDATED_AT).getTime();
const YIELD_FORMAT = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const POLICY_RATE_BY_COUNTRY = new Map(
  POLICY_RATES.map((policyRate) => [policyRate.country, policyRate]),
);

/* Every row used to read "<maturity> Treasury", which is only true of the US
   and Korea. A Bund is not a Treasury and neither is a Gilt or a JGB — on a
   table read by people who trade these, the generic label is just wrong. */
const INSTRUMENT: Record<string, string> = {
  "United States": "Treasury",
  "United Kingdom": "Gilt",
  Germany: "Bund",
  France: "OAT",
  China: "CGB",
  "Hong Kong": "HKSAR Govt Bond",
  Indonesia: "Govt Bond",
  Taiwan: "Govt Bond",
  Japan: "JGB",
  Canada: "GoC Bond",
  India: "G-Sec",
  "South Korea": "KTB",
  "South Africa": "Govt Bond",
};

function instrumentName(country: string): string {
  return INSTRUMENT[country] ?? "Govt Bond";
}

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

const SORTED_BOND_YIELDS = [...BOND_YIELDS].sort((a, b) =>
  a.country.localeCompare(b.country, "en"),
);

export default function BondsTable() {
  // Rows end at different asOf dates, so each computes its own window; the
  // shared strip offers only what EVERY row can draw.
  const perRow = SORTED_BOND_YIELDS.map((b) => monthlyHorizonsFor(b.trend.length, b.asOf));
  const views = perRow.length
    ? perRow.reduce((acc, hs) => acc.filter((h) => hs.includes(h)))
    : [];
  const [chartView, setChartView] = useState<ChartView>("YTD");
  const view = views.includes(chartView) ? chartView : views[views.length - 1];

  return (
    <SciFiCard>
      <CardHeader
        title="Government Bond Yields"
        subtitle={`Refreshed ${BOND_UPDATED_AT} · latest observations, including intraday quotes · moves in basis points (bp); — means unavailable · monthly trends include historical averages`}
      />
      <div className="overflow-x-auto">
        <table className="w-full text-xs" style={{ tableLayout: "fixed", minWidth: 620 }}>
          {/* Sized to sit two-up. 1D/1M/1Y move into one grouped cell rather
              than being dropped — see StatStack. */}
          <colgroup>
            <col style={{ width: "26%" }} />
            <col style={{ width: "15%" }} />
            <col style={{ width: "16%" }} />
            <col style={{ width: "16%" }} />
            <col style={{ width: 192 }} />
          </colgroup>
          <thead>
            <tr
              style={{
                background: "rgba(167,139,250,0.04)",
                borderBottom: "1px solid var(--color-space-border)",
              }}
            >
              {["Country", "10Y Yield", "Policy Rate", "Move"].map((h) => (
                <th
                  key={h}
                  className="px-4 py-2.5 text-left font-semibold tracking-widest uppercase whitespace-nowrap"
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
              <th
                className="px-4 py-2.5 text-left font-semibold tracking-widest uppercase"
                style={{
                  color: "var(--color-text-muted)",
                  fontFamily: FONT_MONO,
                  fontSize: "10px",
                  letterSpacing: "0.1em",
                }}
              >
                <div>Trend</div>
                {/* Same window ladder as every other chart. Rows end at
                    different asOf dates, so the strip offers the intersection
                    of what each row can draw and each row slices its own. */}
                <div className="flex items-center gap-1 mt-1">
                  {views.map((v) => (
                    <button
                      key={v}
                      onClick={() => setChartView(v)}
                      className="px-1.5 py-0.5 rounded transition-all"
                      style={{
                        fontFamily: FONT_MONO,
                        fontSize: "10px",
                        letterSpacing: "0.08em",
                        textTransform: "none",
                        fontWeight: view === v ? 700 : 500,
                        color:
                          view === v ? "var(--color-neon-cyan)" : "var(--color-text-muted)",
                        background: view === v ? "rgba(167,139,250,0.12)" : "transparent",
                        border: `1px solid ${
                          view === v ? "var(--color-neon-cyan-dim)" : "transparent"
                        }`,
                      }}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {SORTED_BOND_YIELDS.map((bond, i) => {
              const requested = monthlyHorizonSlice(bond.trend, bond.asOf, view);
              const firstAvailable = requested.findIndex(value => value !== null);
              const windowed = firstAvailable < 0 ? [] : requested.slice(firstAvailable);
              const policyRate = POLICY_RATE_BY_COUNTRY.get(bond.country);
              return (
              <tr
                key={bond.country}
                style={{
                  borderBottom:
                    i < SORTED_BOND_YIELDS.length - 1
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
                        {bond.maturity} {instrumentName(bond.country)}
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
                    {YIELD_FORMAT.format(bond.yield)}%
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

                <td className="px-4 py-3">
                  <span
                    className="font-bold"
                    title={
                      policyRate
                        ? `${policyRate.name} · ${policyRate.source} · as of ${formatAsOf(policyRate.asOf)}`
                        : undefined
                    }
                    style={{
                      fontFamily: FONT_MONO,
                      color: "var(--color-neon-purple)",
                      fontSize: "13px",
                    }}
                  >
                    {policyRate ? `${policyRate.rate.toFixed(2)}%` : "—"}
                  </span>
                </td>

                <td className="px-4 py-3">
                  {/* Yield MOVES are percentage points, and a falling yield is
                      the friendly direction — hence raw + inverted colouring. */}
                  <ChangeStack
                    raw
                    digits={1}
                    suffix=" bp"
                    items={[
                      { label: "1D", value: bond.dailyMove == null ? null : bond.dailyMove * 100 },
                      { label: "1M", value: bond.oneMonthMove == null ? null : bond.oneMonthMove * 100 },
                      { label: "1Y", value: bond.oneYearMove == null ? null : bond.oneYearMove * 100 },
                    ]}
                  />
                </td>

                <td className="px-4 py-3">
                  {/* Each row's trend ends at its OWN asOf, which differs by a
                      couple of days across sources — and by months for the
                      OECD series — so both the window and its labels are
                      computed from the row, not the site-wide refresh date. */}
                  {firstAvailable > 0 && <div className="text-[9px] text-[var(--color-text-muted)]">Limited history</div>}
                  <TrendSparkline
                    values={windowed}
                    labels={windowed.map((_, j) =>
                      monthlyPointLabel(j, windowed.length, bond.asOf),
                    )}
                    ariaLabel={`${bond.country} 10Y yield, ${monthlyWindowLabel(windowed.length, bond.asOf)}`}
                    format={(n) => `${YIELD_FORMAT.format(n)}%`}
                    // A falling yield is the "good" direction for bond prices.
                    positiveIsUp={false}
                  />
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
