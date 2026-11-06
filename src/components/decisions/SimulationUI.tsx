"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import { CHART_COLORS, useTheme } from "@/lib/use-theme";

const Chart = dynamic(() => import("echarts-for-react"), { ssr: false });
export const panel = "min-w-0 rounded-2xl border border-space-border bg-space-card p-6 sm:p-7";
export const action = "rounded-full border border-space-border px-4 py-2 text-xs font-semibold hover:border-neon-cyan focus-visible:outline-2 focus-visible:outline-neon-cyan";

export function SimulationShell({ title, intro, children }: { title: string; intro: string; children: ReactNode }) {
  return <div className="section-shell py-10">
    <Link href="/decisions" className="text-sm text-text-secondary hover:text-neon-cyan">← All decisions</Link>
    <header className="my-7 border-b border-space-border pb-7">
      <p className="text-xs uppercase tracking-widest text-neon-cyan">Decision Studio</p>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl">{title}</h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-text-secondary">{intro}</p>
    </header>
    {children}
  </div>;
}

export function SimulationField({ id, label, unit, hint, value, onChange, min, max, step = "any", optional = false }: {
  id: string; label: string; unit: string; hint: string; value: number | null;
  onChange: (v: number | null) => void; min?: number; max?: number; step?: number | "any"; optional?: boolean;
}) {
  return <label htmlFor={id} className="block text-xs font-semibold">
    {label}
    <span className="mt-2 flex rounded-lg border border-space-border bg-space-void focus-within:border-neon-cyan">
      <input id={id} type="number" inputMode="decimal" value={value === null || Number.isNaN(value) ? "" : value}
        min={min} max={max} step={step} aria-describedby={`${id}-hint`}
        onChange={e => onChange(e.target.value === "" ? (optional ? null : NaN) : Number(e.target.value))}
        className="w-full min-w-0 bg-transparent p-3 font-mono text-sm outline-none" />
      <span className="self-center whitespace-nowrap pr-3 font-normal text-text-muted">{unit}</span>
    </span>
    <span id={`${id}-hint`} className="mt-1.5 block text-[11px] font-normal leading-relaxed text-text-secondary">{hint}</span>
  </label>;
}

export function SimulationToggle({ label, hint, checked, onChange }: { label: string; hint: string; checked: boolean; onChange: (v: boolean) => void }) {
  return <label className="flex cursor-pointer items-start gap-3 text-xs">
    <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-neon-cyan)]" />
    <span><span className="font-semibold">{label}</span><span className="mt-1 block text-[11px] leading-relaxed text-text-secondary">{hint}</span></span>
  </label>;
}

export function SimulationMetric({ label, value, note }: { label: string; value: string; note?: string }) {
  return <div className="min-w-0"><p className="text-xs text-text-secondary">{label}</p><p className="mt-2 break-words font-mono text-xl sm:text-2xl">{value}</p>{note && <p className="mt-2 text-[11px] leading-relaxed text-text-secondary">{note}</p>}</div>;
}

export function SimulationChart({ labels, series, format, description, rates }: { labels: string[]; series: { name: string; values: number[] }[]; format: (v: number) => string; description: string; rates?: number[] }) {
  const colors = CHART_COLORS[useTheme()];
  return <div role="img" aria-label={description} className="min-w-0">
    <Chart opts={{ renderer: "svg" }} notMerge style={{ height: 320 }} option={{
      color: [colors.series1, colors.series2, colors.up],
      tooltip: { trigger: "axis", valueFormatter: (v: unknown) => format(Number(v)), backgroundColor: colors.tooltipBg, borderColor: colors.tooltipBorder, textStyle: { color: colors.tooltipText }, confine: true },
      legend: { bottom: 0, textStyle: { color: colors.axisLabel }, type: "scroll" },
      grid: { left: 8, right: 12, top: 20, bottom: 60, containLabel: true },
      xAxis: rates
        ? { type: "value", min: rates[0], max: rates.at(-1), axisLabel: { color: colors.axisLabel, hideOverlap: true, formatter: (v: number) => `${(v * 100).toFixed(1)}%` }, axisPointer: { label: { formatter: (p: { value: number }) => `${(p.value * 100).toFixed(2)}%` } } }
        : { type: "category", data: labels, boundaryGap: false, axisLabel: { color: colors.axisLabel, hideOverlap: true } },
      yAxis: { type: "value", axisLabel: { color: colors.axisLabel, formatter: (v: number) => new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(v) }, splitLine: { lineStyle: { color: colors.grid } } },
      series: series.map(s => ({ name: s.name, type: "line", data: rates ? s.values.map((v,i) => [rates[i],v]) : s.values, showSymbol: labels.length === 1, lineStyle: { width: 3 } })),
    }} />
  </div>;
}

export function SimulationExport({ csv, filename }: { csv: string; filename: string }) {
  const id = `${filename}-csv`;
  return <div className="mt-5">
    <button type="button" className={action} onClick={() => {
      const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
      const a = document.createElement("a");
      a.href = url; a.download = `${filename}.csv`; document.body.appendChild(a); a.click(); a.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    }}>Download scenario CSV</button>
    <label htmlFor={id} className="mt-4 block text-xs text-text-secondary">Or copy the assumptions and calculations</label>
    <textarea id={id} readOnly value={csv} rows={4} onFocus={e => e.currentTarget.select()} className="mt-2 w-full rounded-lg border border-space-border bg-space-void p-3 font-mono text-[11px]" />
  </div>;
}
