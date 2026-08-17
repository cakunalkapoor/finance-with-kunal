import type { CSSProperties } from "react";
import { Activity, CalendarCheck } from "lucide-react";
import { BRIEFING_WEEK_LABEL } from "@/lib/briefing";
import { FONT_MONO } from "@/lib/utils";

/** Entrance stagger for the hero cluster, in render order. */
const enter = (delay: number) => ({ "--enter-delay": `${delay}ms` }) as CSSProperties;

interface BriefingStat {
  label: string;
  value: string;
  detail: string;
}

interface BriefingHeroProps {
  eyebrow: string;
  title: string;
  /** Omit to render the hero without the lede paragraph. */
  description?: string;
  /** Hide the briefing-week line — for pages whose content isn't weekly data
   *  (About). The label itself is site-wide and never passed in per page. */
  showWeek?: boolean;
  accent?: "violet" | "indigo" | "emerald";
  /** Omit to render the hero without the stat tiles. */
  stats?: BriefingStat[];
}

const ACCENTS = {
  violet: {
    color: "var(--color-neon-cyan)",
    soft: "rgba(124,58,237,0.10)",
    line: "rgba(124,58,237,0.34)",
    glow: "rgba(124,58,237,0.16)",
  },
  indigo: {
    color: "var(--color-neon-purple)",
    soft: "rgba(79,70,229,0.10)",
    line: "rgba(79,70,229,0.34)",
    glow: "rgba(79,70,229,0.16)",
  },
  emerald: {
    color: "var(--color-market-up)",
    soft: "rgba(5,150,105,0.10)",
    line: "rgba(5,150,105,0.30)",
    glow: "rgba(5,150,105,0.14)",
  },
};

export default function BriefingHero({
  eyebrow,
  title,
  description,
  showWeek = true,
  accent = "violet",
  stats = [],
}: BriefingHeroProps) {
  const palette = ACCENTS[accent];
  // With no tiles there is no second column, so the copy should span the full width.
  const hasStats = stats.length > 0;

  return (
    <section
      className="relative overflow-hidden rounded-2xl p-5 sm:p-7 lg:p-8"
      style={{
        background:
          "linear-gradient(135deg, var(--color-space-card) 0%, var(--color-space-card) 58%, var(--color-space-dark) 100%)",
        border: "1px solid var(--color-space-border)",
        boxShadow: `0 18px 60px ${palette.glow}`,
      }}
    >
      <div
        className="absolute -right-20 -top-24 h-72 w-72 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${palette.glow} 0%, transparent 68%)`,
        }}
      />

      <div
        className={`relative grid gap-8 ${
          hasStats ? "lg:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)] lg:items-end" : ""
        }`}
      >
        <div>
          <div className="animate-enter mb-5 flex flex-wrap items-center gap-x-4 gap-y-2">
            <span
              className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-bold uppercase"
              style={{
                background: palette.soft,
                border: `1px solid ${palette.line}`,
                color: palette.color,
                fontFamily: FONT_MONO,
                letterSpacing: "0.12em",
              }}
            >
              <Activity size={12} />
              {eyebrow}
            </span>
            <span
              className="text-[11px] uppercase"
              style={{ color: "var(--color-text-muted)", fontFamily: FONT_MONO, letterSpacing: "0.1em" }}
            >
              Independent weekly intelligence
            </span>
          </div>

          <h1
            className="animate-enter max-w-3xl text-3xl font-bold leading-[1.06] sm:text-4xl lg:text-5xl"
            style={{ color: "var(--color-text-primary)", letterSpacing: "-0.045em", ...enter(80) }}
          >
            {title}
          </h1>
          {description && (
            <p
              className="animate-enter mt-4 max-w-2xl text-sm leading-7 sm:text-base"
              style={{ color: "var(--color-text-secondary)", ...enter(160) }}
            >
              {description}
            </p>
          )}

          {showWeek && (
            <div className="animate-enter mt-6 flex flex-wrap items-center gap-x-5 gap-y-2" style={enter(240)}>
              <span
                className="flex items-center gap-2 text-xs font-bold uppercase"
                style={{
                  color: "var(--color-text-secondary)",
                  fontFamily: FONT_MONO,
                  letterSpacing: "0.12em",
                }}
              >
                <CalendarCheck size={13} style={{ color: "var(--color-market-up)" }} />
                {BRIEFING_WEEK_LABEL}
              </span>
            </div>
          )}
        </div>

        {hasStats && (
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {/* The entrance animation and the hover lift both drive `transform`,
                and a filled animation beats a transition — so they need
                separate elements to coexist. */}
            {stats.map((stat, index) => (
              <div key={stat.label} className="animate-enter min-w-0" style={enter(300 + index * 80)}>
                <div
                  className="hover-lift h-full min-w-0 rounded-xl p-3 sm:p-4"
                  style={{
                    background: "color-mix(in srgb, var(--color-space-card) 86%, transparent)",
                    border: "1px solid var(--color-space-border)",
                  }}
                >
                  <p
                    className="truncate text-[10px] font-bold uppercase"
                    style={{ color: "var(--color-text-muted)", fontFamily: FONT_MONO, letterSpacing: "0.1em" }}
                  >
                    {stat.label}
                  </p>
                  <p
                    className="mt-2 text-lg font-bold sm:text-xl"
                    style={{ color: palette.color, fontFamily: FONT_MONO, letterSpacing: "-0.03em" }}
                  >
                    {stat.value}
                  </p>
                  <p className="mt-1 text-[10px] leading-4" style={{ color: "var(--color-text-muted)" }}>
                    {stat.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
