import { FONT_MONO } from "@/lib/utils";
import SciFiCard from "@/components/ui/SciFiCard";
import type { ExperienceItem } from "@/types";

const DOT = "#7c3aed";
const ORG_COLOR = "#a78bfa";

const MONTH_MAP: Record<string, number> = {
  Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6,
  Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12,
};

function parseSortKey(str: string): number {
  const m = str.match(/([A-Z][a-z]{2})\s*[\s/]\s*(\d{4})/);
  if (m) return parseInt(m[2]) + (MONTH_MAP[m[1]] ?? 0) / 12;
  const y = str.match(/(\d{4})/);
  return y ? parseInt(y[1]) : 0;
}

// Derive a country flag from a location string.
function flagFor(s: string): string {
  if (/canada|vancouver|\bbc\b|toronto/i.test(s)) return "🇨🇦";
  if (/india|mumbai|delhi|bengaluru|bangalore/i.test(s)) return "🇮🇳";
  return "";
}

export default function CareerTimeline({ experience }: { experience: ExperienceItem[] }) {
  const items = [...experience].sort(
    (a, b) => parseSortKey(b.period) - parseSortKey(a.period)
  );

  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-6">
        <div className="h-4 w-0.5 rounded" style={{ background: "var(--color-neon-cyan)" }} />
        <span
          className="text-xs font-bold tracking-widest uppercase"
          style={{ fontFamily: FONT_MONO, color: "var(--color-neon-cyan)", letterSpacing: "0.14em" }}
        >
          Experience
        </span>
      </div>

      <div className="relative">
        {/* Vertical bar */}
        <div
          className="absolute left-3 top-3 bottom-3 w-px hidden sm:block"
          style={{
            background:
              "linear-gradient(to bottom, var(--color-neon-cyan), rgba(124,58,237,0.08))",
          }}
        />

        <div className="space-y-3">
          {items.map((e, i) => {
            const flag = flagFor(e.location);
            return (
              <div key={i} className="relative sm:pl-10">
                {/* Timeline dot */}
                <div
                  className="absolute left-0 top-5 w-6 h-6 rounded-full items-center justify-center hidden sm:flex"
                  style={{ background: "var(--color-space-card)", border: `1px solid ${DOT}55` }}
                >
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: DOT }} />
                </div>

                <SciFiCard cornerAccent className="p-5">
                  {/* Meta: flag + period + location */}
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {flag && (
                      <span className="text-sm leading-none" aria-hidden="true">
                        {flag}
                      </span>
                    )}
                    <span
                      className="text-xs font-semibold"
                      style={{ fontFamily: FONT_MONO, color: "var(--color-text-muted)" }}
                    >
                      {e.period}
                    </span>
                    {e.location && (
                      <>
                        <span style={{ color: "var(--color-space-border)" }}>·</span>
                        <span
                          className="text-xs"
                          style={{ fontFamily: FONT_MONO, color: "var(--color-text-muted)" }}
                        >
                          {e.location}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Title + company */}
                  <h3
                    className="text-sm font-bold mb-0.5"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    {e.title}
                  </h3>
                  <p className="text-xs font-semibold mb-0.5" style={{ color: ORG_COLOR }}>
                    {e.company}
                  </p>
                  {e.companyNote && (
                    <p className="text-xs mb-2" style={{ color: "var(--color-text-muted)" }}>
                      {e.companyNote}
                    </p>
                  )}

                  {/* Highlights */}
                  {e.highlights.length > 0 && (
                    <ul className="mt-3 space-y-1.5">
                      {e.highlights.map((h, j) => (
                        <li key={j} className="flex gap-2 text-xs leading-relaxed">
                          <span
                            className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0"
                            style={{ background: DOT, opacity: 0.7 }}
                          />
                          <span style={{ color: "var(--color-text-secondary)" }}>{h}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </SciFiCard>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
