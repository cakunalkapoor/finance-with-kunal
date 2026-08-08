import Link from "next/link";
import { ArrowRight, Quote } from "lucide-react";
import Reveal from "@/components/ui/Reveal";
import { WEEKLY_COMMENTARY } from "@/lib/site-data";
import { FONT_MONO } from "@/lib/utils";

export default function WeeklyCommentary() {
  const { weekRange, lead, sections } = WEEKLY_COMMENTARY;

  return (
    <section className="py-16 sm:py-24">
      <div className="section-shell">
        <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
          <Reveal variant="right" className="lg:sticky lg:top-24 lg:self-start">
            <span className="eyebrow">Kunal&apos;s weekly read</span>
            <h2
              className="mt-4 text-4xl font-semibold leading-[0.98] sm:text-6xl"
              style={{ color: "var(--color-text-primary)", letterSpacing: "-0.055em" }}
            >
              The week,
              <br />
              decoded.
            </h2>
            <div className="mt-7 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em]" style={{ color: "var(--color-neon-cyan)", fontFamily: FONT_MONO }}>
              {weekRange}
            </div>
            <div className="mt-8 border-l pl-5" style={{ borderColor: "var(--color-neon-cyan)" }}>
              <Quote size={18} className="mb-4" style={{ color: "var(--color-neon-cyan)" }} />
              <p className="text-base leading-7 sm:text-lg" style={{ color: "var(--color-text-secondary)" }}>
                {lead}
              </p>
            </div>
          </Reveal>

          <div className="grid gap-px border sm:grid-cols-2" style={{ background: "var(--color-space-border)", borderColor: "var(--color-space-border)" }}>
            {sections.map((section, index) => (
              <Reveal
                as="article"
                key={section.id}
                delay={index * 80}
                className="group hover-accent relative flex min-h-72 flex-col p-6 sm:p-7"
                style={{ background: "var(--color-space-card)" }}
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="text-[10px] font-bold tracking-[0.14em]" style={{ color: "var(--color-text-muted)", fontFamily: FONT_MONO }}>
                    0{index + 1}
                  </span>
                  <span className="text-xl" aria-hidden="true">{section.icon}</span>
                </div>
                <h3 className="mt-8 text-xl font-semibold" style={{ color: "var(--color-text-primary)", letterSpacing: "-0.025em" }}>
                  {section.title}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-6" style={{ color: "var(--color-text-secondary)" }}>
                  {section.body}
                </p>
                {section.link && (
                  <Link href={section.link.href} className="mt-6 inline-flex items-center gap-2 text-xs font-bold" style={{ color: "var(--color-neon-cyan)" }}>
                    {section.link.label} <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                  </Link>
                )}
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
