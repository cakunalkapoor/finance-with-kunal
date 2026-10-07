"use client";

import { useMemo, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import MortgageRateEditor from "./MortgageRateEditor";
import { ArrowUpRight, SlidersHorizontal, RotateCcw, Download, ChevronDown } from "lucide-react";
import type { EChartsOption } from "echarts";
import { CHART_COLORS, useTheme } from "@/lib/use-theme";
import { DEFAULT_HOUSING, modelHousing, housingBreakEvens, validateHousing, type HousingInputs } from "@/lib/housing-model";

const ReactECharts = dynamic(() => import("echarts-for-react"), { ssr: false });
const panelStyle = { background: "var(--color-space-card)", border: "1px solid var(--color-space-border)" };
type NumericKey = { [K in keyof HousingInputs]: HousingInputs[K] extends number ? K : never }[keyof HousingInputs];
const groups: { title: string; fields: { key: NumericKey; label: string; unit: string; step?: number; hint: string }[] }[] = [
  { title: "The home & the alternative", fields: [
    { key: "price", label: "Home price", unit: "$", step: 10000, hint: "Total purchase price of the house or condo, before closing costs." },
    { key: "rent", label: "Comparable monthly rent", unit: "$/mo", step: 100, hint: "A similar home, in the same area. Exclude utility charges bundled into rent; utilities are assumed equal in both paths." },
    { key: "downPayment", label: "Down payment", unit: "$", step: 1000, hint: "Cash paid toward the purchase price. The remainder becomes the mortgage; this cash becomes home equity." },
    { key: "mortgageRate", label: "Starting mortgage interest rate", unit: "%", step: 0.1, hint: "Annual quoted loan rate, not APR. Applies from year 1 until your first rate change. Drag the rate chart or enter renewal rates below; without changes it stays constant." },
    { key: "amortization", label: "Mortgage tenure (full repayment)", unit: "years", step: 1, hint: "Independent of how long you stay. Mortgage payments stop after payoff." },
  ] },
  { title: "Inflation & investment assumptions", fields: [
    { key: "rentInflation", label: "Annual rent inflation", unit: "%/yr", step: 0.1, hint: "Compounded at each anniversary. At 2.5%, monthly rent of 3,000 becomes 3,075, then 3,151.88." },
    { key: "ownerInflation", label: "Ownership expense inflation", unit: "%/yr", step: 0.1, hint: "Annual compound increase for taxes, repairs, insurance, condo/HOA fees and other ownership costs. Excludes mortgage payments and mortgage insurance." },
    { key: "renterInflation", label: "Other rental expense inflation", unit: "%/yr", step: 0.1, hint: "Annual compound increase for renter insurance, other rental costs and the price of future moves. Rent uses its own inflation rate." },
    { key: "appreciation", label: "Home price growth", unit: "%/yr", step: 0.5, hint: "Assumed annual change in resale value. Compounds yearly; a negative rate models falling prices." },
    { key: "investmentReturn", label: "Investment return, after fees & tax", unit: "%/yr", step: 0.5, hint: "Annual return on invested starting cash and housing savings, after fees and tax. Compounds at the equivalent monthly rate; not a guaranteed return." },
  ] },
  { title: "Ownership expenses · annual amounts", fields: [
    { key: "propertyTax", label: "Property tax", unit: "$/yr", step: 100, hint: "Annual tax bill for this property. For a condo, enter it separately unless the fees explicitly include it." },
    { key: "maintenance", label: "Maintenance & repairs", unit: "$/yr", step: 100, hint: "Annual repair budget. For a house include the building and grounds; for a condo include only unit repairs not covered by fees." },
    { key: "homeInsurance", label: "Home insurance", unit: "$/yr", step: 100, hint: "Annual personal policy premium. Condo building insurance in fees may not cover your contents, liability, unit upgrades or deductibles." },
    { key: "hoa", label: "Condo / HOA fees", unit: "$/yr", step: 100, hint: "Annual association fees: monthly fee × 12, excluding any bundled utility charges. Utilities are assumed equal in both paths. Avoid counting covered services again in other budgets." },
    { key: "ownerOther", label: "Other ownership expenses", unit: "$/yr", step: 100, hint: "Annual costs not entered elsewhere, such as parking or an assessment reserve. Exclude utilities and avoid counting the same cost twice." },
    { key: "mortgageInsurance", label: "Mortgage insurance", unit: "$/yr", step: 100, hint: "If applicable; manually entered and constant until payoff." },
  ] },
  { title: "Rental expenses & moving", fields: [
    { key: "renterInsurance", label: "Renter insurance", unit: "$/yr", step: 50, hint: "Annual tenant insurance premium for contents and personal liability." },
    { key: "renterOther", label: "Other rental expenses", unit: "$/yr", step: 100, hint: "Include recurring fees, parking, storage or other costs. Exclude utilities, which are assumed equal in both paths." },
    { key: "renterMoving", label: "Rental moving cost per move", unit: "$", step: 100, hint: "Include movers, setup fees, cleaning and overlapping rent. Initial move plus repeats." },
    { key: "movingFrequency", label: "Move to another rental every", unit: "years", step: 1, hint: "3 means moves at the start of years 1, 4, 7… Set 0 for the initial move only." },
  ] },
  { title: "Buying & selling · cash amounts", fields: [
    { key: "closingCosts", label: "Purchase closing costs", unit: "$", step: 500, hint: "Transfer taxes, legal fees, cash-paid premiums and other upfront costs." },
    { key: "ownerMoving", label: "Moving into the purchased home", unit: "$", step: 100, hint: "One-time cash cost at purchase: movers, setup, cleaning and similar expenses." },
    { key: "sellingCosts", label: "Estimated selling costs", unit: "$", step: 500, hint: "Fixed cash estimate deducted from home value in each net-worth projection." },
  ] },
];

function formatMoney(n: number, currency: string) {
  return new Intl.NumberFormat("en-CA", { style: "currency", currency, maximumFractionDigits: 0 }).format(Math.abs(n) < 0.5 ? 0 : n);
}

function Panel({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return <section className="rounded-xl p-5 sm:p-6" style={panelStyle}>
    <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
    {subtitle && <p className="mt-1 text-sm text-text-secondary">{subtitle}</p>}
    {children}
  </section>;
}

function Disclosure({ title, summary, children }: { title: string; summary?: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return <details className="rounded-xl p-5 sm:p-6" style={panelStyle} onToggle={e => setOpen(e.currentTarget.open)}>
    <summary className="flex cursor-pointer list-none items-center justify-between gap-3"><span><span className="block text-base font-semibold">{title}</span>{summary && <span className="mt-1 block text-xs text-text-secondary">{summary}</span>}</span><ChevronDown size={16} className={open ? "rotate-180" : ""} /></summary>
    {open && <div className="mt-4">{children}</div>}
  </details>;
}

export default function HousingDecision() {
  const [inputs, setInputs] = useState<HousingInputs>({ ...DEFAULT_HOUSING });
  const [currency, setCurrency] = useState("CAD");
  const [scenario, setScenario] = useState("Your scenario");
  const [exportVisible, setExportVisible] = useState(false);
  const [projection, setProjection] = useState<"wealth" | "cost">("wealth");
  const theme = useTheme();
  const colors = CHART_COLORS[theme];
  const errors = validateHousing(inputs);
  const result = useMemo(() => validateHousing(inputs).length ? null : modelHousing(inputs), [inputs]);
  const money = (n: number) => formatMoney(n, currency);
  const compact = (n: number) => new Intl.NumberFormat("en-CA", { notation: "compact", maximumFractionDigits: 1 }).format(n);
  const set = (key: NumericKey, value: string) => {
    setScenario("Your scenario");
    setInputs(previous => ({ ...previous, [key]: value.trim() === "" ? NaN : Number(value) }));
  };
  const renderField = (field: (typeof groups)[number]["fields"][number]) => <div key={field.key}>
            <label htmlFor={field.key} className="mb-1.5 block text-xs text-text-secondary">{field.key === "homeInsurance" && inputs.propertyType === "condo" ? "Personal condo insurance" : field.key === "hoa" ? inputs.propertyType === "condo" ? "Condo / strata fees" : "HOA / association fees" : field.label}</label>
            <div className="flex items-center rounded-md border border-space-border bg-space-void focus-within:border-neon-cyan">
              <input id={field.key} type="number" step={field.step ?? 1} min={["appreciation", "investmentReturn"].includes(field.key) ? -20 : 0}
                value={Number.isFinite(inputs[field.key]) ? inputs[field.key] : ""} onChange={e => set(field.key, e.target.value)}
                className="min-w-0 flex-1 bg-transparent px-3 py-2.5 font-mono text-sm" aria-describedby={field.hint ? `${field.key}-hint` : undefined} />
              <span className="pr-3 text-xs text-text-muted">{field.unit.replace("$", currency)}</span>
            </div>{field.hint && <p id={`${field.key}-hint`} className="mt-1 text-[11px] leading-relaxed text-text-muted">{field.hint}</p>}
          </div>;
  const thresholds = useMemo(() => result ? housingBreakEvens(inputs) : null, [inputs, result]);
  const thresholdExamples = useMemo(() => {
    if (!thresholds) return [];
    const rentBase = thresholds.rent.value ?? inputs.rent;
    const rateBase = thresholds.rate.value ?? inputs.mortgageRate;
    const lowRent = Math.round(Math.max(0, rentBase - 500));
    const highRent = Math.min(100000000, Math.round(rentBase + 500));
    const lowRate = Number(Math.max(0, rateBase - 1).toFixed(2));
    const highRate = Number(Math.min(100, rateBase + 1).toFixed(2));
    return [
      { label: "Lower rent", change: `Starting rent ${formatMoney(lowRent, currency)}/month`, values: { ...inputs, rent: lowRent } },
      { label: "Higher rent", change: `Starting rent ${formatMoney(highRent, currency)}/month`, values: { ...inputs, rent: highRent } },
      ...(thresholds.rate.status === "no-loan" ? [] : [
        { label: "Lower rate", change: `Starting mortgage rate ${lowRate.toFixed(2)}%`, values: { ...inputs, mortgageRate: lowRate } },
        { label: "Higher rate", change: `Starting mortgage rate ${highRate.toFixed(2)}%`, values: { ...inputs, mortgageRate: highRate } },
      ]),
    ].map(example => ({ ...example, difference: modelHousing(example.values).final.difference }));
    // Currency only affects the displayed labels.
  }, [inputs, thresholds, currency]);
  const rateExamples = useMemo(() => {
    if (!result) return [];
    const renewalYear = Math.min(6, inputs.amortization);
    return [
      { label: "Hold steady", rate: inputs.mortgageRate, changes: [] },
      ...(renewalYear > 1 ? [
        { label: "Rates rise", rate: Math.min(100, inputs.mortgageRate + 1.5), changes: [{ year: renewalYear, rate: Math.min(100, inputs.mortgageRate + 1.5) }] },
        { label: "Rates fall", rate: Math.max(0, inputs.mortgageRate - 1.5), changes: [{ year: renewalYear, rate: Math.max(0, inputs.mortgageRate - 1.5) }] },
      ] : []),
    ].map(example => ({ ...example, renewalYear, result: modelHousing({ ...inputs, mortgageRateChanges: example.changes }) }));
  }, [inputs, result]);

  function addRateChange() {
    const used = new Set(inputs.mortgageRateChanges.map(change => change.year));
    const preferred = Math.min(40, Math.max(1, ...used) + 5);
    const year = !used.has(preferred) ? preferred : Array.from({ length: 39 }, (_, i) => i + 2).find(y => !used.has(y));
    if (year === undefined) return;
    setInputs(p => ({ ...p, mortgageRateChanges: [...p.mortgageRateChanges, { year, rate: p.mortgageRate }] }));
    setScenario("Your scenario");
  }
  function setRateChange(index: number, key: "year" | "rate", value: string) {
    setInputs(p => ({ ...p, mortgageRateChanges: p.mortgageRateChanges.map((change, i) => i === index ? { ...change, [key]: value.trim() === "" ? NaN : Number(value) } : change) }));
    setScenario("Your scenario");
  }
  const chart = (kind: "wealth" | "cost"): EChartsOption => ({
    animationDuration: 250,
    color: [colors.series1, colors.series2],
    grid: { left: 58, right: 20, top: 48, bottom: 45 },
    legend: { top: 12, textStyle: { color: colors.tooltipText }, data: ["Buy", "Rent"] },
    tooltip: { trigger: "axis", confine: true, backgroundColor: colors.tooltipBg, borderColor: colors.tooltipBorder,
      textStyle: { color: colors.tooltipText }, valueFormatter: value => money(Number(value)) },
    xAxis: { type: "category", name: "Year", nameLocation: "middle", nameGap: 28,
      data: result?.points.map(p => p.year),
      axisLabel: { color: colors.axisLabel }, axisLine: { lineStyle: { color: colors.axisLine } }, axisTick: { show: false } },
    yAxis: { type: "value", axisLabel: { color: colors.axisLabel, formatter: compact }, splitLine: { lineStyle: { color: colors.grid } } },
    series: ["Buy", "Rent"].map((name, index) => ({ name, type: kind === "wealth" ? "line" : "bar", showSymbol: false,
      lineStyle: { width: 3 }, data: result?.points.map(p =>
        kind === "wealth" ? (index === 0 ? p.buyWealth : p.rentWealth) : (index === 0 ? p.ownerCashOutflow : p.renterCashOutflow)) })),
  });
  function scenarioCsv() {
    if (!result) return "";
    const rows = ["Buy versus rent scenario — illustrative projection", `Currency,${currency}`, "Assumption,Value",
      ...Object.entries(inputs).filter(([k]) => k !== "mortgageRateChanges").map(([k, v]) => `${k},${v}`),
      ...inputs.mortgageRateChanges.slice().sort((a, b) => a.year - b.year).map(change => `Mortgage rate from year ${change.year},${change.rate}`), "",
      "Year,Home value,Mortgage balance,Equity before sale,Owner investments,Buy net worth,Renter investments,Buy minus rent,Owner annual cash outflow,Renter annual cash outflow,Rental moving costs,Mortgage rate percent,Monthly mortgage payment,Mortgage interest paid,Mortgage principal paid",
      ...result.points.map(p => [p.year, p.homeValue, p.debt, p.equity, p.ownerInvestments, p.buyWealth, p.rentWealth, p.difference, p.ownerCashOutflow, p.renterCashOutflow, p.movingPaid, p.mortgageRate, p.monthlyMortgagePayment, p.annualInterest, p.annualPrincipal].map(v => v.toFixed(2)).join(","))];
    return rows.join("\n");
  }
  function exportCsv() {
    const url = URL.createObjectURL(new Blob([scenarioCsv()], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a"); a.href = url; a.download = "buy-vs-rent-scenario.csv";
    document.body.appendChild(a); a.click(); a.remove();
    // Let the browser finish consuming the blob before releasing it.
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return <div className="section-shell py-8">
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-space-border pb-5">
      <div><p className="mb-2 text-xs uppercase tracking-widest text-neon-cyan">Decision Studio</p><h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Buy or rent?</h1><p className="mt-2 text-sm text-text-secondary">Compare the costs today and the wealth you could build over time.</p></div>
      <div className="w-full sm:w-64">          <label className="block text-xs font-semibold" htmlFor="currency">Currency</label>
          <select id="currency" value={currency} onChange={e => setCurrency(e.target.value)} className="mt-2 w-full rounded-md border border-space-border bg-space-void p-2 text-sm">
            {[
              ["CAD", "Canadian dollar"], ["USD", "US dollar"], ["EUR", "Euro"], ["GBP", "British pound"], ["INR", "Indian rupee"],
              ["AUD", "Australian dollar"], ["NZD", "New Zealand dollar"], ["CHF", "Swiss franc"], ["JPY", "Japanese yen"], ["CNY", "Chinese yuan"],
              ["HKD", "Hong Kong dollar"], ["SGD", "Singapore dollar"], ["AED", "UAE dirham"], ["SAR", "Saudi riyal"], ["QAR", "Qatari riyal"],
              ["KWD", "Kuwaiti dinar"], ["BHD", "Bahraini dinar"], ["OMR", "Omani rial"], ["KRW", "South Korean won"], ["TWD", "Taiwan dollar"],
              ["THB", "Thai baht"], ["MYR", "Malaysian ringgit"], ["IDR", "Indonesian rupiah"], ["PHP", "Philippine peso"], ["VND", "Vietnamese dong"],
              ["ZAR", "South African rand"], ["BRL", "Brazilian real"], ["MXN", "Mexican peso"], ["COP", "Colombian peso"], ["CLP", "Chilean peso"],
              ["TRY", "Turkish lira"], ["SEK", "Swedish krona"], ["NOK", "Norwegian krone"], ["DKK", "Danish krone"], ["PLN", "Polish zloty"],
              ["ILS", "Israeli shekel"], ["EGP", "Egyptian pound"], ["PKR", "Pakistani rupee"], ["BDT", "Bangladeshi taka"], ["LKR", "Sri Lankan rupee"],
            ].map(([code, name]) => <option key={code} value={code}>{code} · {name}</option>)}
          </select><p className="mt-1 text-[11px] text-text-muted">Labels only; no FX conversion or regional presets. Enter amounts in this currency.</p>
      </div>
    </div>

    <div className="grid items-start gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
      <aside className="min-w-0 rounded-xl" style={panelStyle}>
        <div className="border-b border-space-border p-5">
          <div className="flex items-center justify-between"><h2 className="flex items-center gap-2 text-lg font-semibold"><SlidersHorizontal size={17} /> Your home</h2>
            <button aria-label="Reset assumptions" title="Reset assumptions" onClick={() => { setInputs({ ...DEFAULT_HOUSING, propertyType: inputs.propertyType }); setScenario("Your scenario"); }} className="rounded-full p-2 hover:bg-space-dark"><RotateCcw size={15} /></button>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-text-secondary">Compare a purchase and a similar rental.</p>
          <fieldset className="mt-4"><legend className="text-xs font-semibold">Property type</legend>
            <div className="mt-2 grid grid-cols-2 gap-2">{(["house", "condo"] as const).map(type => <label key={type} className="flex cursor-pointer items-center gap-2 rounded-md border border-space-border p-3 text-sm" style={{ background: inputs.propertyType === type ? "var(--color-wash)" : undefined }}>
              <input type="radio" name="propertyType" value={type} checked={inputs.propertyType === type} onChange={() => { setInputs(p => ({ ...p, propertyType: type })); setScenario("Your scenario"); }} className="accent-neon-cyan" />{type === "house" ? "House" : "Condo"}
            </label>)}</div>
            <p className="mt-2 text-[11px] leading-relaxed text-text-muted">Enter your costs below. Switching property type keeps your entered amounts.</p>
          </fieldset>

        </div>
        <div className="space-y-4 border-b border-space-border p-5">
          {groups[0].fields.map(renderField)}
          {inputs.propertyType === "condo" && renderField(groups[2].fields.find(field => field.key === "hoa")!)}
          <label className="block text-xs text-text-secondary">Time in the house · {inputs.years} years
            <input aria-label="Time in the house in years" type="range" min="1" max="100" value={inputs.years} onChange={e => set("years", e.target.value)} className="mt-2 block w-full accent-neon-cyan" />
            <span className="mt-1 flex justify-between text-[11px] text-text-muted"><span>1 year</span><span>100 years</span></span>
          </label><p className="text-[11px] leading-relaxed text-text-muted">Sets the projection length. Mortgage repayment is separate and stops at payoff.</p>
        </div>
        <div className="border-b border-space-border bg-space-void p-5">
          <h3 className="text-xs font-semibold">Assumptions in use</h3>
          <p className="mt-2 text-[11px] leading-relaxed text-text-secondary">Home growth {inputs.appreciation}% · Investment return {inputs.investmentReturn}% · Rent inflation {inputs.rentInflation}%.</p>
          <p className="mt-1 text-[11px] leading-relaxed text-text-secondary">Year-one costs: owning {result ? money(result.points[0].ownerExpenses) : "—"}/yr beyond the mortgage; renting {result ? money(result.points[0].renterExpenses) : "—"}/yr beyond rent.</p>
          <p className="mt-2 text-[11px] text-text-muted">Advanced amounts and percentages start at zero on every page load or refresh. Add costs, inflation, growth, moving and fees below to include them. Utilities are assumed equal and excluded.</p>
        </div>
        <details className="border-b border-space-border">
          <summary className="flex cursor-pointer list-none items-center justify-between p-5 text-sm font-semibold">Advanced assumptions<ChevronDown size={15} /></summary>
        {groups.map((group, index) => <details key={group.title} className="border-b border-space-border last:border-0">
          <summary className="flex cursor-pointer list-none items-center justify-between p-5 text-sm font-semibold">{index === 0 ? "Mortgage convention & exact rate changes" : group.title}<ChevronDown size={15} /></summary>
          {index === 2 && inputs.propertyType === "condo" && <div className="mx-5 mb-4 rounded-md border border-space-border bg-space-void p-3">
            <p className="text-xs leading-relaxed text-text-secondary">Condo fees may include building insurance, but property tax and personal unit insurance are often separate. Confirm your building’s documents before excluding either cost.</p>
            {([{ key: "condoTaxIncluded", label: "Property tax included in condo fees", note: "When checked, no separate property tax is charged; make sure the fee amount includes the full tax cost." }, { key: "condoInsuranceIncluded", label: "Personal insurance included in condo fees", note: "Check only if your personal unit/contents/liability cover is included, not just the building’s policy." }] as const).map(item => <div key={item.key} className="mt-3">
              <label className="flex items-start gap-2 text-xs"><input type="checkbox" checked={inputs[item.key]} onChange={e => setInputs(p => ({ ...p, [item.key]: e.target.checked }))} className="mt-0.5 accent-neon-cyan" />{item.label}</label>
              <p className="mt-1 text-[11px] leading-relaxed text-text-muted">{item.note} {inputs[item.key] ? "Separate amount excluded from the calculation." : "Enter the separate annual amount below."}</p>
            </div>)}
            <a href="https://www.cmhc-schl.gc.ca/consumers/home-buying/buying-guides/condominium/condominium-purchase-and-recurring-costs" target="_blank" rel="noopener noreferrer" className="mt-3 block text-[11px] underline underline-offset-2">CMHC condo cost guide</a>
          </div>}
          <div className="space-y-4 px-5 pb-5">{(index === 0 ? [] : group.fields).filter(field => !(inputs.propertyType === "condo" && ((field.key === "propertyTax" && inputs.condoTaxIncluded) || (field.key === "homeInsurance" && inputs.condoInsuranceIncluded) || field.key === "hoa"))).map(renderField)}
          {index === 0 && <div><label htmlFor="compounding" className="mb-1.5 block text-xs text-text-secondary">Mortgage compounding</label>
            <select id="compounding" value={inputs.compounding} onChange={e => setInputs(p => ({ ...p, compounding: e.target.value as HousingInputs["compounding"] }))} className="w-full rounded-md border border-space-border bg-space-void p-2 text-sm">
              <option value="semiannual">Semiannual nominal (Canada fixed)</option><option value="monthly">Monthly nominal</option>
            </select><p className="mt-1 text-[11px] leading-relaxed text-text-muted">Select how the quoted mortgage rate compounds. Semiannual nominal is commonly used for Canadian fixed-rate loans; monthly nominal divides the annual rate by 12.</p></div>}
          {index === 0 && <fieldset className="rounded-md border border-space-border p-3">
            <legend className="px-1 text-xs font-semibold">Precise mortgage rate inputs</legend>
            <p className="text-[11px] leading-relaxed text-text-muted">Drag points on the rate chart, or enter the exact start year and new rate here. Year 6 means after five full years. Each rate continues until the next change. Payments adjust using the remaining balance and repayment period; the original payoff date stays the same.</p>
            {inputs.mortgageRateChanges.map((change, i) => <div key={i} className="mt-3 border-t border-space-border pt-3">
              <div className="grid grid-cols-2 gap-2">
                <label className="text-[11px] text-text-secondary">Start year<input aria-label={`Rate change ${i + 1} start year`} type="number" min="2" max="40" step="1" value={Number.isFinite(change.year) ? change.year : ""} onChange={e => setRateChange(i, "year", e.target.value)} className="mt-1 w-full rounded-md border border-space-border bg-space-void px-2 py-2 font-mono text-sm" /></label>
                <label className="text-[11px] text-text-secondary">New rate (%)<input aria-label={`Rate change ${i + 1} interest rate`} type="number" min="0" max="100" step="0.1" value={Number.isFinite(change.rate) ? change.rate : ""} onChange={e => setRateChange(i, "rate", e.target.value)} className="mt-1 w-full rounded-md border border-space-border bg-space-void px-2 py-2 font-mono text-sm" /></label>
              </div>
              <button onClick={() => { setInputs(p => ({ ...p, mortgageRateChanges: p.mortgageRateChanges.filter((_, j) => j !== i) })); setScenario("Your scenario"); }} aria-label={`Remove rate change ${i + 1}`} className="mt-2 text-[11px] underline underline-offset-2">Remove change</button>
            </div>)}
            <button onClick={addRateChange} disabled={inputs.mortgageRateChanges.length >= 39} className="mt-3 rounded-full border border-space-border px-3 py-2 text-xs hover:bg-space-dark disabled:opacity-50">Add rate change</button>
            <p className="mt-2 text-[11px] leading-relaxed text-text-muted">No changes means a constant rate. Changes after mortgage payoff are ignored; changes beyond your stay do not affect this projection. These are your assumptions, not rate forecasts.</p>
          </fieldset>}
          </div>
        </details>)}
        </details>
        <div className="p-5 text-[11px] leading-relaxed text-text-muted">Calculations run in your browser. This tool does not send or save your entered assumptions.</div>
      </aside>

      <div className="min-w-0 space-y-6">
        {errors.length > 0 && <div role="alert" className="rounded-xl border border-market-down p-5 text-sm text-market-down">{errors.map(error => <p key={error}>{error}</p>)}</div>}
        {result && <>
          <section aria-live="polite" className="overflow-hidden rounded-xl border border-space-border">
            <div className="p-5 sm:p-6" style={{ background: "var(--color-wash)" }}>
              <p className="mb-3 text-xs uppercase tracking-widest text-text-secondary">{scenario} · year {inputs.years} · {currency}</p>
              <h2 className="text-3xl font-semibold tracking-tight">{Math.abs(result.final.difference) < 1 ? "The two paths are effectively level." : `${result.final.difference > 0 ? "Buying" : "Renting"} leads by ${money(Math.abs(result.final.difference))}.`}</h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-text-secondary">Estimated wealth after {inputs.years} years, assuming the home is sold and housing savings are invested. Your assumptions determine the result.</p>
              <div className="mt-4 grid grid-cols-2 gap-4 border-t border-space-border pt-5">{[["Buy · net worth", result.final.buyWealth], ["Rent · investments", result.final.rentWealth]].map(([label, value], index) => <div key={label}><p className="text-xs text-text-secondary"><span className="mr-2 inline-block h-2 w-2 rounded-full" style={{ background: index === 0 ? colors.series1 : colors.series2 }} />{label}</p><p className="mt-2 font-mono text-xl font-bold sm:text-2xl">{money(Number(value))}</p></div>)}</div>
            </div>
            <div className="grid grid-cols-1 divide-y divide-space-border bg-space-card sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              {[{ label: "Cash needed to buy", value: money(result.upfront), note: "Down payment + closing costs + move" },
                { label: "First-year cash outflow gap", value: money(Math.abs(result.points[0].ownerCashOutflow - result.points[0].renterCashOutflow)), note: `${result.points[0].ownerCashOutflow >= result.points[0].renterCashOutflow ? "Buying" : "Renting"} needs more cash; includes upfront costs` },
                { label: "First buying lead", value: result.firstBuyingLead === null ? "Not in this period" : `Year ${result.firstBuyingLead}`, note: "First year-end ahead; can reverse" }].map(item => <div key={item.label} className="p-5"><p className="text-xs text-text-secondary">{item.label}</p><p className="mt-2 text-lg font-semibold">{item.value}</p><p className="mt-1 text-[11px] text-text-muted">{item.note}</p></div>)}
            </div>
          </section>

          <Panel title="Your yearly projection" subtitle={`Years 1–${inputs.years} · ${currency} · future dollars`}>
            <div role="tablist" aria-label="Yearly projection view" className="mt-4 flex gap-2">{(["wealth", "cost"] as const).map(view => <button key={view} id={`projection-${view}-tab`} role="tab" aria-selected={projection === view} aria-controls="projection-chart" tabIndex={projection === view ? 0 : -1} onKeyDown={e => {
                if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return;
                e.preventDefault();
                const next = e.key === "Home" ? "wealth" : e.key === "End" ? "cost" : projection === "wealth" ? "cost" : "wealth";
                setProjection(next);
                e.currentTarget.parentElement?.querySelector<HTMLButtonElement>(`#projection-${next}-tab`)?.focus();
              }} onClick={() => setProjection(view)} className={`rounded-full border border-space-border px-4 py-2 text-xs font-semibold ${projection === view ? "bg-neon-cyan text-space-void" : "hover:bg-space-dark"}`}>{view === "wealth" ? "Net worth" : "Cash flow"}</button>)}</div>
            <div id="projection-chart" role="tabpanel" aria-labelledby={`projection-${projection}-tab`}>
              <ReactECharts option={chart(projection)} style={{ height: 320, width: "100%" }} opts={{ renderer: "svg" }} notMerge />
              <p className="text-xs leading-relaxed text-text-secondary">{projection === "wealth" ? "Buy: home equity plus investments, less selling costs. Rent: investments from starting cash and housing savings." : "Money spent each year, including upfront costs in year one. Mortgage principal is included; shared utilities and investment transfers are excluded."}</p>
            </div>
            <details className="mt-4"><summary className="cursor-pointer text-xs font-semibold">See first-year cost breakdown</summary>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div><h3 className="mb-3 text-sm font-semibold">Buying · year 1</h3>
                {[["Mortgage principal", result.points[0].annualPrincipal], ["Mortgage interest", result.points[0].annualInterest], ["Ownership expenses", result.points[0].ownerExpenses], ["Mortgage insurance", result.loan > 0 ? inputs.mortgageInsurance : 0], ["Down payment, closing & move", result.upfront], ["Total cash outflow", result.points[0].ownerCashOutflow]].map(([label, value]) => <div key={label} className="flex justify-between gap-3 border-b border-space-border py-2 text-xs"><span className="text-text-secondary">{label}</span><span className="font-mono">{money(Number(value))}</span></div>)}
              </div>
              <div><h3 className="mb-3 text-sm font-semibold">Renting · year 1</h3>
                {[["Rent", result.points[0].rentPaid], ["Other rental expenses", result.points[0].renterExpenses], ["Moving costs", result.points[0].movingPaid], ["Total cash outflow", result.points[0].renterCashOutflow]].map(([label, value]) => <div key={label} className="flex justify-between gap-3 border-b border-space-border py-2 text-xs"><span className="text-text-secondary">{label}</span><span className="font-mono">{money(Number(value))}</span></div>)}
                <p className="mt-4 text-xs leading-relaxed text-text-secondary">Moving costs are charged in the actual move year, not spread across every year. Recurring budgets and future moving prices rise at their respective inflation percentages.</p>
              </div>
            </div>
            </details>
          </Panel>

          {thresholds && <Panel title="When does owning make financial sense?" subtitle={`Break-even net worth at the end of year ${inputs.years}. Change one input at a time; hold all others fixed.`}>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border border-space-border p-4"><h3 className="text-sm font-semibold">Starting monthly rent</h3>
                <p className="mt-2 font-mono text-xl font-bold">{thresholds.rent.value === null ? "No crossing in range" : money(thresholds.rent.value)}</p>
                <p className="mt-2 text-xs leading-relaxed text-text-secondary">{thresholds.rent.value !== null ? "Above this starting rent, buying has higher projected net worth. Below it, renting leads. Your rent inflation and moving schedule still apply." : thresholds.rent.status === "buy-throughout" ? `Buying leads throughout the tested rent range: ${money(0)}–${money(100000)} per month.` : `Renting leads throughout the tested rent range: ${money(0)}–${money(100000)} per month.`}</p>
              </div>
              <div className="rounded-lg border border-space-border p-4"><h3 className="text-sm font-semibold">Starting mortgage interest rate</h3>
                <p className="mt-2 font-mono text-xl font-bold">{thresholds.rate.value === null ? thresholds.rate.status === "no-loan" ? "No mortgage" : "No crossing in range" : `${thresholds.rate.value.toFixed(2)}%`}</p>
                <p className="mt-2 text-xs leading-relaxed text-text-secondary">{thresholds.rate.value !== null ? "Below this rate, buying has higher projected net worth. Above it, renting leads. Your entered future renewal rates stay fixed while only the starting rate changes." : thresholds.rate.status === "no-loan" ? "With a 100% cash down payment, the mortgage rate has no effect." : thresholds.rate.status === "buy-throughout" ? "Buying leads at every tested mortgage rate from 0% to 25%." : "Renting leads at every tested mortgage rate from 0% to 25%."}</p>
              </div>
            </div>
            <details className="mt-4"><summary className="cursor-pointer text-xs font-semibold">Try examples around these thresholds</summary>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">{thresholdExamples.map(example => <button key={example.label} onClick={() => { setInputs(example.values); setScenario(example.label); }} className="rounded-lg border border-space-border p-4 text-left hover:bg-space-dark">
              <span className="block text-xs text-text-secondary">{example.change}</span>
              <span className="mt-2 block text-sm font-semibold">{Math.abs(example.difference) < 1 ? "Effectively level" : `${example.difference >= 0 ? "Buy" : "Rent"} leads by ${money(Math.abs(example.difference))}`}</span>
              <span className="mt-2 block text-[11px] text-neon-cyan">Apply this example →</span>
            </button>)}</div>
            </details>
            <p className="mt-4 text-xs leading-relaxed text-text-secondary">These thresholds answer which path ends with more wealth, not whether you can afford the payments. They depend on your expense budgets, inflation percentages, future mortgage rates, growth assumptions and time in the house. Values are rounded for display.</p>
          </Panel>}

          <Disclosure title="Explore changing mortgage rates" summary={inputs.mortgageRateChanges.length ? `${inputs.mortgageRateChanges.length} future rate change(s) in use · open to edit the line chart` : `Currently ${inputs.mortgageRate}% throughout · open to model rising or falling rates`}>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">{rateExamples.map(example => <button key={example.label} onClick={() => { setInputs(p => ({ ...p, mortgageRateChanges: example.changes })); setScenario(example.label); }} className="rounded-lg border border-space-border p-4 text-left hover:bg-space-dark">
              <span className="block text-sm font-semibold">{example.label}</span>
              <span className="mt-2 block text-xs text-text-secondary">{example.changes.length ? `${inputs.mortgageRate.toFixed(2)}% → ${example.rate.toFixed(2)}% from year ${example.renewalYear}` : `${inputs.mortgageRate.toFixed(2)}% until payoff`}</span>
              <span className="mt-3 block text-sm">{Math.abs(example.result.final.difference) < 1 ? "Effectively level" : `${example.result.final.difference >= 0 ? "Buy" : "Rent"} leads by ${money(Math.abs(example.result.final.difference))}`}</span>
              <span className="mt-1 block text-[11px] text-text-muted">Mortgage interest over your stay: {money(example.result.final.interestPaid)}</span>
              <span className="mt-3 block text-[11px] text-neon-cyan">Apply rate path →</span>
            </button>)}</div>
            <p className="mt-3 text-[11px] leading-relaxed text-text-muted">Examples replace your future rate changes and keep your starting rate. Rising and falling examples change it by 1.5 percentage points after five years, or earlier if repayment ends sooner. If that change is beyond your stay, the results match the steady path. Drag the rate chart to shape your own path, or use the precise rate inputs.</p>
            <MortgageRateEditor inputs={inputs} currency={currency} onChange={next => { setInputs(next); setScenario("Your scenario"); }} />
            <p className="mt-3 text-[11px] leading-relaxed text-text-muted">Payments include principal and interest. Annual rate steps model renewals with adjusted payments; within-year changes, fixed-payment variable mortgages, refinancing and renewal fees are not included. <a href="https://www.canada.ca/en/financial-consumer-agency/services/mortgages/renew-mortgage.html" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">FCAC mortgage renewal guide</a>.</p>
          </Disclosure>

          <Disclosure title="How is net worth calculated?" summary="Home equity, investments, mortgage debt and selling costs.">
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div className="rounded-lg bg-space-void p-4"><h3 className="text-sm font-semibold">Buy = home + investments − debt − sale costs</h3>
                <dl className="mt-3 space-y-2 text-xs">{[["Home value", result.final.homeValue], ["Owner investments", result.final.ownerInvestments], ["Mortgage balance", -result.final.debt], ["Selling costs", -inputs.sellingCosts], ["Net worth", result.final.buyWealth]].map(([label, value]) => <div key={label} className="flex justify-between gap-2"><dt className="text-text-secondary">{label}</dt><dd className="font-mono">{money(Number(value))}</dd></div>)}</dl>
              </div>
              <div className="rounded-lg bg-space-void p-4"><h3 className="text-sm font-semibold">Rent = investments after housing expenses</h3>
                <p className="mt-3 text-xs leading-relaxed text-text-secondary">Both start with {money(result.startingCash)}. After paying the initial rental move, the renter invests {money(result.renterInitialInvestments)}. The owner initially invests {money(result.ownerInitialInvestments)} after paying the down payment, closing costs and move.</p>
                <p className="mt-3 text-xs leading-relaxed text-text-secondary">Each month, whichever path spends less invests the saving. Returns compound at your assumed after-tax rate. Principal repayment builds home equity; it is not deducted again from net worth.</p>
                <p className="mt-3 font-mono text-sm">Rent net worth: {money(result.final.rentWealth)}</p>
              </div>
            </div>
            <p className="mt-4 text-xs text-text-secondary">This models wealth from the housing decision only. Existing retirement accounts, other assets and unrelated debts are outside the comparison.</p>
          </Disclosure>

          <Disclosure title="Annual numbers & export" summary="Review each year or download the full scenario.">
            <div className="mt-4 flex justify-end"><button onClick={() => setExportVisible(v => !v)} aria-expanded={exportVisible} aria-controls="scenario-export" className="flex items-center gap-2 rounded-full border border-space-border px-3 py-2 text-xs hover:bg-space-dark"><Download size={14} /> Export scenario CSV</button></div>
            {exportVisible && <div id="scenario-export" className="mt-4 rounded-lg border border-space-border bg-space-void p-4">
              <label htmlFor="scenario-csv" className="mb-2 block text-xs text-text-secondary">Copy or download your assumptions and annual projection.</label>
              <textarea id="scenario-csv" readOnly value={scenarioCsv()} rows={6} className="w-full rounded-md border border-space-border bg-space-card p-3 font-mono text-[11px]" onFocus={e => e.currentTarget.select()} />
              <button onClick={exportCsv} className="mt-3 rounded-full border border-space-border px-3 py-2 text-xs hover:bg-space-dark">Download CSV file</button>
            </div>}
            <details className="mt-3"><summary className="cursor-pointer text-sm font-semibold">Show annual breakdown</summary>
              <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[800px] text-xs"><thead><tr className="border-b border-space-border">{["Year", "Mortgage rate", "Monthly payment", "Mortgage left", "Buy net worth", "Rent net worth", "Buy cash outflow", "Rent cash outflow", "Rent moves"].map(h => <th key={h} className="px-2 py-3 text-right first:text-left font-medium text-text-secondary">{h}</th>)}</tr></thead>
                <tbody>{result.points.map(p => <tr key={p.year} className="border-b border-space-border"><th className="px-2 py-3 text-left font-medium">{p.year}</th><td className="px-2 py-3 text-right font-mono">{p.monthlyMortgagePayment === 0 ? "—" : `${p.mortgageRate.toFixed(2)}%`}</td><td className="px-2 py-3 text-right font-mono">{money(p.monthlyMortgagePayment)}</td>{[p.debt, p.buyWealth, p.rentWealth, p.ownerCashOutflow, p.renterCashOutflow, p.movingPaid].map((v, i) => <td key={i} className="whitespace-nowrap px-2 py-3 text-right font-mono">{money(v)}</td>)}</tr>)}</tbody>
              </table></div>
            </details>
          </Disclosure>
        </>}
        <Disclosure title="Method & assumptions" summary="Read the calculation rules and what the model leaves out.">
          <div className="mt-4 space-y-3 text-sm leading-relaxed text-text-secondary">
            <p>Both paths begin with the same cash and use the same monthly budget. Initial moving and closing costs are paid before investing. The cheaper path invests the monthly difference after other expenses and scheduled moves; deposits occur at month-end. Year-end net worth assumes a hypothetical sale with your entered cash selling cost. The home is not actually sold and repurchased each year.</p>
            <p>Expense inputs are first-year cash budgets. Inflation is a percentage compounded each anniversary: a 16,200 annual budget at 2% becomes 16,524 in year 2 and 16,854.48 in year 3. Rent uses its own rate; other rental expenses and future moving costs use rental expense inflation. Condo costs marked as included in fees are excluded from separate charges, while the fees themselves still grow with ownership inflation.</p>
            <p>The mortgage starts at your entered rate. At each future rate-change year, the payment is recalculated on the outstanding balance over the remaining original repayment period. Each new rate continues until the next change; without changes, the starting rate stays constant. Changes take effect at the start of a year. Refinancing, renewal fees, within-year changes and variable-rate loans with fixed payments are not modelled. Mortgage payments amortize monthly; home appreciation and investment returns remain percentage assumptions because they measure asset growth. Investment returns compound monthly at the equivalent of the entered annual after-fee, after-tax return.</p>
            <p>Amounts are nominal. Home sale taxes, mortgage tax deductions, refundable rental deposits, special assessments, financed insurance premiums and prepayment penalties are excluded. Utilities are assumed equal in both paths and excluded from cash outflows, investment savings and break-even calculations. Remove bundled utility charges from rent or condo fees before entering them; this tool compares housing costs rather than your full household budget. Annual mortgage insurance continues until loan payoff; eligibility and cancellation rules are not calculated. This is a financial scenario comparison, not a personal affordability assessment.</p>
            <p>Costs to check against your own quotes: <a className="underline underline-offset-4" href="https://www.consumerfinance.gov/owning-a-home/prepare/figure-out-how-much-you-want-to-spend/" target="_blank" rel="noopener noreferrer">CFPB homeownership cost guide <ArrowUpRight className="inline" size={12} /></a>. For loan term and amortization: <a className="underline underline-offset-4" href="https://www.canada.ca/en/financial-consumer-agency/services/mortgages/mortgage-terms-amortization.html" target="_blank" rel="noopener noreferrer">Financial Consumer Agency of Canada <ArrowUpRight className="inline" size={12} /></a>.</p>
          </div>
        </Disclosure>
      </div>
    </div>
  </div>;
}
