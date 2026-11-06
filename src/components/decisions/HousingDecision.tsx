"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowDown, ArrowRight, RotateCcw } from "lucide-react";
import { DEFAULT_SIMPLE_HOUSING, modelSimpleHousing, simpleHousingCsv, validateSimpleHousing, type SimpleHousingInputs } from "@/lib/housing-model";
import { action, panel, SimulationChart, SimulationExport, SimulationField } from "./SimulationUI";

type NumericKey = Exclude<keyof SimpleHousingInputs, "compounding">;
const currencies = [
  ["CAD", "Canadian dollar"], ["USD", "US dollar"], ["EUR", "Euro"], ["GBP", "British pound"], ["INR", "Indian rupee"],
  ["AUD", "Australian dollar"], ["NZD", "New Zealand dollar"], ["CHF", "Swiss franc"], ["JPY", "Japanese yen"], ["CNY", "Chinese yuan"],
  ["HKD", "Hong Kong dollar"], ["SGD", "Singapore dollar"], ["AED", "UAE dirham"], ["SAR", "Saudi riyal"], ["QAR", "Qatari riyal"],
  ["KWD", "Kuwaiti dinar"], ["BHD", "Bahraini dinar"], ["OMR", "Omani rial"], ["KRW", "South Korean won"], ["TWD", "Taiwan dollar"],
  ["THB", "Thai baht"], ["MYR", "Malaysian ringgit"], ["IDR", "Indonesian rupiah"], ["PHP", "Philippine peso"], ["VND", "Vietnamese dong"],
  ["ZAR", "South African rand"], ["BRL", "Brazilian real"], ["MXN", "Mexican peso"], ["COP", "Colombian peso"], ["CLP", "Chilean peso"],
  ["TRY", "Turkish lira"], ["SEK", "Swedish krona"], ["NOK", "Norwegian krone"], ["DKK", "Danish krone"], ["PLN", "Polish zloty"],
  ["ILS", "Israeli shekel"], ["EGP", "Egyptian pound"], ["PKR", "Pakistani rupee"], ["BDT", "Bangladeshi taka"], ["LKR", "Sri Lankan rupee"],
];
const basicFields: { key: NumericKey; label: string; hint: string; unit: string; min?: number; max?: number; step?: number }[] = [
  { key: "price", label: "Home purchase price", hint: "The price of the home you would buy.", unit: "money", min: 1, max: 1e8 },
  { key: "rent", label: "Monthly rent for a similar home", hint: "Use a comparable home and exclude utilities.", unit: "money/mo", max: 1e8 },
  { key: "downPayment", label: "Your down payment", hint: "This becomes part of your home equity.", unit: "money", max: 1e8 },
  { key: "mortgageRate", label: "Mortgage interest rate", hint: "Held constant for this simple comparison.", unit: "%/yr", max: 100 },
  { key: "amortization", label: "Years to repay the mortgage", hint: "The full repayment period, not the renewal term.", unit: "years", min: 1, max: 40, step: 1 },
  { key: "years", label: "How long will you live here?", hint: "Both options are compared over this same period.", unit: "years", min: 1, max: 100, step: 1 },
];

