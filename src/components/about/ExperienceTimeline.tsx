import { FONT_MONO } from "@/lib/utils";
import SciFiCard from "@/components/ui/SciFiCard";
import type { ExperienceItem } from "@/types";

export default function ExperienceTimeline({ items }: { items: ExperienceItem[] }) {
  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-4 w-0.5 rounded" style={{ background: "var(--color-neon-cyan)" }} />
        <span
          className="text-xs font-bold tracking-widest uppercase"
          style={{ fontFamily: FONT_MONO, color: "var(--color-neon-cyan)", letterSpacing: "0.14em" }}
        >
          Experience
        </span>
      </div>

      <div className="relative">
        {/* Vertical timeline bar */}
        <div
          className="absolute left-3 top-2 bottom-2 w-px hidden sm:block"
          style={{ background: "linear-gradient(to bottom, var(--color-neon-cyan), rgba(124,58,237,0.1))" }}
        />

        <div className="space-y-4">
          {items.map((item, i) => (
            <div key={i} className="relative sm:pl-10">
              {/* Timeline dot */}
              <div
                className="absolute left-0 top-5 w-6 h-6 rounded-full items-center justify-center hidden sm:flex"
                style={{
                  background: "var(--color-space-card)",
                  border: "1px solid rgba(124,58,237,0.4)",
                }}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: i === 0 ? "var(--color-neon-cyan)" : "rgba(124,58,237,0.5)" }}
                />
              </div>

              <SciFiCard cornerAccent className="p-5">
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 mb-3">
                  <div>
                    <h3
                      className="text-sm font-bold"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      {item.title}
                    </h3>
                    <p
                      className="text-sm font-semibold mt-0.5"
                      style={{ color: "var(--color-neon-cyan)" }}
                    >
                      {item.company}
                    </p>
                    {item.companyNote && (
                      <p
                        className="text-xs mt-0.5"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        {item.companyNote}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col sm:items-end gap-0.5 flex-shrink-0">
                    <span
                      className="text-xs font-semibold whitespace-nowrap"
                      style={{ fontFamily: FONT_MONO, color: "var(--color-text-secondary)" }}
                    >
                      {item.period}
                    </span>
                    <span
                      className="text-xs"
                      style={{ fontFamily: FONT_MONO, color: "var(--color-text-muted)" }}
                    >
                      {item.location}
                    </span>
                  </div>
                </div>

                {/* Highlights */}
                <ul className="space-y-1.5">
                  {item.highlights.map((h, j) => (
                    <li key={j} className="flex gap-2 text-xs leading-relaxed">
                      <span
                        className="mt-1.5 w-1 h-1 rounded-full flex-shrink-0"
                        style={{ background: "var(--color-neon-cyan)", opacity: 0.6 }}
                      />
                      <span style={{ color: "var(--color-text-secondary)" }}>{h}</span>
                    </li>
                  ))}
                </ul>
              </SciFiCard>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
