"use client";

import { useState } from "react";
import type { EconomicIndicator, YieldCurve } from "@/types";
import { formatEconomicValue, getChangeColor, FONT_MONO } from "@/lib/utils";
import { ECONOMY_HEADLINES, economyCategories, economicPeriod, economicUnit, economicDeltaUnit, economicTitle, economicTimestamp, economicObservationLabel, type EconomyScope } from "@/lib/economy-view";
import EconomicChart from "./EconomicChart";
import YieldCurveChart from "./YieldCurveChart";

function RecentTrend({ indicator }: { indicator: EconomicIndicator }) {
  const points = indicator.timeSeries.slice(-12);
  if (points.length < 2) return <span className="text-xs">Insufficient history</span>;
  const times = points.map(p => economicTimestamp(p.date));
  const values = points.map(p => p.value);
  const low = Math.min(...values), high = Math.max(...values);
  const path = points.map((p, index) => `${index ? "L" : "M"}${2 + (times[index] - times[0]) / (times.at(-1)! - times[0] || 1) * 116},${30 - (p.value - low) / (high - low || 1) * 26}`).join(" ");
  return <div className="w-[120px]">
    <svg viewBox="0 0 120 34" className="h-9 w-full" role="img" aria-label={`${indicator.name}, ${points.length} observations: ${economicObservationLabel(indicator, points[0].date)} to ${economicObservationLabel(indicator, points.at(-1)!.date)}`}><path d={path} fill="none" stroke="var(--color-neon-cyan)" strokeWidth="1.7" /></svg>
    <p className="text-[9px]" style={{ color: "var(--color-text-muted)", fontFamily: FONT_MONO }}>{points[0].date} — {points.at(-1)!.date}</p>
  </div>;
}

