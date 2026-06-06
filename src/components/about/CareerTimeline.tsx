import { FONT_MONO } from "@/lib/utils";
import SciFiCard from "@/components/ui/SciFiCard";
import type { ExperienceItem, EducationItem } from "@/types";

type EventType = "work" | "education" | "cert";

interface TimelineEvent {
  type: EventType;
  sortKey: number;
  period: string;
  title: string;
  org: string;
  orgNote?: string;
  location?: string;
  detail?: string;
  flag?: string;
  highlights?: string[];
}

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

// Derive a country flag from a location or institution string.
function flagFor(s: string): string {
  if (/canada|vancouver|\bbc\b|toronto/i.test(s)) return "🇨🇦";
  if (/india|mumbai|delhi|bengaluru|bangalore/i.test(s)) return "🇮🇳";
  return "";
}

const TYPE_CONFIG: Record<EventType, { label: string; dotColor: string; badgeBg: string; badgeColor: string }> = {
  work:      { label: "Work",          dotColor: "#7c3aed", badgeBg: "rgba(124,58,237,0.15)",  badgeColor: "#a78bfa" },
  education: { label: "Education",     dotColor: "#4f46e5", badgeBg: "rgba(79,70,229,0.15)",   badgeColor: "#818cf8" },
  cert:      { label: "Certification", dotColor: "#059669", badgeBg: "rgba(5,150,105,0.12)",   badgeColor: "#34d399" },
};

export default function CareerTimeline({
  experience,
  education,
}: {
  experience: ExperienceItem[];
  education: EducationItem[];
}) {
  const events: TimelineEvent[] = [
    ...experience.map((e): TimelineEvent => ({
      type: "work",
      sortKey: parseSortKey(e.period),
      period: e.period,
      title: e.title,
      org: e.company,
      orgNote: e.companyNote,
      location: e.location,
      flag: flagFor(e.location),
      highlights: e.highlights,
    })),
    ...education.map((e): TimelineEvent => {
      const isCert =
        e.institution === "Intuit" ||
        e.degree === "QuickBooks ProAdvisor" ||
        /chartered accountant/i.test(e.degree);
      return {
        type: isCert ? "cert" : "education",
        sortKey: parseSortKey(e.year),
        period: e.year,
        title: e.degree,
        org: e.institution,
        detail: e.detail,
        flag: flagFor(e.institution),
      };
    }),
  ].sort((a, b) => b.sortKey - a.sortKey);

  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-6">
        <div className="h-4 w-0.5 rounded" style={{ background: "var(--color-neon-cyan)" }} />
        <span
          className="text-xs font-bold tracking-widest uppercase"
          style={{ fontFamily: FONT_MONO, color: "var(--color-neon-cyan)", letterSpacing: "0.14em" }}
        >
          Career Timeline
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
          {events.map((event, i) => {
            const cfg = TYPE_CONFIG[event.type];
            return (
              <div key={i} className="relative sm:pl-10">
                {/* Timeline dot */}
                <div
                  className="absolute left-0 top-5 w-6 h-6 rounded-full items-center justify-center hidden sm:flex"
                  style={{
                    background: "var(--color-space-card)",
                    border: `1px solid ${cfg.dotColor}55`,
                  }}
                >
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ background: cfg.dotColor }}
                  />
                </div>

                <SciFiCard cornerAccent className="p-5">
                  {/* Type badge + period row */}
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-semibold"
                      style={{
                        fontFamily: FONT_MONO,
                        letterSpacing: "0.08em",
                        background: cfg.badgeBg,
                        color: cfg.badgeColor,
                        border: `1px solid ${cfg.dotColor}33`,
                      }}
                    >
                      {cfg.label.toUpperCase()}
                    </span>
                    {event.flag && (
                      <span className="text-sm leading-none" aria-hidden="true">
                        {event.flag}
                      </span>
                    )}
                    <span
                      className="text-xs font-semibold"
                      style={{ fontFamily: FONT_MONO, color: "var(--color-text-muted)" }}
                    >
                      {event.period}
                    </span>
                    {event.location && (
                      <>
                        <span style={{ color: "var(--color-space-border)" }}>·</span>
                        <span
                          className="text-xs"
                          style={{ fontFamily: FONT_MONO, color: "var(--color-text-muted)" }}
                        >
                          {event.location}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Title + org */}
                  <h3
                    className="text-sm font-bold mb-0.5"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    {event.title}
                  </h3>
                  <p
                    className="text-xs font-semibold mb-0.5"
                    style={{ color: cfg.badgeColor }}
                  >
                    {event.org}
                  </p>
                  {event.orgNote && (
                    <p className="text-xs mb-2" style={{ color: "var(--color-text-muted)" }}>
                      {event.orgNote}
                    </p>
                  )}
                  {event.detail && (
                    <p className="text-xs mb-1" style={{ color: "var(--color-text-muted)" }}>
                      {event.detail}
                    </p>
                  )}

                  {/* Highlights (work events only) */}
                  {event.highlights && event.highlights.length > 0 && (
                    <ul className="mt-3 space-y-1.5">
                      {event.highlights.map((h, j) => (
                        <li key={j} className="flex gap-2 text-xs leading-relaxed">
                          <span
                            className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0"
                            style={{ background: cfg.dotColor, opacity: 0.7 }}
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
