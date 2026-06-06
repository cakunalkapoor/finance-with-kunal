import { FONT_MONO } from "@/lib/utils";
import SciFiCard from "@/components/ui/SciFiCard";
import type { EducationItem } from "@/types";

export default function EducationSection({ items }: { items: EducationItem[] }) {
  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-4 w-0.5 rounded" style={{ background: "var(--color-neon-cyan)" }} />
        <span
          className="text-xs font-bold tracking-widest uppercase"
          style={{ fontFamily: FONT_MONO, color: "var(--color-neon-cyan)", letterSpacing: "0.14em" }}
        >
          Education & Certifications
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item, i) => (
          <SciFiCard key={i} glow="none" cornerAccent className="p-5">
            <p
              className="text-sm font-bold mb-1 leading-snug"
              style={{ color: "var(--color-text-primary)" }}
            >
              {item.degree}
            </p>
            <p
              className="text-xs font-semibold mb-1"
              style={{ color: "var(--color-neon-cyan)" }}
            >
              {item.institution}
            </p>
            <p
              className="text-xs"
              style={{ fontFamily: FONT_MONO, color: "var(--color-text-muted)" }}
            >
              {item.year}
            </p>
            {item.detail && (
              <p
                className="text-xs mt-1"
                style={{ color: "var(--color-text-muted)" }}
              >
                {item.detail}
              </p>
            )}
          </SciFiCard>
        ))}
      </div>
    </section>
  );
}
