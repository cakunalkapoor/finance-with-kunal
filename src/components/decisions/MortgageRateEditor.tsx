"use client";

import { useEffect, useMemo, useRef, useState, type PointerEvent, type KeyboardEvent } from "react";
import { modelHousing, type HousingInputs } from "@/lib/housing-model";

type Props = { inputs: HousingInputs; currency: string; onChange: (inputs: HousingInputs) => void };
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const roundRate = (rate: number) => Math.round(clamp(rate, 0, 100) * 10) / 10;

export default function MortgageRateEditor({ inputs, currency, onChange }: Props) {
  const svg = useRef<SVGSVGElement>(null);
  const dragging = useRef<number | null>(null);
  const [width, setWidth] = useState(800);
  const [selectedYear, setSelectedYear] = useState(1);
  const [scale, setScale] = useState(10);
  const endYear = inputs.amortization;
  // The editor previews the full mortgage, independently of the comparison stay.
  const points = useMemo(() => modelHousing({ ...inputs, years: inputs.amortization }).points, [inputs]);
  const handles = [{ year: 1, rate: inputs.mortgageRate }, ...inputs.mortgageRateChanges.filter(p => p.year <= endYear)].sort((a, b) => a.year - b.year);
  const maximum = Math.max(scale, Math.ceil(Math.max(...handles.map(p => p.rate)) / 5) * 5);
  const left = 48, right = width - 24, top = 28, bottom = 266;
  const x = (year: number) => left + (year - 1) / Math.max(1, endYear - 1) * (right - left);
  const y = (rate: number) => bottom - rate / maximum * (bottom - top);
  const active = handles.find(p => p.year === selectedYear) ?? handles[0];
  const payment = points[active.year - 1]?.monthlyMortgagePayment ?? 0;
  const hiddenChanges = inputs.mortgageRateChanges.filter(p => p.year > endYear).length;
  const path = handles.reduce((d, point, i) => i === 0 ? `M ${x(point.year)} ${y(point.rate)}` : `${d} H ${x(point.year)} V ${y(point.rate)}`, "") + ` H ${right}`;
  const yearStep = Math.max(1, Math.ceil(endYear / Math.max(2, Math.floor((right - left) / 70))));
  const years = Array.from(new Set([1, ...Array.from({ length: Math.floor(endYear / yearStep) }, (_, i) => (i + 1) * yearStep), endYear])).sort((a, b) => a - b);

  useEffect(() => {
    const element = svg.current;
    if (!element) return;
    const observer = new ResizeObserver(entries => setWidth(Math.max(1, entries[0].contentRect.width)));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  function updatePoint(oldYear: number, requestedYear: number, requestedRate: number) {
    const rate = roundRate(requestedRate);
    if (oldYear === 1) {
      onChange({ ...inputs, mortgageRate: rate });
      return 1;
    }
    // Keep renewal points ordered and unique, including any outside the view.
    const others = [1, ...inputs.mortgageRateChanges.filter(p => p.year !== oldYear).map(p => p.year)].sort((a, b) => a - b);
    const previous = Math.max(...others.filter(year => year < oldYear));
    const next = others.find(year => year > oldYear) ?? endYear + 1;
    const year = clamp(Math.round(requestedYear), previous + 1, Math.min(endYear, next - 1));
    onChange({ ...inputs, mortgageRateChanges: inputs.mortgageRateChanges.map(p => p.year === oldYear ? { year, rate } : p) });
    return year;
  }
  function location(event: PointerEvent<SVGElement>) {
    const matrix = svg.current?.getScreenCTM();
    if (!matrix) return null;
    const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
    return { plotX: point.x, plotY: point.y,
      year: clamp(Math.round(1 + (point.x - left) / (right - left) * Math.max(1, endYear - 1)), 1, endYear),
      rate: roundRate((bottom - point.y) / (bottom - top) * maximum) };
  }
  function begin(event: PointerEvent<SVGElement>, year: number) {
    if (event.button !== 0) return;
    event.preventDefault(); event.stopPropagation();
    dragging.current = year; setSelectedYear(year);
    svg.current?.setPointerCapture(event.pointerId);
  }
  function beginOnPlot(event: PointerEvent<SVGSVGElement>) {
    if (event.button !== 0) return;
    const point = location(event);
    if (!point || point.plotX < left || point.plotX > right || point.plotY < top || point.plotY > bottom) return;
    const existing = handles.find(p => p.year === point.year);
    if (existing) updatePoint(existing.year, existing.year, point.rate);
    else onChange({ ...inputs, mortgageRateChanges: [...inputs.mortgageRateChanges, { year: point.year, rate: point.rate }] });
    begin(event, point.year);
  }
  function move(event: PointerEvent<SVGSVGElement>) {
    if (dragging.current === null) return;
    const point = location(event);
    if (!point) return;
    const year = updatePoint(dragging.current, point.year, point.rate);
    dragging.current = year; setSelectedYear(year);
  }
  function finish(event: PointerEvent<SVGSVGElement>) {
    if (dragging.current !== null) move(event);
    dragging.current = null;
    if (svg.current?.hasPointerCapture(event.pointerId)) svg.current.releasePointerCapture(event.pointerId);
  }
  function removeSelected() {
    if (active.year === 1) return;
    onChange({ ...inputs, mortgageRateChanges: inputs.mortgageRateChanges.filter(p => p.year !== active.year) });
    setSelectedYear(1);
  }
  function key(event: KeyboardEvent<SVGCircleElement>, point: { year: number; rate: number }) {
    const increment = event.shiftKey ? 1 : 0.1;
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
      event.preventDefault();
      const year = updatePoint(point.year, point.year + (event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0), point.rate + (event.key === "ArrowUp" ? increment : event.key === "ArrowDown" ? -increment : 0));
      setSelectedYear(year);
    } else if ((event.key === "Delete" || event.key === "Backspace") && point.year !== 1) {
      event.preventDefault();
      onChange({ ...inputs, mortgageRateChanges: inputs.mortgageRateChanges.filter(p => p.year !== point.year) });
      setSelectedYear(1);
    }
  }
  function addPoint() {
    const used = new Set(inputs.mortgageRateChanges.map(p => p.year));
    const year = Array.from({ length: Math.max(0, endYear - 1) }, (_, i) => i + 2).find(year => year >= 6 && !used.has(year)) ?? Array.from({ length: Math.max(0, endYear - 1) }, (_, i) => i + 2).find(year => !used.has(year));
    if (year === undefined) return;
    const rate = handles.filter(p => p.year < year).at(-1)?.rate ?? inputs.mortgageRate;
    onChange({ ...inputs, mortgageRateChanges: [...inputs.mortgageRateChanges, { year, rate }] }); setSelectedYear(year);
  }

  return <div className="mt-5">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h3 className="text-sm font-semibold">Shape your mortgage rate path</h3>
      <label className="flex items-center gap-2 text-xs text-text-secondary">Rate axis maximum
        <select aria-label="Rate chart axis maximum" value={scale} onChange={e => setScale(Number(e.target.value))} className="rounded-md border border-space-border bg-space-void px-2 py-1">{[10, 20, 50, 100].map(value => <option key={value} value={value}>{value}%</option>)}</select>
      </label>
    </div>
    <p id="rate-chart-help" className="mt-2 text-xs leading-relaxed text-text-secondary">Drag a point up or down to change its rate, or left or right to change the renewal year. Click an empty year to add a point. Flat segments keep the rate constant until the next renewal.</p>
    <svg ref={svg} viewBox={`0 0 ${width} 320`} className="mt-3 block w-full rounded-lg border border-space-border bg-space-void" style={{ height: 320, touchAction: "none" }} role="group" aria-label="Interactive mortgage rate line chart" aria-describedby="rate-chart-help" onPointerDown={beginOnPlot} onPointerMove={move} onPointerUp={finish} onPointerCancel={() => { dragging.current = null; }} onLostPointerCapture={() => { dragging.current = null; }}>
      {[0, 1, 2, 3, 4].map(tick => { const rate = tick * maximum / 4; return <g key={tick} pointerEvents="none"><line x1={left} x2={right} y1={y(rate)} y2={y(rate)} stroke="var(--color-space-border)" /><text x={left - 9} y={y(rate) + 4} textAnchor="end" fontSize="11" fill="var(--color-text-muted)">{rate.toFixed(rate % 1 ? 1 : 0)}%</text></g>; })}
      {years.map(year => <g key={year} pointerEvents="none"><line x1={x(year)} x2={x(year)} y1={top} y2={bottom} stroke="var(--color-space-border)" strokeDasharray="3 5" /><text x={x(year)} y={bottom + 22} textAnchor="middle" fontSize="11" fill="var(--color-text-muted)">{year}</text></g>)}
      <text x={(left + right) / 2} y="311" textAnchor="middle" fontSize="11" fill="var(--color-text-muted)" pointerEvents="none">Mortgage year · {endYear}-year repayment tenure</text>
      <path d={path} fill="none" stroke="var(--color-neon-cyan)" strokeWidth="3" pointerEvents="none" />
      {handles.map((point, index) => <g key={index}>
        <circle cx={x(point.year)} cy={y(point.rate)} r="18" fill="transparent" style={{ cursor: "grab" }} onPointerDown={e => begin(e, point.year)} />
        <circle cx={x(point.year)} cy={y(point.rate)} r={active.year === point.year ? 8 : 6} fill="var(--color-neon-cyan)" stroke="var(--color-space-card)" strokeWidth="3" role="button" tabIndex={0} aria-label={`Mortgage rate point year ${point.year}, ${point.rate.toFixed(1)} percent`} onFocus={() => setSelectedYear(point.year)} onKeyDown={e => key(e, point)} onPointerDown={e => begin(e, point.year)} style={{ cursor: "grab", outlineOffset: 4 }}>
          <title>{`Year ${point.year}: ${point.rate.toFixed(1)}%. Arrow keys adjust; Delete removes a renewal.`}</title>
        </circle>
        <text x={clamp(x(point.year), left + 28, right - 28)} y={Math.max(14, y(point.rate) - 16)} textAnchor="middle" fontSize="11" fill="var(--color-text-secondary)" pointerEvents="none">{point.rate.toFixed(1)}%</text>
      </g>)}
    </svg>
    <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
      <p aria-live="polite" className="text-xs text-text-secondary">Selected: year {active.year} · {active.rate.toFixed(1)}% · payment {new Intl.NumberFormat("en-CA", { style: "currency", currency, maximumFractionDigits: 0 }).format(payment)}/month</p>
      <div className="flex gap-2"><button onClick={addPoint} disabled={handles.length >= endYear} className="rounded-full border border-space-border px-3 py-2 text-xs hover:bg-space-dark disabled:opacity-40">Add point</button><button onClick={removeSelected} disabled={active.year === 1} className="rounded-full border border-space-border px-3 py-2 text-xs hover:bg-space-dark disabled:opacity-40">Remove selected point</button></div>
    </div>
    <p className="mt-2 text-[11px] leading-relaxed text-text-muted">Keyboard: Tab to a point, ↑/↓ adjusts by 0.1 percentage points (Shift: 1); ←/→ moves renewal years; Delete removes a renewal. The starting point stays in year 1. Use the precise rate inputs for exact values. The rate axis expands to fit higher entered rates. The chart spans your full mortgage tenure. Buy-versus-rent results cover your selected {inputs.years}-year stay; rate changes after that stay affect the comparison only if you extend it.{hiddenChanges > 0 ? ` ${hiddenChanges} change(s) after mortgage payoff remain in the precise inputs and are ignored.` : ""}</p>
  </div>;
}
