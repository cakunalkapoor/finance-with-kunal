import { FONT_MONO } from "@/lib/utils";
import SciFiCard from "@/components/ui/SciFiCard";
import type { SkillCategory } from "@/types";

export default function SkillsGrid({ categories }: { categories: SkillCategory[] }) {
  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-4 w-0.5 rounded" style={{ background: "var(--color-neon-cyan)" }} />
        <span
          className="text-xs font-bold tracking-widest uppercase"
          style={{ fontFamily: FONT_MONO, color: "var(--color-neon-cyan)", letterSpacing: "0.14em" }}
        >
          Skills & Expertise
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {categories.map((cat, i) => (
          <SciFiCard key={i} glow="none" className="p-5">
            <p
              className="text-xs font-bold uppercase tracking-widest mb-3"
              style={{ fontFamily: FONT_MONO, color: "var(--color-text-secondary)", letterSpacing: "0.1em" }}
            >
              {cat.category}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {cat.items.map((skill, j) => (
                <span
                  key={j}
                  className="text-xs px-2.5 py-1 rounded-full"
                  style={{
                    background: "rgba(124,58,237,0.08)",
                    border: "1px solid rgba(124,58,237,0.2)",
                    color: "var(--color-text-secondary)",
                    fontFamily: FONT_MONO,
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
          </SciFiCard>
        ))}
      </div>
    </section>
  );
}