export default function EconomyDashboard({ indicators, scope, curve }: { indicators: EconomicIndicator[]; scope: EconomyScope; curve?: YieldCurve }) {
  const categories = economyCategories(scope).filter(c => indicators.some(i => i.category === c.id) || (c.id === "rates" && curve));
  const [requestedCategory, setCategory] = useState<string>(categories[0]?.id ?? "all");
  const category = requestedCategory === "all" || categories.some(c => c.id === requestedCategory)
    ? requestedCategory : categories[0]?.id ?? "all";
  const [selected, setSelected] = useState<string | null>(null);
  const shown = indicators.filter(i => category === "all" || i.category === category).sort((a, b) =>
    categories.findIndex(c => c.id === a.category) - categories.findIndex(c => c.id === b.category)
    || a.country.localeCompare(b.country, "en") || a.name.localeCompare(b.name, "en"));
  const showCurve = !!curve && (category === "all" || category === "rates");
  const title = category === "all" ? "All indicators" : categories.find(c => c.id === category)?.label;
  const selectedId = shown.some(i => i.id === selected) || (selected === "yield-curve" && showCurve) ? selected : shown[0]?.id ?? (showCurve ? "yield-curve" : null);
  const focused = shown.find(i => i.id === selectedId);
  function selectIndicator(id: string) {
    setSelected(id);
    if (window.matchMedia("(max-width: 1279px)").matches) {
      const panel = document.getElementById("economy-focus");
      panel?.focus({ preventScroll: true });
      panel?.scrollIntoView({ block: "start" });
    }
  }
  return (
    <div id="economy-dashboard" data-economy-scope={scope} className="space-y-6">
      <section aria-label="Headline indicators" className="grid grid-cols-2 overflow-hidden rounded-lg border lg:grid-cols-4" style={{ borderColor: "var(--color-space-border)", background: "var(--color-space-card)" }}>
        {ECONOMY_HEADLINES[scope].map(({ id, label }, index) => {
          const i = indicators.find(i => i.id === id);
          if (!i) return null;
          return (
            <div key={id} className={`min-w-0 p-4 sm:p-5 ${index < 2 ? "border-b lg:border-b-0" : ""} ${index % 2 === 0 ? "border-r" : "lg:border-r"} last:border-r-0`} style={{ borderColor: "var(--color-space-border)" }}>
              <p className="text-xs font-medium" style={{ color: "var(--color-text-secondary)" }}>{label}</p>
              <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1" style={{ fontFamily: FONT_MONO }}>
                <strong className="text-2xl tracking-tight sm:text-3xl" style={{ color: "var(--color-text-primary)" }}>{formatEconomicValue(i.value, i.category, i.unit)}</strong>
                <span className="text-[11px]" style={{ color: "var(--color-text-muted)" }}>{economicUnit(i)}</span>
              </div>
              <p className="mt-2 text-[11px]" style={{ color: "var(--color-text-muted)", fontFamily: FONT_MONO }}>{economicPeriod(i)}</p>
              <p className={`mt-1 text-[11px] ${getChangeColor(i.change, i.isPositiveGood)}`} style={{ fontFamily: FONT_MONO }}>{i.change > 0 ? "+" : i.change < 0 ? "−" : ""}{formatEconomicValue(Math.abs(i.change), i.category, i.unit)} {economicDeltaUnit(i)} vs prior</p>
            </div>
          );
        })}
      </section>
      <section aria-label="Economic indicators" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-3">
          <div role="group" aria-label="Indicator categories" className="flex flex-wrap gap-1.5">
            {[...categories, { id: "all", label: "All" }].map(c => {
              const active = c.id === category;
              return <button key={c.id} type="button" aria-pressed={active} onClick={() => { setCategory(c.id); setSelected(null); }} className="min-h-10 rounded-md border px-3 py-2 text-xs font-semibold transition-colors" style={{ background: active ? "var(--color-neon-cyan)" : "var(--color-space-card)", color: active ? "var(--color-space-card)" : "var(--color-text-secondary)", borderColor: active ? "var(--color-neon-cyan)" : "var(--color-space-border)" }}>{c.label}</button>;
            })}
          </div>
          <p aria-live="polite" className="text-[11px]" style={{ color: "var(--color-text-muted)", fontFamily: FONT_MONO }}>{shown.length} {shown.length === 1 ? "indicator" : "indicators"}{showCurve ? " + yield curve" : ""}</p>
        </div>
        <h2 className="sr-only">{title}</h2>
        <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <div className="min-w-0 overflow-hidden rounded-lg border" style={{ borderColor: "var(--color-space-border)", background: "var(--color-space-card)" }}>
            <div className="border-b px-4 py-3" style={{ borderColor: "var(--color-space-border)" }}><h3 className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>{title}</h3><p className="mt-1 text-[11px]" style={{ color: "var(--color-text-muted)" }}>Select an indicator to explore its history and context.</p></div>
            <table className="w-full text-left">
              <caption className="sr-only">{title}: latest readings and recent observations</caption>
              <thead style={{ color: "var(--color-text-muted)", background: "var(--color-wash)" }}><tr className="text-[10px] uppercase tracking-wide"><th scope="col" className="px-4 py-3 font-medium">Indicator / period</th><th scope="col" className="px-3 py-3 text-right font-medium">Latest / change</th><th scope="col" className="hidden px-4 py-3 font-medium sm:table-cell">Recent trend</th></tr></thead>
              <tbody>
                {shown.map(i => <tr key={i.id} data-economy-row={i.id} className="border-t" style={{ borderColor: "var(--color-space-border)", background: selectedId === i.id ? "var(--color-wash)" : undefined }}>
                  <th scope="row" className="max-w-0 px-4 py-3 font-normal"><button type="button" aria-pressed={selectedId === i.id} aria-controls="economy-focus" onClick={() => selectIndicator(i.id)} className="min-h-11 w-full text-left"><span className="block text-xs font-semibold leading-5" style={{ color: selectedId === i.id ? "var(--color-neon-cyan)" : "var(--color-text-primary)" }}><span aria-hidden>{i.flag}</span> {economicTitle(i)} <span aria-hidden>{selectedId === i.id ? "↗" : "→"}</span></span><span className="mt-1 block text-[10px] leading-4" style={{ color: "var(--color-text-muted)" }}>{scope === "global" ? `${i.country} · ` : ""}{economicPeriod(i)}</span></button></th>
                  <td className="px-3 py-3 text-right align-middle" style={{ fontFamily: FONT_MONO }}><strong className="block text-sm" style={{ color: "var(--color-text-primary)" }}>{formatEconomicValue(i.value, i.category, i.unit)}</strong><span className="block text-[9px] leading-4" style={{ color: "var(--color-text-muted)" }}>{economicUnit(i)}</span><span className={`mt-1 block text-[10px] ${getChangeColor(i.change, i.isPositiveGood)}`}>{i.change > 0 ? "+" : i.change < 0 ? "−" : ""}{formatEconomicValue(Math.abs(i.change), i.category, i.unit)} {economicDeltaUnit(i)}</span></td>
                  <td className="hidden px-4 py-3 sm:table-cell"><RecentTrend indicator={i} /></td>
                </tr>)}
                {showCurve && curve && <tr data-economy-row="yield-curve" className="border-t" style={{ borderColor: "var(--color-space-border)", background: selectedId === "yield-curve" ? "var(--color-wash)" : undefined }}><th scope="row" className="px-4 py-3 font-normal"><button type="button" aria-pressed={selectedId === "yield-curve"} aria-controls="economy-focus" onClick={() => selectIndicator("yield-curve")} className="min-h-11 w-full text-left"><span className="text-xs font-semibold" style={{ color: "var(--color-neon-cyan)" }}>{curve.flag} {curve.short.label}/{curve.long.label} yield curve →</span><span className="mt-1 block text-[10px]" style={{ color: "var(--color-text-muted)" }}>{curve.asOf}</span></button></th><td className="px-3 py-3 text-right" style={{ fontFamily: FONT_MONO }}><strong className="text-sm">{curve.spreadBps >= 0 ? "+" : ""}{curve.spreadBps} bp</strong><span className="block text-[9px]" style={{ color: "var(--color-text-muted)" }}>long − short</span></td><td className="hidden px-4 py-3 text-[10px] sm:table-cell" style={{ color: "var(--color-text-muted)" }}>{curve.spreadBps < 0 ? "Inverted" : "Upward sloping"}</td></tr>}
              </tbody>
            </table>
          </div>
          <section id="economy-focus" tabIndex={-1} aria-label="Indicator in focus" className="min-w-0 scroll-mt-24 xl:sticky xl:top-24">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.15em]" style={{ color: "var(--color-text-muted)" }}>Indicator in focus</p>
            {focused && <EconomicChart key={focused.id} indicator={focused} />}
            {selectedId === "yield-curve" && curve && <YieldCurveChart key={`${curve.country}-curve`} curve={curve} />}
          </section>
        </div>
        <p className="text-[11px] leading-5" style={{ color: "var(--color-text-muted)" }}>Changes compare with the previous published observation. Percentage-rate changes are in percentage points (pp). Trends show up to 12 recent observations on individual scales. History ranges cover the available observations shown in each panel.</p>
      </section>
    </div>
  );
}
