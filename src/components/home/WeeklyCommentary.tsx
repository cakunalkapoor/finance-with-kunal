import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { WEEKLY_COMMENTARY } from "@/lib/site-data";
import { FONT_MONO } from "@/lib/utils";

export default function WeeklyCommentary() {
  const { weekRange, lead, sections } = WEEKLY_COMMENTARY;

  return (
    <section className="py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-screen-2xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
          <h2
            className="text-xs font-bold tracking-widest uppercase"
            style={{
              fontFamily: FONT_MONO,
              color: "var(--color-text-muted)",
              letterSpacing: "0.14em",
            }}
          >
            Latest Commentary
          </h2>
          <span
            className="text-xs"
            style={{
              fontFamily: FONT_MONO,
              color: "var(--color-text-muted)",
              letterSpacing: "0.06em",
            }}
          >
            Week of {weekRange}
          </span>
        </div>

        {/* Lead paragraph */}
        <div
          className="rounded-xl p-5 sm:p-6 mb-4"
          style={{
            background:
              "linear-gradient(135deg, rgba(167,139,250,0.06) 0%, rgba(129,140,248,0.04) 100%)",
            border: "1px solid rgba(167,139,250,0.2)",
          }}
        >
          <p
            className="text-sm sm:text-base leading-relaxed"
            style={{ color: "var(--color-text-primary)" }}
          >
            {lead}
          </p>
        </div>

        {/* Section grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sections.map((s) => (
            <div
              key={s.id}
              className="rounded-xl p-5 flex flex-col gap-3"
              style={{
                background: "var(--color-space-card)",
                border: "1px solid var(--color-space-border)",
              }}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg leading-none">{s.icon}</span>
                <h3
                  className="font-bold text-sm"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {s.title}
                </h3>
              </div>

              <p
                className="text-xs leading-relaxed flex-1"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {s.body}
              </p>

              {s.link && (
                <Link
                  href={s.link.href}
                  className="text-xs flex items-center gap-1 mt-auto pt-2"
                  style={{
                    color: "var(--color-neon-cyan)",
                    borderTop: "1px solid var(--color-space-border)",
                  }}
                >
                  {s.link.label} <ArrowRight size={11} />
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
