"use client";

import { useMemo, useState } from "react";
import { DEFAULT_EQUITY, equityCsv, equitySensitivity, equityValue, solveEquity, terminalGrowth, validateEquity, type EquityInputs } from "@/lib/implied-equity";
import { action, panel, SimulationChart, SimulationExport, SimulationField, SimulationMetric, SimulationShell, SimulationToggle } from "./SimulationUI";

const percent = (v: number | null) => v === null ? "No solution" : `${(v * 100).toFixed(2)}%`;
type NumericKey = "price" | "eps" | "dps" | "growth" | "years" | "terminalGrowth" | "terminalRoe" | "riskFree" | "beta";

export default function ImpliedEquity() {
  const [x, setX] = useState<EquityInputs>({ ...DEFAULT_EQUITY });
  const [currency, setCurrency] = useState("INR");
  const error = validateEquity(x);
  const rate = useMemo(() => error ? null : solveEquity(x), [x, error]);
  const value = useMemo(() => rate === null ? null : equityValue(x, rate), [x, rate]);
  const sensitivity = useMemo(() => error ? null : equitySensitivity(x), [x, error]);
  const comparison = useMemo(() => error ? null : { linked: solveEquity({ ...x, linkRoe: true }), fixed: solveEquity({ ...x, linkRoe: false }) }, [x, error]);
  const curve = useMemo(() => {
    if (rate === null) return [];
    const lo = Math.max(terminalGrowth(x) + 0.002, rate * 0.65);
    const hi = Math.max(lo + 0.01, rate * 1.5);
    const rates = Array.from({ length: 51 }, (_, i) => lo + (hi - lo) * i / 50);
    rates.push(rate);
    return rates.sort((a,b) => a-b).map(r => ({ rate: r, value: equityValue(x, r).total }));
  }, [x, rate]);
  const money = (v: number) => new Intl.NumberFormat("en", { style: "currency", currency, maximumFractionDigits: 2 }).format(v);
  const field = (key: NumericKey, label: string, unit: string, hint: string, min = 0, max = 100, step: number | "any" = "any") =>
    <SimulationField key={key} id={`equity-${key}`} label={label} unit={unit} hint={hint} value={x[key]} min={min} max={max} step={step} optional={key === "beta"} onChange={v => setX(p => ({ ...p, [key]: key === "beta" ? v : v ?? NaN }))} />;
  const premium = rate === null ? null : rate - x.riskFree / 100;
  return <SimulationShell title="What return is priced in?" intro="Reverse a dividend-based equity valuation to solve the implied cost of equity. The result is the annual discount rate consistent with your share price, earnings and cash-flow assumptions.">
    <div className="grid items-start gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
      <aside className="order-2 min-w-0 rounded-2xl border border-space-border bg-space-card lg:order-1">
        <div className="border-b border-space-border p-6"><div className="flex items-center justify-between gap-3"><h2 className="text-sm font-semibold">Your assumptions</h2><button type="button" className="text-xs text-neon-cyan" onClick={() => setX({ ...DEFAULT_EQUITY })}>Reset</button></div><p className="mt-3 text-xs leading-relaxed text-text-secondary">Start with an illustrative example, then enter your own values. These inputs are unverified and do not represent current stock data or an earnings forecast.</p>
          <label className="mt-4 block text-xs" htmlFor="equity-currency">Display currency<select id="equity-currency" value={currency} onChange={e => setCurrency(e.target.value)} className="mt-2 w-full rounded-lg border border-space-border bg-space-void p-3">{["INR", "CAD", "USD", "EUR", "GBP", "AUD", "JPY"].map(c => <option key={c}>{c}</option>)}</select></label><p className="mt-2 text-[11px] text-text-secondary">Labels only; no conversion. All per-share values must use the same currency and share basis.</p>
        </div>
        <section className="space-y-5 border-b border-space-border p-6"><h3 className="text-sm font-semibold">Price & earnings</h3>
          {field("price", "Current share price", "/share", "Enter your own price; no quote is fetched.", 0.01, 1e9)}
          {field("eps", "Trailing annual EPS", "/share", "Positive earnings per share, consistent with price and any splits. Use one consistent accounting basis.", 0.01, 1e9)}
          {field("dps", "Annual dividend per share", "/share", "Zero is allowed. Explicit payout = dividend / EPS, held constant during the forecast.", 0, 1e9)}
          {field("growth", "EPS growth during forecast", "%/yr", "A constant annual assumption, not consensus. Change this to test your own outlook.", -99)}
          {field("years", "Explicit forecast period", "years", "Dividends are paid at each year-end; terminal value is measured at the final forecast year.", 1, 20, 1)}
        </section>
        <section className="space-y-5 border-b border-space-border p-6"><h3 className="text-sm font-semibold">Long-run assumptions</h3>
          {field("riskFree", "Risk-free rate", "%/yr", "Your government-bond yield assumption in the stock’s currency. No market yield is fetched.")}
          <SimulationToggle label="Perpetual growth equals risk-free rate" hint="A modelling convention, not a forecast. Turn off to enter a separate growth rate." checked={x.linkGrowth} onChange={linkGrowth => setX(p => ({ ...p, linkGrowth }))} />
          {!x.linkGrowth && field("terminalGrowth", "Perpetual EPS growth", "%/yr", "Growth after the explicit period. Must stay below the solved discount rate.", -99)}
          <SimulationToggle label="Terminal ROE equals the implied rate" hint="Default: new investment earns its required return. Terminal value simplifies to next-year EPS / implied rate." checked={x.linkRoe} onChange={linkRoe => setX(p => ({ ...p, linkRoe }))} />
          {!x.linkRoe && field("terminalRoe", "Terminal return on new investment", "%/yr", "Held constant forever. Must be positive and at least perpetual growth; higher ROE can materially increase the implied rate.", 0.01, 150)}
        </section>
        <details className="p-6"><summary className="cursor-pointer text-sm font-semibold">Optional beta cross-check</summary><div className="mt-5">{field("beta", "Equity beta (optional)", "×", "Blank by default. Used only to divide the implied premium by beta; it does not change the valuation or provide a CAPM estimate.", 0.01, 10)}</div></details>
      </aside>
      <div className="order-1 min-w-0 space-y-5 lg:order-2">
        {error ? <p role="alert" className={`${panel} text-market-down`}>{error}</p> : <>
          {rate === null ? <section className={panel} role="status"><h2 className="text-2xl font-semibold">No solution in the search range</h2><p className="mt-3 text-sm leading-relaxed text-text-secondary">No valid implied rate matches this price between {percent(Math.max(terminalGrowth(x) + 0.000001, 0.0001))} and 150%. This does not mean the investment has no return. Revisit the price, growth, payout or terminal assumptions.</p></section> : value && <>
            <section className={panel} style={{ background: "var(--color-wash)" }} aria-live="polite">
              <p className="text-xs uppercase tracking-widest text-neon-cyan">Implied cost of equity · Your forecast</p>
              <h2 className="mt-3 font-mono text-5xl font-semibold tracking-tight sm:text-6xl">{percent(rate)}</h2>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-text-secondary">The discount rate that makes your projected dividends and terminal value equal {money(x.price)} per share. It is conditional on the forecast, not a promised or independently estimated future return.</p>
              <div className="mt-6 grid grid-cols-2 gap-5 border-t border-space-border pt-5">
                <SimulationMetric label="Implied equity risk premium" value={`${((premium ?? 0) * 100).toFixed(2)} pp`} note={`Above your ${x.riskFree.toFixed(2)}% risk-free assumption.`} />
                <SimulationMetric label="Price from terminal value" value={`${(value.terminalPresentValue / x.price * 100).toFixed(1)}%`} note={`Value after year ${x.years}; especially sensitive to long-run assumptions.`} />
                <SimulationMetric label="Explicit dividend payout" value={`${(x.dps / x.eps * 100).toFixed(1)}%`} />
                <SimulationMetric label="Premium per unit of beta" value={x.beta === null ? "Beta not entered" : `${((premium ?? 0) / x.beta * 100).toFixed(2)} pp`} note="A ratio, not a CAPM required return." />
              </div>
            </section>
            <section className={panel}><h3 className="text-lg font-semibold">Where value meets price</h3><SimulationChart labels={curve.map(p => percent(p.rate))} rates={curve.map(p => p.rate)} series={[{ name: "Model value per share", values: curve.map(p => p.value) }, { name: "Entered share price", values: curve.map(() => x.price) }]} format={money} description={`Model value falls as the discount rate rises and crosses the entered share price at ${percent(rate)}. Horizontal axis: annual discount rate.`} /><p className="mt-2 text-xs text-text-secondary">Horizontal axis: annual discount rate. The intersection is {percent(rate)}. Values use {x.linkRoe ? "terminal ROE equal to each tested discount rate" : `fixed ${x.terminalRoe}% terminal ROE`}.</p></section>
            <section className={panel}><h3 className="font-semibold">What makes up the price?</h3><div className="mt-5 grid grid-cols-2 gap-5"><SimulationMetric label={`PV of years 1–${x.years} dividends`} value={money(value.explicitValue)} /><SimulationMetric label="PV of terminal value" value={money(value.terminalPresentValue)} /></div>
              <div className="mt-5 flex h-3 overflow-hidden rounded-full bg-space-void" role="img" aria-label={`${(value.explicitValue / x.price * 100).toFixed(1)}% explicit dividends and ${(value.terminalPresentValue / x.price * 100).toFixed(1)}% terminal value`}><div className="bg-neon-cyan" style={{ width: `${value.explicitValue / x.price * 100}%` }} /><div className="bg-neon-purple" style={{ width: `${value.terminalPresentValue / x.price * 100}%` }} /></div>
              <div className="mt-4 grid grid-cols-3 gap-3 text-xs text-text-secondary"><p>P/E<br /><span className="mt-1 block font-mono text-text-primary">{(x.price / x.eps).toFixed(2)}×</span></p><p>Earnings yield<br /><span className="mt-1 block font-mono text-text-primary">{percent(x.eps / x.price)}</span></p><p>Dividend yield<br /><span className="mt-1 block font-mono text-text-primary">{percent(x.dps / x.price)}</span></p></div>
            </section>
          </>}
          {comparison && <section className={panel}><h3 className="font-semibold">The terminal assumption matters</h3><div className="mt-5 grid gap-6 sm:grid-cols-2"><SimulationMetric label="Terminal ROE = implied rate" value={percent(comparison.linked)} note="New reinvestment adds no excess return. This is the default assumption." /><SimulationMetric label={`Terminal ROE = ${x.terminalRoe}%`} value={percent(comparison.fixed)} note="Fixed return on new investment forever. The inactive ROE input is preserved when switching modes." /></div><button type="button" className={`${action} mt-5`} onClick={() => setX(p => ({ ...p, linkRoe: !p.linkRoe }))}>Use {x.linkRoe ? "fixed terminal ROE" : "ROE equal to implied rate"}</button></section>}
          {sensitivity && <section className={panel}><h3 className="font-semibold">Growth sensitivity</h3><p className="mt-2 text-xs leading-relaxed text-text-secondary">Implied annual rate as explicit EPS growth (rows) and perpetual growth (columns) change. Terminal ROE uses your selected mode. Select a valid cell to apply both growth assumptions and unlink perpetual growth from the risk-free rate.</p><div className="mt-5 overflow-x-auto"><table className="w-full min-w-[500px] text-xs"><caption className="sr-only">Implied rate by EPS growth and perpetual growth</caption><thead><tr><th className="p-2 text-left">EPS / perpetual</th>{sensitivity.terminalRates.map(g => <th key={g} className="p-2 text-right">{g.toFixed(2)}%</th>)}</tr></thead><tbody>{sensitivity.rates.map((row,i) => <tr key={i} className="border-t border-space-border"><th scope="row" className="p-2 text-left font-normal">{sensitivity.growthRates[i].toFixed(1)}%</th>{row.map((r,j) => <td key={j} className="p-1 text-right"><button type="button" disabled={r === null} aria-label={`Apply EPS growth ${sensitivity.growthRates[i]}% and perpetual growth ${sensitivity.terminalRates[j].toFixed(2)}%, implied rate ${percent(r)}`} onClick={() => setX(p => ({ ...p, growth: sensitivity.growthRates[i], terminalGrowth: sensitivity.terminalRates[j], linkGrowth: false }))} className={`w-full rounded-lg px-2 py-3 font-mono hover:bg-space-void disabled:cursor-default disabled:text-text-muted ${i === 2 && j === 2 ? "bg-space-void text-neon-cyan" : ""}`}>{r === null ? "—" : percent(r)}</button></td>)}</tr>)}</tbody></table></div><p className="mt-3 text-[11px] text-text-secondary">A dash means invalid assumptions or no solution within the search range. Each cell changes only the two growth inputs.</p></section>}
          <details className={panel}><summary className="cursor-pointer font-semibold">Forecast cash flows & export</summary>{value && <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[400px] text-xs"><caption className="sr-only">Explicit-period per-share dividends and their present values</caption><thead><tr>{["Year", "EPS", "Dividend", "PV dividend"].map(label => <th key={label} className="p-2 text-right first:text-left">{label}</th>)}</tr></thead><tbody>{value.cashflows.map(p => <tr key={p.year} className="border-t border-space-border"><th className="p-2 text-left font-normal">{p.year}</th>{[p.eps, p.dividend, p.presentValue].map((v,i) => <td key={i} className="p-2 text-right font-mono">{money(v)}</td>)}</tr>)}</tbody></table><p className="mt-4 text-xs text-text-secondary">Terminal payout: {(value.terminalPayout * 100).toFixed(2)}%. Terminal value at year {x.years}: {money(value.terminalValue)}.</p></div>}<SimulationExport csv={equityCsv(x, currency)} filename="implied-cost-of-equity" /></details>
        </>}
        <details className={panel}><summary className="cursor-pointer font-semibold">Method, interpretation & limits</summary><div className="mt-4 space-y-3 text-xs leading-relaxed text-text-secondary">
          <p>EPS grows at your explicit rate for 1–20 years. Annual dividends equal EPS × the starting dividend/EPS ratio. A zero dividend produces no explicit-period cash flow; earnings support the terminal value through the assumed mature payout.</p>
          <p>Terminal payout = 1 − perpetual growth / terminal ROE. Terminal value = next-year EPS × terminal payout / (discount rate − perpetual growth). If terminal ROE equals the solved rate, this simplifies to next-year EPS / rate. The rate must still exceed perpetual growth and zero for the underlying mature payout model to be valid.</p>
          <p>The calculator solves price = present value of explicit dividends + present value of terminal value using bisection between the larger of perpetual growth + 0.0001 percentage point and 0.01%, and 150%. It reports no solution when that valid interval does not bracket the price. Negative earnings, payouts above 100%, and negative terminal payouts are not supported.</p>
          <p>The implied premium is the solved rate minus the entered risk-free rate. Dividing by optional beta is a cross-check only. Price, EPS, dividends, share count adjustments, accounting basis, risk-free yield and beta must be verified independently. No quote, analyst forecast or beta is fetched.</p>
          <p>A large terminal share means the result depends heavily on distant cash flows. Higher implied return can reflect forecast optimism; the model cannot identify mispricing independently of growth assumptions. It assumes constant payout, one discount rate, an immediate transition to perpetual growth, and no explicit capital-retention constraint. Banks may require a book-value and residual-income model; that model is not included here.</p>
          <p>Starting values are an unverified numerical example, without a claim about any company’s current valuation. This is an educational scenario tool, not an investment recommendation. Calculator inputs are not saved or transmitted.</p>
        </div></details>
      </div>
    </div>
  </SimulationShell>;
}
