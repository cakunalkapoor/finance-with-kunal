import { ArrowUpRight } from "lucide-react";
import { AI_DEALS, AI_FUNDING_QUARTERS } from "@/lib/ai-data";
import { FONT_MONO } from "@/lib/utils";
import SciFiCard, { CardHeader } from "@/components/ui/SciFiCard";
import type { CSSProperties } from "react";

/*
 * Private-market AI capital.
 *
 * Selected sourced rounds, newest first. The three H1 OpenAI/Anthropic rounds
 * support the separate H1 concentration calculation; later deals are excluded
 * from that denominator and numerator.
 *
 * Amounts are announced or committed, which is not always the same as cash
 * funded at announcement. Private post-money valuations are negotiated prices
 * for preferred stock, not market capitalisations, and the footnote says so.
 */

const TH_STYLE: CSSProperties = {
  color: "var(--color-text-muted)",
  fontFamily: FONT_MONO,
  fontSize: "10px",
  letterSpacing: "0.1em",
};

function formatDate(iso: string): string {
  const parsed = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return iso;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(parsed);
}

export default function AIDealsTable() {
  return (
    <SciFiCard glow="purple">
      <CardHeader
        title="Private capital"
        subtitle="Global venture funding in USD · Q1 Mar 31 and Q2 Jul 1 snapshots · selected announced AI rounds"
      />

      {/* Quarterly split — two bars' worth of data, so rendered as meters
          rather than a chart that would look emptier than the numbers are. */}
      <div className="space-y-3 px-4 pb-4">
        {AI_FUNDING_QUARTERS.map((q) => {
          const roundedShare = Math.round(q.aiSharePct);
          const isQ1 = q.quarter.startsWith("Q1");
          const snapshotLabel = isQ1 ? "Mar 31 snapshot" : "Jul 1 snapshot";
          const shareLabel = isQ1 ? `≈${roundedShare}%` : `>${Math.floor(q.aiSharePct)}%`;
          const shareAria = isQ1
            ? `approximately ${roundedShare} percent`
            : `more than ${Math.floor(q.aiSharePct)} percent`;

          return (
            <div key={q.quarter}>
              <div className="flex items-baseline justify-between gap-3">
                <span
                  className="text-[11px] font-semibold"
                  style={{ color: "var(--color-text-secondary)", fontFamily: FONT_MONO }}
                >
                  {q.quarter}
                </span>
                <span
                  className="text-right text-[11px]"
                  style={{ color: "var(--color-text-muted)", fontFamily: FONT_MONO }}
                >
                  {snapshotLabel} ·{" "}
                  <strong style={{ color: "var(--color-neon-cyan)" }}>{shareLabel}</strong> of $
                  {q.totalUsdBn}B reported as AI
                </span>
              </div>
              <div
                className="mt-1.5 h-2 w-full overflow-hidden rounded-full"
                style={{ background: "var(--color-wash)" }}
                role="img"
                aria-label={`${shareAria} of ${q.quarter} global venture funding was reported as AI funding in the ${snapshotLabel}`}
              >
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${q.aiSharePct}%`,
                    background: "var(--color-neon-cyan)",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs" style={{ minWidth: 420 }}>
          <thead>
            <tr
              style={{
                background: "rgba(129,140,248,0.04)",
                borderTop: "1px solid var(--color-space-border)",
                borderBottom: "1px solid var(--color-space-border)",
              }}
            >
              {["Company", "Announced/committed (USD)", "Post-money (USD)", "Date"].map((h) => (
                <th
                  key={h}
                  className="px-4 py-2.5 text-left font-semibold tracking-widest uppercase whitespace-nowrap"
                  style={TH_STYLE}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {AI_DEALS.map((deal, i) => (
              <tr
                key={`${deal.company}-${deal.date}`}
                style={{
                  borderBottom:
                    i < AI_DEALS.length - 1 ? "1px solid var(--color-space-border)" : "none",
                }}
              >
                <td className="px-4 py-3">
                  <a
                    href={deal.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={`${deal.company} — ${deal.source}`}
                    className="group inline-flex items-center gap-1 font-semibold text-[var(--color-text-primary)] transition-colors hover:text-[var(--color-neon-cyan)]"
                  >
                    <span className="underline-offset-2 group-hover:underline">{deal.company}</span>
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
                    {deal.round} · {deal.leadInvestors}
                  </div>
                </td>
                <td
                  className="px-4 py-3 font-bold whitespace-nowrap"
                  style={{ fontFamily: FONT_MONO, color: "var(--color-neon-cyan)" }}
                >
                  ${deal.amount}B
                </td>
                <td
                  className="px-4 py-3 whitespace-nowrap"
                  style={{ fontFamily: FONT_MONO, color: "var(--color-text-primary)" }}
                >
                  {deal.valuation ? `$${deal.valuation}B` : "—"}
                </td>
                <td
                  className="px-4 py-3 whitespace-nowrap"
                  style={{ fontFamily: FONT_MONO, color: "var(--color-text-muted)" }}
                >
                  {formatDate(deal.date)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p
        className="border-t px-4 py-3 leading-5"
        style={{
          color: "var(--color-text-muted)",
          fontSize: "11px",
          borderColor: "var(--color-space-border)",
        }}
      >
        Q1&rsquo;s ≈80% share and total preserve Crunchbase&rsquo;s Mar 31 snapshot; Q2&rsquo;s &gt;70%
        share and total preserve its Jul 1 snapshot. The later revised H1 total is not backfilled
        into the quarter view because Crunchbase did not publish a revised split. Deal amounts are
        announced or committed, not necessarily funded on the announcement date. Crusoe&rsquo;s
        amount is the anticipated full round at its initial close. August and September deals
        are excluded from the H1 concentration calculation. A post-money
        valuation is the negotiated price for preferred stock with its own terms, not a daily market
        capitalisation. This is the reported headline set, not a complete private-market league
        table.
      </p>
    </SciFiCard>
  );
}
