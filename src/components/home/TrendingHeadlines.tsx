import { ArrowUpRight, Newspaper } from "lucide-react";
import { EXTERNAL_COMMENTARY } from "@/lib/site-data";
import { FONT_MONO } from "@/lib/utils";

export default function TrendingHeadlines() {
  return (
    <section className="border-y py-16 sm:py-24" style={{ borderColor: "var(--color-space-border)", background: "var(--color-space-black)" }}>
      <div className="section-shell">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="eyebrow">Reading the tape</span>
            <h2 className="mt-3 text-3xl font-semibold sm:text-4xl" style={{ color: "var(--color-text-primary)", letterSpacing: "-0.04em" }}>
              Stories moving the market
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs" style={{ color: "var(--color-text-muted)", fontFamily: FONT_MONO }}>
            <Newspaper size={15} /> Curated from leading sources
          </div>
        </div>

        <div className="divide-y border-y" style={{ borderColor: "var(--color-space-border)" }}>
          {EXTERNAL_COMMENTARY.slice(0, 5).map((item, index) => (
            <a
              key={item.id}
              href={item.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group grid gap-4 py-6 sm:grid-cols-[3rem_0.65fr_1.35fr_auto] sm:items-start sm:gap-6"
              style={{ borderColor: "var(--color-space-border)" }}
            >
              <span className="text-[10px] font-bold" style={{ color: "var(--color-text-muted)", fontFamily: FONT_MONO }}>0{index + 1}</span>
              <div>
                <span className="inline-flex rounded-full px-2 py-1 text-[9px] font-bold uppercase tracking-[0.12em]" style={{ color: "var(--color-neon-cyan)", background: "var(--color-wash)", fontFamily: FONT_MONO }}>
                  {item.category}
                </span>
                <div className="mt-2 text-[10px] uppercase tracking-[0.08em]" style={{ color: "var(--color-text-muted)", fontFamily: FONT_MONO }}>
                  {item.source} · {item.date}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold leading-snug transition-colors group-hover:text-[var(--color-neon-cyan)]" style={{ color: "var(--color-text-primary)", letterSpacing: "-0.02em" }}>
                  {item.title}
                </h3>
                <p className="mt-2 line-clamp-2 text-sm leading-6" style={{ color: "var(--color-text-secondary)" }}>
                  {item.excerpt}
                </p>
              </div>
              <ArrowUpRight size={17} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" style={{ color: "var(--color-neon-cyan)" }} />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
