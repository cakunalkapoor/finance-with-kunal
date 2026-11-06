"use client";

import { useMemo, useState } from "react";
import {
  modelVehicles, validateExpansion, vehicleMaintenancePresets,
  type Assumptions, type VehicleCostBreakdown,
} from "@/lib/expansion-models";
import { action, panel, SimulationChart, SimulationExport, SimulationField, SimulationShell } from "./SimulationUI";

const vehicles = [
  { key: "gas", label: "Gas" },
  { key: "hybrid", label: "Hybrid" },
  { key: "ev", label: "Electric" },
] as const;

const initial: Assumptions = {
  years: 8, km: 15000, fuel: 1.6,
  homeElectricity: 0.15, publicElectricity: 0.5, homeShare: 100,
  gasEfficiency: 8, hybridEfficiency: 5,
  evRange: 400, evBattery: 64, chargingEfficiency: 90,
  usdMultiplier: 1.35,
  hybridBatteryCost: 4725, evBatteryCost: 14175,
  hybridReserveYears: 15, evReserveYears: 15,
  gasPrice: 35000, hybridPrice: 40000, evPrice: 45000,
  gasResale: 10000, hybridResale: 12000, evResale: 14000,
  gasRebate: 0, hybridRebate: 0, evRebate: 0, charger: 0,
  ...vehicleMaintenancePresets(15000, 1.35),
  gasInsurance: 0, hybridInsurance: 0, evInsurance: 0,
};

const costRows: { label: string; key: keyof VehicleCostBreakdown; total?: boolean }[] = [
  { label: "Purchase minus resale¹", key: "netCapitalCost" },
  { label: "Fuel / electricity", key: "energyTotal" },
  { label: "Routine maintenance", key: "maintenanceTotal" },
  { label: "Insurance", key: "insuranceTotal" },
  { label: "Total ownership cost", key: "ownershipCost", total: true },
  { label: "Monthly average²", key: "monthlyCost", total: true },
];

