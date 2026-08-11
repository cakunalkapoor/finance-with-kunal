"use client";

import { ArrowUpRight } from "lucide-react";
import { BOND_YIELDS, DATA_UPDATED_AT } from "@/lib/site-data";
import { INVESTING_BOND_URL } from "@/lib/external-links";
import { monthlyPointLabel, monthlyWindowLabel } from "@/lib/chart-window";
import { FONT_MONO } from "@/lib/utils";
import SciFiCard, { CardHeader } from "@/components/ui/SciFiCard";
import TrendSparkline from "@/components/markets/TrendSparkline";
import { ChangeStack } from "@/components/markets/StatStack";

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
        <table className="w-full text-xs" style={{ tableLayout: "fixed", minWidth: 440 }}>
          {/* Sized to sit two-up. 1D/1M/1Y move into one grouped cell rather
              than being dropped — see StatStack. */}
          <colgroup>
            <col style={{ width: "31%" }} />
            <col style={{ width: "20%" }} />
            <col style={{ width: "17%" }} />
            <col style={{ width: "32%" }} />
          </colgroup>
          <thead>
            <tr
              style={{
                background: "rgba(167,139,250,0.04)",
                borderBottom: "1px solid var(--color-space-border)",
              }}
            >
              {["Country", "Yield", "Move"].map((h) => (
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
                {/* No view toggle here: every bond carries exactly 12 monthly
                    points, so there is only one window to show. */}
                <div
                  style={{
                    fontSize: "9px",
                    letterSpacing: "0.05em",
                    opacity: 0.7,
                    marginTop: "1px",
                    textTransform: "none",
                  }}
                >
                  12 months, monthly
                </div>
              </th>
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

                <td className="px-4 py-3">
                  {/* Yield MOVES are percentage points, and a falling yield is
                      the friendly direction — hence raw + inverted colouring. */}
                  <ChangeStack
                    raw
                    items={[
                      { label: "1D", value: bond.dailyMove },
                      { label: "1M", value: bond.oneMonthMove },
                      { label: "1Y", value: bond.oneYearMove },
                    ]}
                  />
                </td>

                <td className="px-4 py-3">
                  {/* Each row's trend ends at its OWN asOf, which differs by a
                      couple of days across sources — so labels come from the
                      row, not from the site-wide refresh date. */}
                  <TrendSparkline
                    values={bond.trend}
                    labels={bond.trend.map((_, j) =>
                      monthlyPointLabel(j, bond.trend.length, bond.asOf),
                    )}
                    ariaLabel={`${bond.country} 10Y yield, ${monthlyWindowLabel(bond.trend.length, bond.asOf)}`}
                    format={(n) => `${n.toFixed(2)}%`}
                    // A falling yield is the "good" direction for bond prices.
                    positiveIsUp={false}
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
