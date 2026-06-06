import { LineChart, Landmark, Calculator, ShieldCheck, Award } from "lucide-react";
import { FONT_MONO } from "@/lib/utils";
import SciFiCard from "@/components/ui/SciFiCard";
import type { ProfileHighlight } from "@/types";

const ICON_MAP: Record<
  string,
  React.ComponentType<{ size?: number; style?: React.CSSProperties }>
> = {
  lineChart: LineChart,
  landmark: Landmark,
  calculator: Calculator,
  shieldCheck: ShieldCheck,
};

export default function CareerHighlights({ highlights }: { highlights: ProfileHighlight[] }) {
  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-4 w-0.5 rounded" style={{ background: "var(--color-neon-cyan)" }} />
        <span
          className="text-xs font-bold tracking-widest uppercase"
          style={{ fontFamily: FONT_MONO, color: "var(--color-neon-cyan)", letterSpacing: "0.14em" }}
        >
          Career Highlights
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {highlights.map((h, i) => {
          const Icon = ICON_MAP[h.icon] ?? Award;
          return (
            <SciFiCard key={i} cornerAccent className="p-5">
              <div className="flex items-start gap-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    background: "rgba(124,58,237,0.12)",
                    border: "1px solid rgba(124,58,237,0.3)",
                  }}
                >
                  <Icon size={17} style={{ color: "var(--color-neon-cyan)" }} />
                </div>
                <div className="min-w-0">
                  <h3
                    className="text-sm font-bold mb-1"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    {h.title}
                  </h3>
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    {h.description}
                  </p>
                </div>
              </div>
            </SciFiCard>
          );
        })}
      </div>
    </section>
  );
}