export default function VehicleDecision() {
  const [x, setX] = useState<Assumptions>({ ...initial });
  const [currency, setCurrency] = useState("CAD");
  const error = validateExpansion(x, "vehicle");
  const result = useMemo(() => error ? null : modelVehicles(x), [x, error]);
  const costs = result?.vehicleCosts;
  const ranked = costs ? [...costs].sort((a, b) => a.ownershipCost - b.ownershipCost) : [];
  const advantage = ranked.length ? ranked[1].ownershipCost - ranked[0].ownershipCost : 0;
  const planningWinner = costs ? [...costs].sort((a, b) => a.planningCost - b.planningCost)[0] : null;
  const missingInsurance = vehicles.filter(v => x[`${v.key}Insurance`] === 0).map(v => v.label);
  const money = (v: number) => new Intl.NumberFormat("en-CA", { style: "currency", currency, maximumFractionDigits: 0 }).format(v);
  const evConsumption = x.evBattery / x.evRange / (x.chargingEfficiency / 100) * 100;
  const csv = result && costs ? [
    `Currency,${currency}`, "Assumption,Value",
    ...Object.entries(x).map(([key, value]) => `${key},${value}`),
    ...result.notes.map((note, i) => `Method ${i + 1},"${note.replaceAll('"', '""')}"`),
    "", ["Cost over comparison period", ...result.labels].join(","),
    ...[...costRows, { label: "Optional battery savings allowance", key: "batteryReserveTotal" as const },
      { label: "Cost plus savings allowance", key: "planningCost" as const }]
      .map(row => [row.label, ...costs.map(c => Number(c[row.key]).toFixed(2))].join(",")),
    "", ["Year", ...result.labels.map(l => `${l} ownership cost`), ...result.labels.map(l => `${l} cost plus battery savings`)].join(","),
    ...result.points.map(p => [p.year, ...p.values.map((v, i) => v - result.reserves![i] * p.year), ...p.values]
      .map(v => v.toFixed(2)).join(",")),
  ].join("\n") : "";

  function field(key: string, label: string, unit: string, hint: string, max?: number) {
    return <SimulationField key={key} id={`vehicle-${key}`} label={label} unit={unit} hint={hint}
      value={x[key]} min={key === "years" || key === "hybridReserveYears" || key === "evReserveYears" ? 1 : 0}
      max={max} step={key === "years" ? 1 : "any"}
      onChange={value => setX(p => ({ ...p, [key]: value ?? NaN }))} />;
  }

  return <SimulationShell title="Gas, hybrid or electric?" intro="What will each car cost over the years you keep it? Compare purchase price, running costs and resale using your own quotes.">
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <label className="text-xs" htmlFor="vehicle-currency">Currency
        <select id="vehicle-currency" value={currency} onChange={e => setCurrency(e.target.value)} className="ml-2 rounded-lg border border-space-border bg-space-card p-2">
          {["CAD", "USD", "EUR", "GBP", "INR", "AUD"].map(c => <option key={c}>{c}</option>)}
        </select><span className="ml-3 text-text-secondary">Labels only; no conversion.</span>
      </label>
      <button type="button" className={action} onClick={() => setX({ ...initial })}>Reset example</button>
    </div>

    <div className="grid items-start gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
      <aside className="order-2 min-w-0 space-y-5 lg:order-1" aria-label="Vehicle assumptions">
        <section className={panel}>
          <h2 className="text-lg font-semibold">Your driving</h2>
          <p className="mt-2 text-xs leading-relaxed text-text-secondary">Example inputs. Compare all three cars over the same distance and time.</p>
          <div className="mt-5 space-y-5">
            {field("years", "How long will you keep the car?", "years", "Update each resale estimate for this duration.", 40)}
            {field("km", "Annual driving distance", "km/yr", "Used for fuel and electricity costs.")}
          </div>
        </section>

        <section className={panel}>
          <h2 className="text-lg font-semibold">Fuel & charging</h2>
          <div className="mt-5 space-y-5">
            {field("fuel", "Gasoline price", `${currency}/L`, "Local price including tax.")}
            {field("homeElectricity", "Home electricity price", `${currency}/kWh`, "Extra cost per kWh on your bill, including charges.")}
            {field("publicElectricity", "Public charging price", `${currency}/kWh`, "Average price you expect to pay away from home.")}
            {field("homeShare", "Share of charging at home", "%", "The rest uses your public charging price.", 100)}
          </div>
        </section>

        <section id="vehicle-quotes" className={`${panel} scroll-mt-24`}>
          <h2 className="text-lg font-semibold">Your car quotes</h2>
          <p className="mt-2 text-xs leading-relaxed text-text-secondary">Cash purchase, including taxes and fees. Hybrid means a conventional hybrid, without a plug.</p>
          {vehicles.map(({ key, label }, i) => <div key={key} className="mt-6 space-y-5 border-t border-space-border pt-5">
            <h3 className="text-sm font-semibold text-neon-cyan">{label}</h3>
            {field(`${key}Price`, `${label} purchase price`, currency, "All-in price before rebates.")}
            {field(`${key}Resale`, `${label} resale after ${Number.isFinite(x.years) ? x.years : "…"} years`, currency, "Expected sale proceeds after selling fees.")}
            {i < 2 ? field(`${key}Efficiency`, `${label} fuel consumption`, "L/100 km", "Use the vehicle rating or your own estimate.") :
              <p className="text-xs leading-relaxed text-text-secondary">Electricity use: <span className="font-mono text-text-primary">{Number.isFinite(evConsumption) ? evConsumption.toFixed(1) : "—"} kWh/100 km</span>, including charging losses. Edit under EV energy details.</p>}
            {field(`${key}Insurance`, `${label} annual insurance`, `${currency}/yr`, "Your annual quote for the same driver and coverage.")}
          </div>)}
        </section>

        <details id="vehicle-maintenance" className={`${panel} scroll-mt-24`}>
          <summary className="cursor-pointer text-sm font-semibold">Maintenance & optional battery savings</summary>
          <p className="mt-4 text-xs leading-relaxed text-text-secondary">Routine maintenance uses historical US examples. Replace them with your expected annual bills.</p>
          <div className="mt-5 space-y-5">
            {vehicles.map(({ key, label }) => field(`${key}Maintenance`, `${label} routine maintenance`, `${currency}/yr`, "Servicing and routine repairs; exclude the separate battery allowance."))}
          </div>
          <h3 className="mt-7 text-sm font-semibold">Optional battery savings</h3>
          <p className="mt-2 text-xs leading-relaxed text-text-secondary">Money you choose to set aside, separate from ownership cost. This is not a predicted repair bill. Enter zero to exclude it; allow for warranty coverage.</p>
          <div className="mt-5 space-y-5">
            {field("hybridBatteryCost", "Hybrid battery replacement budget", currency, "4,725 is a planning example, not a repair quote.")}
            {field("hybridReserveYears", "Hybrid savings funding period", "years", "Budget ÷ funding years = annual savings allowance. Not battery life.")}
            {field("evBatteryCost", "Electric battery replacement budget", currency, "14,175 is a planning example, not a repair quote.")}
            {field("evReserveYears", "Electric savings funding period", "years", "Budget ÷ funding years = annual savings allowance. Not battery life.")}
          </div>
        </details>

        <details className={panel}>
          <summary className="cursor-pointer text-sm font-semibold">EV energy details</summary>
          <p className="mt-4 text-xs leading-relaxed text-text-secondary">Battery capacity and realistic range should describe the same car and driving conditions.</p>
          <div className="mt-5 space-y-5">
            {field("evRange", "Range per full charge", "km", "Expected distance from full to empty, including weather effects.")}
            {field("evBattery", "Usable battery capacity", "kWh", "Use usable capacity, rather than gross advertised capacity.")}
            {field("chargingEfficiency", "Charging efficiency", "%", "90% means 10% of electricity from the wall is lost while charging.", 100)}
          </div>
        </details>

        <details className={panel}>
          <summary className="cursor-pointer text-sm font-semibold">Rebates & charger installation</summary>
          <div className="mt-5 space-y-5">
            {vehicles.map(({ key, label }) => field(`${key}Rebate`, `${label} confirmed rebate`, currency, "A confirmed incentive received at purchase."))}
            {field("charger", "EV charging setup", currency, "Charger and installation, paid once upfront.")}
          </div>
        </details>

        <details className={panel}>
          <summary className="cursor-pointer text-sm font-semibold">Historical maintenance presets</summary>
          <p className="mt-4 text-xs leading-relaxed text-text-secondary">Argonne’s 2021 US benchmarks, converted for your mileage. No inflation adjustment. These are not current local quotes.</p>
          <div className="mt-5">{field("usdMultiplier", "Currency units per US dollar", "×", "1.35 is illustrative, not a live exchange rate. Used only by the reload button.")}</div>
          <button type="button" disabled={!!error} className={`${action} mt-5 disabled:opacity-50`} onClick={() => setX(p => ({ ...p, ...vehicleMaintenancePresets(p.km, p.usdMultiplier) }))}>Reload maintenance for current km</button>
          <p className="mt-3 text-xs leading-relaxed text-text-secondary">Replaces the three maintenance amounts. Other inputs stay as entered. Mileage changes do not automatically replace your annual maintenance budget.</p>
        </details>
      </aside>

      <div className="order-1 min-w-0 space-y-5 lg:order-2">
        {error ? <p role="alert" className="rounded-2xl border border-market-down p-6 text-sm text-market-down">{error}</p> : result && costs && <>
          <section className={panel} style={{ background: "var(--color-wash)" }}>
            <p className="text-xs uppercase tracking-widest text-neon-cyan">Over {x.years} years · {currency} · Your assumptions</p>
            <h2 className="mt-4 text-2xl font-semibold leading-tight sm:text-3xl">{advantage < 1 ? "The two lowest-cost options are about equal." : `${ranked[0].label} costs ${money(advantage)} less than the next option.`}</h2>
            <p className="mt-4 text-sm leading-relaxed text-text-secondary">Purchase minus resale + fuel or electricity + routine maintenance + insurance. Optional battery savings are shown separately below.</p>
          </section>

          <section className="min-w-0 overflow-hidden rounded-2xl border border-space-border bg-space-card">
            <div className="p-5 sm:p-7">
              <h2 className="text-lg font-semibold">Where the money goes</h2>
              <p id="vehicle-table-description" className="mt-2 text-xs leading-relaxed text-text-secondary">All amounts cover the full {x.years} years, except the monthly average.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm" aria-describedby="vehicle-table-description">
                <thead><tr className="border-y border-space-border bg-space-void">
                  <th scope="col" className="w-[34%] px-3 py-4 text-left font-medium sm:px-5">Cost</th>
                  {costs.map(c => <th scope="col" key={c.key} className="px-1 py-4 text-right font-semibold sm:px-4">{c.label}</th>)}
                </tr></thead>
                <tbody>
                  {costRows.map(row => <tr key={row.key} className={`border-b border-space-border ${row.total ? "bg-space-void font-semibold" : ""}`}>
                    <th scope="row" className="px-3 py-4 text-left font-medium sm:px-5">{row.label}</th>
                    {costs.map(c => <td key={c.key} className={`whitespace-nowrap px-1 py-4 text-right font-mono tabular-nums sm:px-4 ${row.total && c.key === ranked[0].key ? "text-neon-cyan" : ""}`}>{money(Number(c[row.key]))}</td>)}
                  </tr>)}
                  <tr><th colSpan={4} scope="colgroup" className="px-3 pb-3 pt-6 text-left text-xs font-medium text-text-secondary sm:px-5">Optional savings · separate from spending</th></tr>
                  <tr className="border-b border-space-border">
                    <th scope="row" className="px-3 py-4 text-left font-medium sm:px-5">Battery savings allowance</th>
                    {costs.map(c => <td key={c.key} className="whitespace-nowrap px-1 py-4 text-right font-mono tabular-nums sm:px-4">{money(c.batteryReserveTotal)}</td>)}
                  </tr>
                  <tr className="font-semibold">
                    <th scope="row" className="px-3 py-4 text-left font-medium sm:px-5">Cost + savings allowance</th>
                    {costs.map(c => <td key={c.key} className="whitespace-nowrap px-1 py-4 text-right font-mono tabular-nums sm:px-4">{money(c.planningCost)}</td>)}
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="space-y-3 p-5 text-xs leading-relaxed text-text-secondary sm:p-7">
              {missingInsurance.length > 0 && <p className="rounded-lg bg-space-void p-3"><strong className="text-text-primary">Insurance is set to zero for {missingInsurance.join(", ")}.</strong> <a href="#vehicle-quotes" className="underline underline-offset-2">Add your annual quotes</a> to include it.</p>}
              <p>¹ All-in price − confirmed rebates + EV charger installation − net resale.</p>
              <p>² Total ownership cost ÷ {x.years * 12} months. This is an average after resale, not a monthly payment.</p>
              <p>Battery allowance = replacement budget ÷ funding years × {x.years} years. <a href="#vehicle-maintenance" className="underline underline-offset-2">Edit maintenance and optional savings</a>. {planningWinner && planningWinner.key !== ranked[0].key ? `${planningWinner.label} has the lowest total when your savings allowances are included.` : ""}</p>
              <p>Cash-purchase comparison. Prices and annual bills stay fixed; financing, investment returns and inflation are excluded.</p>
            </div>
          </section>

          <details className={panel}>
            <summary className="cursor-pointer font-semibold">Yearly chart & export</summary>
            <p className="mt-4 text-xs leading-relaxed text-text-secondary">Ownership costs after an illustrative resale each year, excluding the optional battery savings. Intermediate resale follows a straight line to your final estimate.</p>
            <SimulationChart labels={result.points.map(p => `Year ${p.year}`)} series={result.labels.map((name, i) => ({ name, values: result.points.map(p => p.values[i] - result.reserves![i] * p.year) }))} format={money} description="Cumulative ownership costs for gas, hybrid and electric cars, excluding battery savings allowances." />
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-xs">
                <caption className="pb-3 text-left text-text-secondary">Ownership cost by year · {currency}</caption>
                <thead><tr><th scope="col" className="p-2 text-left">Year</th>{result.labels.map(label => <th scope="col" key={label} className="p-2 text-right">{label}</th>)}</tr></thead>
                <tbody>{result.points.map(p => <tr key={p.year} className="border-t border-space-border"><th scope="row" className="p-2 text-left font-normal">{p.year}</th>{p.values.map((v, i) => <td key={i} className="p-2 text-right font-mono">{money(v - result.reserves![i] * p.year)}</td>)}</tr>)}</tbody>
              </table>
            </div>
            <SimulationExport csv={csv} filename="vehicle-comparison" />
          </details>

          <details className={panel}>
            <summary className="cursor-pointer font-semibold">How it works & sources</summary>
            <div className="mt-4 space-y-4 text-xs leading-relaxed text-text-secondary">
              {result.notes.map(note => <p key={note}>{note}</p>)}
              <p>Routine-maintenance presets: <a className="underline" href="https://downloads.regulations.gov/EPA-HQ-OAR-2022-0985-1644/attachment_11.pdf" target="_blank" rel="noopener noreferrer">Argonne’s 2021 report, Figure 3.28</a>: US$0.101/mile for gas, $0.094 for conventional hybrids and $0.061 for electric. Annual km ÷ 1.609344 × rate × editable currency multiplier. These historical US benchmarks are not current local quotes.</p>
              <p>Battery budget references: <a className="underline" href="https://earthlingauto.com/2025-guide-to-prius-high-voltage-battery-replacement-costs/" target="_blank" rel="noopener noreferrer">2025 Prius repair-shop guide</a> and <a className="underline" href="https://www.recurrentauto.com/research/costs-ev-battery-replacement" target="_blank" rel="noopener noreferrer">Recurrent’s December 2024 EV research</a>. Hybrid US$3,500 and EV US$10,500 (midpoint of $5,000–16,000) are example budgets, multiplied by an illustrative 1.35. The 15-year funding periods are chosen savings horizons, not battery life or failure forecasts.</p>
              <p>Inputs are not saved or transmitted.</p>
            </div>
          </details>
        </>}
      </div>
    </div>
  </SimulationShell>;
}
