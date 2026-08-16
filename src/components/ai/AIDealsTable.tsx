import { ArrowUpRight } from "lucide-react";
import { AI_DEALS, AI_FUNDING_QUARTERS } from "@/lib/ai-data";
import { FONT_MONO } from "@/lib/utils";
import SciFiCard, { CardHeader } from "@/components/ui/SciFiCard";
import type { CSSProperties } from "react";

/*
 * Private-market AI capital.
 *
 * Deliberately a short table rather than a long one. Deal databases are paid
 * products, and a scraped "top 50 AI rounds" list would be half-sourced and
 * stale within a fortnight. Two rounds carry the actual point — that a pair of
 * private companies absorbed 43% of all global venture funding in a half-year
 * — better than fifty rows of varying reliability would.
 *
 * Amounts are as announced. Private valuations are a negotiated price for a
 * small slice of preferred stock with its own liquidation terms, not a market
 * capitalisation, and the footnote says so.
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
        subtitle="Global venture funding and where AI took it · largest disclosed AI rounds"
      />

      {/* Quarterly split — two bars' worth of data, so rendered as meters
          rather than a chart that would look emptier than the numbers are. */}
      <div className="space-y-3 px-4 pb-4">
        {AI_FUNDING_QUARTERS.map((q) => (
          <div key={q.quarter}>
            <div className="flex items-baseline justify-between">
              <span
                className="text-[11px] font-semibold"
                style={{ color: "var(--color-text-secondary)", fontFamily: FONT_MONO }}
              >
                {q.quarter}
              </span>
              <span
                className="text-[11px]"
                style={{ color: "var(--color-text-muted)", fontFamily: FONT_MONO }}
              >
                <strong style={{ color: "var(--color-neon-cyan)" }}>{q.aiSharePct}%</strong> of $
                {q.totalUsdBn}B went to AI
              </span>
            </div>
            <div
              className="mt-1.5 h-2 w-full overflow-hidden rounded-full"
              style={{ background: "var(--color-wash)" }}
              role="img"
              aria-label={`${q.aiSharePct}% of ${q.quarter} global venture funding went to AI companies`}
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
        ))}
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
              {["Company", "Raised", "Valuation", "Announced"].map((h) => (
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
        A private &ldquo;valuation&rdquo; is the price agreed for a slice of preferred stock, with
        liquidation preferences and ratchets attached — it is not a market capitalisation and it is
        not marked daily. Deal terms are as announced by the parties; comprehensive deal data sits
        behind paid databases, so this is the disclosed headline set rather than a complete league
        table.
      </p>
    </SciFiCard>
  );
}
