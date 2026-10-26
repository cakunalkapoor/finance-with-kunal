import Link from "next/link";
import { LAST_UPDATED_LABEL } from "@/lib/briefing";
import { FONT_MONO } from "@/lib/utils";
import type { EconomyScope } from "@/lib/economy-view";

export default function EconomyHeader({ scope, eyebrow, title, description }: {
  scope: EconomyScope; eyebrow: string; title: string; description: string;
}) {
  return (
    <header className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.13em]" style={{ color: "var(--color-neon-cyan)", fontFamily: FONT_MONO }}>{eyebrow} · Weekly briefing</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl" style={{ color: "var(--color-text-primary)" }}>{title}</h1>
          <p className="mt-3 max-w-xl text-sm leading-6" style={{ color: "var(--color-text-secondary)" }}>{description}</p>
        </div>
        <div className="text-[11px] leading-6 sm:text-right" style={{ color: "var(--color-text-muted)", fontFamily: FONT_MONO }}>
          <p className="font-semibold uppercase">{LAST_UPDATED_LABEL}</p><p>Each release retains its reporting period</p>
        </div>
      </div>
      <nav aria-label="Economy coverage" className="flex flex-wrap gap-2">
        {([["global", "/dashboard", "Global"], ["us", "/us-economy", "United States"], ["canada", "/canada-economy", "Canada"]] as const).map(([id, href, label]) => (
          <Link key={id} href={href} aria-current={scope === id ? "page" : undefined} className="rounded-full border px-4 py-2 text-xs font-semibold transition-colors"
            style={{ borderColor: "var(--color-space-border)", background: scope === id ? "var(--color-wash)" : "var(--color-space-card)", color: scope === id ? "var(--color-neon-cyan)" : "var(--color-text-secondary)" }}>{label}</Link>
        ))}
      </nav>
    </header>
  );
}
