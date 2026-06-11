import { FONT_MONO } from "@/lib/utils";
import type { ProfileStat } from "@/types";

export default function ProfileStats({ stats }: { stats: ProfileStat[] }) {
  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <div className="h-4 w-0.5 rounded" style={{ background: "var(--color-neon-cyan)" }} />
        <span
          className="text-xs font-bold tracking-widest uppercase"
          style={{ fontFamily: FONT_MONO, color: "var(--color-neon-cyan)", letterSpacing: "0.14em" }}
        >
          By the Numbers
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="rounded-lg p-4 sm:p-5 text-center"
            style={{
              background: "var(--color-space-card)",
              border: "1px solid var(--color-space-border)",
              boxShadow: "0 0 20px rgba(124,58,237,0.08)",
            }}
          >
            <div
              className="text-2xl sm:text-3xl font-bold mb-1"
              style={{
                fontFamily: FONT_MONO,
                color: "var(--color-neon-cyan)",
                letterSpacing: "-0.01em",
                lineHeight: 1.45,
              }}
            >
              {stat.value}
            </div>
            <div
              className="text-xs leading-snug"
              style={{ color: "var(--color-text-muted)", letterSpacing: "0.02em" }}
            >
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
