import { LAST_UPDATED_LABEL } from "@/lib/briefing";
import { FONT_MONO } from "@/lib/utils";
import type { EconomyScope } from "@/lib/economy-view";

export default function EconomyHeader({ scope, eyebrow, title, description, onScopeChange }: {
  scope: EconomyScope; eyebrow: string; title: string; description: string;
  onScopeChange?: (scope: EconomyScope) => void;
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
      <div role="group" aria-label="Economy coverage" className="inline-flex max-w-full flex-wrap gap-1 rounded-xl border p-1" style={{ borderColor: "var(--color-space-border)", background: "var(--color-space-card)" }}>
        {([["global", "🌐", "Global"], ["us", "🇺🇸", "US"], ["canada", "🇨🇦", "Canada"]] as const).map(([id, flag, label]) => (
          <button key={id} type="button" aria-pressed={scope === id} aria-controls="economy-dashboard" disabled={!onScopeChange} onClick={() => onScopeChange?.(id)} className="min-h-11 rounded-lg px-4 py-2 text-xs font-semibold transition-colors sm:px-5"
            style={{ background: scope === id ? "var(--color-neon-cyan)" : "transparent", color: scope === id ? "var(--color-space-card)" : "var(--color-text-secondary)" }}><span aria-hidden>{flag}</span> {label}</button>
        ))}
      </div>
    </header>
  );
}