export default function HousingDecision() {
  const [x, setX] = useState<SimpleHousingInputs>({ ...DEFAULT_SIMPLE_HOUSING });
  const [currency, setCurrency] = useState("CAD");
  const errors = validateSimpleHousing(x);
  const result = useMemo(() => validateSimpleHousing(x).length ? null : modelSimpleHousing(x), [x]);
  const money = (v: number) => new Intl.NumberFormat("en-CA", { style: "currency", currency, maximumFractionDigits: 0 }).format(Math.abs(v) < 0.5 ? 0 : v);
  const set = (key: NumericKey, value: number | null) => setX(p => ({ ...p, [key]: value ?? NaN }));
  const number = (key: NumericKey) => Number.isFinite(x[key]) ? x[key] : "";
  const field = (key: NumericKey, label: string, unit: string, hint: string, min = 0, max = 1e8, step: number | "any" = "any") =>
    <SimulationField id={`home-${key}`} label={label} unit={unit} hint={hint} min={min} max={max} step={step} value={x[key]} onChange={v => set(key,v)} />;
  const costInput = (key: NumericKey, label: string, monthly = true) => <>
    <label htmlFor={`home-${key}`} className="sr-only">{label} ({monthly ? "per month" : "one-time"}, {currency})</label>
    <input id={`home-${key}`} type="number" inputMode="decimal" min={0} max={monthly ? 8000000 : 1e8} step="any" value={number(key)}
      onChange={e => set(key, e.target.value === "" ? NaN : Number(e.target.value))}
      className="w-full min-w-0 rounded-lg border border-space-border bg-space-void px-2 py-2.5 text-right font-mono text-sm outline-none [appearance:textfield] focus:border-neon-cyan [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" />
  </>;
  const figure = (v: number | undefined) => v === undefined ? "—" : money(v);
  const monthlyGap = result ? result.buyMonthlyBill - result.rentMonthlyBill : 0;
  const noExtraCosts = x.renterInsurance + x.homeInsurance + x.propertyTax + x.strata + x.maintenance + x.closingCosts + x.ownerMoving + x.renterMoving === 0;
  const summaryClass = "grid grid-cols-2 gap-4 rounded-xl bg-space-void p-4 sm:p-5";

  return <div className="section-shell space-y-6 py-8 sm:py-12">
    <Link href="/decisions" className="inline-flex text-sm text-text-secondary hover:text-neon-cyan">← All decisions</Link>
    <header className="border-b border-space-border pb-7">
      <p className="text-xs uppercase tracking-widest text-neon-cyan">Decision Studio</p>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-5">
        <div><h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Buy or rent? Keep it simple.</h1><p className="mt-3 max-w-2xl text-sm leading-relaxed text-text-secondary">Compare the bills, the cash you need upfront, and what happens if you invest the difference.</p></div>
        <label htmlFor="home-currency" className="block text-xs font-semibold">Currency<select id="home-currency" value={currency} onChange={e => setCurrency(e.target.value)} className="mt-2 block max-w-full rounded-lg border border-space-border bg-space-card p-2 text-sm">{currencies.map(([code,name]) => <option key={code} value={code}>{code} · {name}</option>)}</select><span className="mt-1 block text-[11px] font-normal text-text-secondary">Labels only; amounts are not converted.</span></label>
      </div>
    </header>

    <section className={panel} aria-labelledby="home-basics-title">
      <div className="flex flex-wrap items-center justify-between gap-3"><h2 id="home-basics-title" className="text-lg font-semibold">Start with the two homes</h2><button type="button" onClick={() => setX({ ...DEFAULT_SIMPLE_HOUSING })} className={`${action} inline-flex items-center gap-2`}><RotateCcw size={13} />Reset</button></div>
      <p className="mt-2 text-xs leading-relaxed text-text-secondary">The starting price, rent and loan are examples. Other costs and growth start at zero—add your own numbers below.</p>
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{basicFields.map(f => <div key={f.key}>{field(f.key, f.label, f.unit.replace("money",currency), f.hint, f.min ?? 0, f.max, f.step)}</div>)}</div>
      <div className="mt-6 grid items-center gap-5 border-t border-space-border pt-5 sm:grid-cols-2">
        {field("rentInflation","Annual rent increase","%/yr","Rent rises by this percentage once a year, starting in year 2. Zero keeps rent flat.",0,30)}
        {result && <p className="text-xs leading-relaxed text-text-secondary">{x.rentInflation === 0 ? `At 0%, rent stays at ${money(x.rent)}/month.` : x.years === 1 ? `Rent is ${money(x.rent)}/month for this one-year comparison. The first increase would apply in year 2.` : <>At {x.rentInflation}% a year, monthly rent reaches <strong className="text-text-primary">{money(result.final.rentPaid / 12)} in year {x.years}</strong>. Higher rent leaves less to invest when renting, and can give the buyer more to invest.</>}</p>}
      </div>
      <details className="mt-5 text-xs"><summary className="cursor-pointer text-text-secondary">Mortgage calculation setting</summary><label htmlFor="home-compounding" className="mt-3 block">How your quoted mortgage rate compounds<select id="home-compounding" value={x.compounding} onChange={e => setX(p => ({ ...p, compounding: e.target.value as SimpleHousingInputs["compounding"] }))} className="ml-0 mt-2 block w-full max-w-full rounded-lg border border-space-border bg-space-void p-2 sm:ml-3 sm:inline-block sm:w-auto"><option value="semiannual">Semiannual · Canadian fixed-rate convention</option><option value="monthly">Monthly nominal</option></select></label><p className="mt-2 max-w-2xl leading-relaxed text-text-secondary">Payments are calculated monthly and stop when the mortgage is repaid. Future renewal rates are not modelled.</p></details>
    </section>

    {errors.length > 0 && <div role="alert" className="rounded-xl border border-market-down p-5 text-sm text-market-down">{errors.map(error => <p key={error}>{error}</p>)}</div>}

    <div className="grid items-start gap-6 lg:grid-cols-2">
      <section className={panel} aria-labelledby="home-bills-title">
        <p className="text-xs font-semibold uppercase tracking-widest text-neon-cyan">1 · Your monthly bills</p>
        <h2 id="home-bills-title" className="mt-2 text-2xl font-semibold tracking-tight">What leaves your bank account?</h2>
        <p className="mt-3 text-xs leading-relaxed text-text-secondary">Enter monthly amounts in {currency}. For an annual bill, divide by 12. Use zero for costs that do not apply.</p>
        <table className="mt-5 w-full table-fixed text-xs"><caption className="sr-only">Monthly housing bills, with editable insurance, property tax, strata fees and maintenance</caption><colgroup><col className="w-[42%]" /><col className="w-[29%]" /><col className="w-[29%]" /></colgroup>
          <thead><tr className="border-b border-space-border"><th scope="col" className="pb-3 text-left font-normal text-text-secondary">Per month · year 1</th><th scope="col" className="pb-3 pl-2 text-right">Renting</th><th scope="col" className="pb-3 pl-2 text-right">Buying</th></tr></thead>
          <tbody>
            <tr><th scope="row" className="py-4 pr-2 text-left font-normal">Rent / mortgage<span className="mt-1 block text-[10px] text-text-secondary">Mortgage includes principal.</span></th><td className="py-4 pl-2 text-right font-mono">{figure(result?.rentMonthlyBill === undefined ? undefined : x.rent)}</td><td className="py-4 pl-2 text-right font-mono">{figure(result?.payment)}</td></tr>
            <tr><th scope="row" className="py-2 pr-2 text-left font-normal">Insurance</th><td className="py-2 pl-2">{costInput("renterInsurance","Renter insurance")}</td><td className="py-2 pl-2">{costInput("homeInsurance","Home insurance")}</td></tr>
            {[{key:"propertyTax",label:"Property tax"},{key:"strata",label:"Strata / HOA fees"},{key:"maintenance",label:"Maintenance & repairs"}].map(row => <tr key={row.key}><th scope="row" className="py-2 pr-2 text-left font-normal">{row.label}</th><td className="py-2 pl-2 text-right text-text-muted">—</td><td className="py-2 pl-2">{costInput(row.key as NumericKey,row.label)}</td></tr>)}
          </tbody>
          <tfoot><tr className="border-t border-space-border font-semibold"><th className="pt-4 pr-2 text-left">Monthly total</th><td className="pt-4 pl-2 text-right font-mono">{figure(result?.rentMonthlyBill)}</td><td className="pt-4 pl-2 text-right font-mono">{figure(result?.buyMonthlyBill)}</td></tr></tfoot>
        </table>
        {result && <div className="mt-5 rounded-xl bg-space-void p-4 text-xs leading-relaxed"><p className="font-semibold">{Math.abs(monthlyGap) < 1 ? "The monthly bills are about the same." : `${monthlyGap > 0 ? "Renting" : "Buying"} frees up about ${money(Math.abs(monthlyGap))} a month in year 1.`}</p><p className="mt-2 text-text-secondary">Of the buying bill, about <strong className="font-semibold text-text-primary">{money(result.monthlyPrincipal)}/month pays down your mortgage</strong> and {money(result.monthlyInterest)}/month is interest. These are first-year averages.</p></div>}
        <p className="mt-4 text-[11px] leading-relaxed text-text-secondary">Property tax and strata fees can both apply. Avoid entering costs already included in fees. Condo building insurance may not replace your personal policy. Utilities are assumed equal and excluded.</p>
      </section>

      <section className={panel} aria-labelledby="home-upfront-title">
        <p className="text-xs font-semibold uppercase tracking-widest text-neon-cyan">2 · Cash at the start</p>
        <h2 id="home-upfront-title" className="mt-2 text-2xl font-semibold tracking-tight">What do you need upfront?</h2>
        <p className="mt-3 text-xs leading-relaxed text-text-secondary">One-time amounts in {currency}. Include movers, setup and any overlapping rent in moving costs.</p>
        <table className="mt-5 w-full table-fixed text-xs"><caption className="sr-only">Upfront cash required for renting and buying</caption><colgroup><col className="w-[42%]" /><col className="w-[29%]" /><col className="w-[29%]" /></colgroup>
          <thead><tr className="border-b border-space-border"><th scope="col" className="pb-3 text-left font-normal text-text-secondary">One time</th><th scope="col" className="pb-3 pl-2 text-right">Renting</th><th scope="col" className="pb-3 pl-2 text-right">Buying</th></tr></thead>
          <tbody>
            <tr><th scope="row" className="py-4 pr-2 text-left font-normal">Down payment</th><td className="py-4 pl-2 text-right text-text-muted">—</td><td className="py-4 pl-2 text-right font-mono">{Number.isFinite(x.downPayment) ? money(x.downPayment) : "—"}</td></tr>
            <tr><th scope="row" className="py-2 pr-2 text-left font-normal">Buying / closing fees<span className="mt-1 block text-[10px] text-text-secondary">Legal, transfer tax, inspection.</span></th><td className="py-2 pl-2 text-right text-text-muted">—</td><td className="py-2 pl-2">{costInput("closingCosts","Buying / closing fees",false)}</td></tr>
            <tr><th scope="row" className="py-2 pr-2 text-left font-normal">Moving in</th><td className="py-2 pl-2">{costInput("renterMoving","Rental moving costs",false)}</td><td className="py-2 pl-2">{costInput("ownerMoving","Purchase moving costs",false)}</td></tr>
          </tbody>
          <tfoot><tr className="border-t border-space-border font-semibold"><th className="pt-4 pr-2 text-left">Cash needed</th><td className="pt-4 pl-2 text-right font-mono">{figure(result?.renterUpfront)}</td><td className="pt-4 pl-2 text-right font-mono">{figure(result?.upfront)}</td></tr></tfoot>
        </table>
        <div className="mt-5 rounded-xl bg-space-void p-4 text-xs leading-relaxed"><p className="font-semibold">Your down payment is still your money.</p><p className="mt-2 text-text-secondary">It goes into the home. Closing fees, insurance, interest, tax, fees, repairs and moving are expenses. Mortgage principal also builds equity; it is not counted again as a cost.</p></div>
        <p className="mt-4 text-[11px] leading-relaxed text-text-secondary">This simple comparison assumes one move at the start. Refundable deposits and financed mortgage insurance are excluded.</p>
      </section>
    </div>

    {result && <section className={panel} aria-labelledby="home-cost-title">
      <h2 id="home-cost-title" className="text-lg font-semibold">The cost of living here over {x.years} years</h2><p className="mt-2 text-xs leading-relaxed text-text-secondary">Renting: rent + insurance + moving. Buying: interest + insurance + tax + strata + maintenance + buying, moving and selling fees. Down payment and mortgage principal are excluded because they build equity.</p>
      <div className={`${summaryClass} mt-5`}><div><p className="text-xs text-text-secondary">Renting · total costs</p><p className="mt-2 break-words font-mono text-2xl">{money(result.rentCost)}</p><p className="mt-1 text-[11px] text-text-secondary">{money(result.averageRentCost)}/month on average</p></div><div><p className="text-xs text-text-secondary">Buying · total costs</p><p className="mt-2 break-words font-mono text-2xl">{money(result.buyCost)}</p><p className="mt-1 text-[11px] text-text-secondary">{money(result.averageBuyCost)}/month on average</p></div></div>
      <details className="mt-4"><summary className="cursor-pointer text-xs font-semibold">See how these costs add up</summary><div className="mt-4 grid gap-6 sm:grid-cols-2">{[{label:"Renting",rows:result.rentCosts},{label:"Buying",rows:result.buyCosts}].map(group => <div key={group.label}><h3 className="mb-3 text-sm font-semibold">{group.label}</h3><dl className="space-y-2 text-xs">{group.rows.map(row => <div key={row.label} className="flex justify-between gap-4 border-t border-space-border pt-2"><dt className="text-text-secondary">{row.label}</dt><dd className="shrink-0 font-mono">{money(row.value)}</dd></div>)}</dl></div>)}</div></details>
      {noExtraCosts && <p className="mt-4 text-xs font-semibold text-neon-purple">Only rent and mortgage interest are included so far. Add insurance, tax, fees, maintenance and moving above for a fuller comparison.</p>}
    </section>}

    <section className={panel} id="home-investing" aria-labelledby="home-investing-title">
      <p className="text-xs font-semibold uppercase tracking-widest text-neon-cyan">3 · Invest the difference</p><h2 id="home-investing-title" className="mt-2 text-2xl font-semibold tracking-tight">What could you have at the end?</h2>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-text-secondary">If you rent, invest the cash you did not use to buy the home. Then invest any monthly savings. If buying has lower monthly bills, the buyer invests those savings too.</p>
      <div className="mt-6 grid gap-5 sm:grid-cols-2">{field("investmentReturn","Market return after fees & tax","%/yr","Your annual total-return assumption, including reinvested income. It can be negative.",-20,30)}{field("appreciation","Home value growth","%/yr","Your annual change in home value. Zero keeps its price flat.",-20,30)}</div>
      <details className="mt-5"><summary className="cursor-pointer text-xs text-text-secondary">Include selling fees at the end</summary><div className="mt-4 max-w-sm">{field("sellingCosts","Selling fees","one time","Cash estimate for selling the home at the end. Zero excludes these fees.")}</div></details>
      <p className="mt-4 text-[11px] leading-relaxed text-text-secondary">Both growth assumptions start at 0%. Rent follows the annual increase entered above; other bills stay flat. These are steady-return illustrations, not forecasts; market investments and home values can fall.</p>
      {result && <>
        <div className="mt-7 rounded-2xl border border-space-border p-5 sm:p-7" style={{background:"var(--color-wash)"}}>
          <div aria-live="polite"><p className="text-xs uppercase tracking-widest text-text-secondary">After {x.years} years · Your assumptions</p><h3 className="mt-3 text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">{Math.abs(result.final.difference) < 1 ? "Both paths leave about the same amount." : <>{result.final.difference > 0 ? "Buying" : "Renting and investing"} could leave you <span className="text-neon-cyan">{money(Math.abs(result.final.difference))}</span> ahead.</>}</h3></div>
          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-space-border pt-5"><div><p className="text-xs text-text-secondary">Renting · market investments</p><p className="mt-2 break-words font-mono text-2xl sm:text-3xl">{money(result.final.rentWealth)}</p></div><div><p className="text-xs text-text-secondary">Buying · home equity + investments</p><p className="mt-2 break-words font-mono text-2xl sm:text-3xl">{money(result.final.buyWealth)}</p></div></div>
          <p className="mt-4 text-xs leading-relaxed text-text-secondary">Buying assumes the home is sold and the remaining mortgage and entered selling fees are paid. These balances cover this housing decision only.</p>
        </div>
        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-space-border p-5"><h3 className="text-sm font-semibold">How renting builds investments</h3><dl className="mt-4 space-y-3 text-xs">{[["Cash invested at the start",result.renterInitialInvestments],["Monthly savings invested over the period",result.final.renterContributions],["Market growth / loss",result.final.renterMarketGain],["Investments at the end",result.final.rentWealth]].map(([label,value],i) => <div key={label} className={`flex justify-between gap-4 ${i === 3 ? "border-t border-space-border pt-3 font-semibold" : ""}`}><dt className="text-text-secondary">{label}</dt><dd className="shrink-0 font-mono">{money(Number(value))}</dd></div>)}</dl></div>
          <div className="rounded-xl border border-space-border p-5"><h3 className="text-sm font-semibold">How buying builds wealth</h3><dl className="mt-4 space-y-3 text-xs">{[["Home value at the end",result.final.homeValue],["Less remaining mortgage & selling fees",-result.final.debt-x.sellingCosts],["Plus buyer’s market investments",result.final.ownerInvestments],["Home equity + investments",result.final.buyWealth]].map(([label,value],i) => <div key={label} className={`flex justify-between gap-4 ${i === 3 ? "border-t border-space-border pt-3 font-semibold" : ""}`}><dt className="text-text-secondary">{label}</dt><dd className="shrink-0 font-mono">{money(Number(value))}</dd></div>)}</dl></div>
        </div>
        <div className="mt-5 flex items-start gap-2 text-xs leading-relaxed text-text-secondary"><ArrowRight size={15} className="mt-0.5 shrink-0 text-neon-cyan" /><p>Both start with {money(result.startingCash)} and use the same monthly budget. The renting path first pays {money(result.renterUpfront)} to move, then invests {money(result.renterInitialInvestments)}. The buyer invests any unused starting cash and lower monthly bills. {result.loan === 0 ? "A cash purchase has no mortgage payments." : `Mortgage payments stop after ${x.amortization} years; any savings after payoff are invested.`}</p></div>
        <details className="mt-6 border-t border-space-border pt-5"><summary className="flex cursor-pointer items-center gap-2 text-sm font-semibold">See the projection & download your numbers<ArrowDown size={14} /></summary><div className="mt-5"><SimulationChart labels={result.points.map(p => `Year ${p.year}`)} series={[{name:"Renting + investing",values:result.points.map(p => p.rentWealth)},{name:"Buying + investing",values:result.points.map(p => p.buyWealth)}]} format={money} description="Year-end market investments for renting compared with home equity and investments for buying. Exact values are in the yearly table and CSV." /></div><div className="mt-4 overflow-x-auto"><table className="w-full min-w-[600px] text-xs"><caption className="sr-only">Year-end mortgage and investment balances for renting and buying</caption><thead><tr>{["Year","Monthly rent","Mortgage left","Rent investments","Buyer investments","Buy equity + investments"].map(label => <th key={label} scope="col" className="p-2 text-right first:text-left">{label}</th>)}</tr></thead><tbody>{result.points.map(p => <tr key={p.year} className="border-t border-space-border"><th scope="row" className="p-2 text-left font-normal">{p.year}</th>{[p.rentPaid/12,p.debt,p.rentWealth,p.ownerInvestments,p.buyWealth].map((v,i) => <td key={i} className="p-2 text-right font-mono">{money(v)}</td>)}</tr>)}</tbody></table></div><SimulationExport csv={simpleHousingCsv(x,currency)} filename="buy-vs-rent" /></details>
      </>}
    </section>

    <details className={panel}><summary className="cursor-pointer text-sm font-semibold">A few simple rules behind the numbers</summary><div className="mt-4 max-w-3xl space-y-3 text-xs leading-relaxed text-text-secondary">
      <p>Costs are money spent on housing: rent or mortgage interest, insurance, tax, strata fees, maintenance and one-time moving and transaction fees. The down payment and mortgage principal go toward ownership of the home. They are cash you must pay, but are not charged again as an expense.</p>
      <p>The monthly bills show first-year averages. Mortgage interest falls as the balance is repaid, while principal repayment rises. The full principal-and-interest payment stays fixed until payoff. The cost totals use actual mortgage interest over your selected stay and include any entered selling fees. An average cost per month spreads those totals over the comparison period; it is different from the monthly cash bill.</p>
      <p>Both options start with the larger upfront cash requirement. Each pays its own upfront costs and invests any cash left over. Every month, the option with lower bills invests the difference after existing investments grow. Contributions happen at month-end. Investment return is an effective annual assumption after fees and tax, converted to its equivalent monthly rate. No extra income or borrowing is invented.</p>
      <p>Rent increases at each anniversary using your annual rent increase: monthly rent × (1 + increase / 100) raised to the number of completed years. The first increase is in year 2. Total rental costs and monthly investment savings use that rising rent. Other bills and mortgage rates stay constant. One move is included at the start. Home value and market investments use the growth rates you enter. Inflation of other bills, future mortgage renewals, repeated moves, refundable deposits, financed mortgage insurance, mortgage tax deductions and home-sale taxes are excluded. Utilities are assumed equal; remove any bundled utility portion from rent or strata fees. Include known extra purchase fees in closing costs.</p>
      <p>Use your own quotes and budgets. See <a className="underline" href="https://www.canada.ca/en/financial-consumer-agency/services/buying-home.html" target="_blank" rel="noopener noreferrer">FCAC’s home-buying costs</a> and <a className="underline" href="https://www.cmhc-schl.gc.ca/consumers/home-buying/buying-guides/condominium/condominium-purchase-and-recurring-costs" target="_blank" rel="noopener noreferrer">CMHC’s condo cost guide</a>. Market gains are not guaranteed; <a className="underline" href="https://www.investor.gov/introduction-investing" target="_blank" rel="noopener noreferrer">Investor.gov explains investing and compounding</a>.</p>
      <p>This is a planning comparison, not an affordability or lending-eligibility test. Your inputs stay in this browser and are not saved or transmitted.</p>
    </div></details>
  </div>;
}
