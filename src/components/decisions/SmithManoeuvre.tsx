"use client";

import { useMemo, useState } from "react";
import { DEFAULT_SMITH, modelSmith, smithCsv, validateSmith, type SmithInputs } from "@/lib/smith-manoeuvre";
import { action, panel, SimulationChart, SimulationExport, SimulationField, SimulationMetric, SimulationShell, SimulationToggle } from "./SimulationUI";

const money = (v: number) => new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 }).format(v);
const payoff = (month: number | null) => month === null ? "Beyond 30 years" : `${(month / 12).toFixed(1)} years`;
type NumericKey = { [K in keyof SmithInputs]: SmithInputs[K] extends number ? K : never }[keyof SmithInputs];

export default function SmithManoeuvre() {
  const [x, setX] = useState<SmithInputs>({ ...DEFAULT_SMITH });
  const [view, setView] = useState<"advantage" | "balances">("advantage");
  const error = validateSmith(x);
  const result = useMemo(() => error ? null : modelSmith(x), [x, error]);
  const scenarios = useMemo(() => error ? [] : [
    { label: "Your assumptions", inputs: x },
    { label: "Price growth 2 points lower", inputs: { ...x, growth: Math.max(-99, x.growth - 2) } },
    { label: "HELOC rate 2 points higher", inputs: { ...x, helocRate: Math.min(100, x.helocRate + 2) } },
    { label: "Both changes together", inputs: { ...x, growth: Math.max(-99, x.growth - 2), helocRate: Math.min(100, x.helocRate + 2) } },
  ].map(s => ({ ...s, advantage: modelSmith(s.inputs).headline.advantage })), [x, error]);
  const field = (key: NumericKey, label: string, unit: string, hint: string, min = 0, max = 100, step: number | "any" = "any") =>
    <SimulationField key={key} id={`smith-${key}`} label={label} unit={unit} hint={hint} value={x[key]} min={min} max={max} step={step} onChange={v => setX(p => ({ ...p, [key]: v ?? NaN }))} />;
  const selected = result?.headline;
  const final = result?.months.at(-1);
  return <SimulationShell title="The Smith Manoeuvre" intro="Use repaid mortgage principal to borrow and invest. See how investment returns, borrowing costs and your taxes change the outcome.">
    <section className={`${panel} mb-6`}>
      <h2 className="text-lg font-semibold">In simple English</h2>
      <ol className="mt-4 grid list-inside list-decimal gap-4 text-sm leading-relaxed sm:grid-cols-2">
        <li>You make your normal mortgage payment, reducing what you owe.</li>
        <li>A readvanceable mortgage lets you borrow that repaid principal through a home equity line of credit (HELOC).</li>
        <li>You invest the borrowed money in a taxable account with investments expected to earn income.</li>
        <li>Eligible investment-loan interest can reduce taxable income. You use the tax savings and after-tax investment income to pay down more mortgage, then repeat.</li>
      </ol>
      <p className="mt-5 border-t border-space-border pt-4 text-sm leading-relaxed text-text-secondary">Your mortgage shrinks while your investment loan grows. You still owe the HELOC, secured against your home, and investments can fall in value. The strategy works only if the overall investment and tax benefits outweigh its costs.</p>
      <p className="mt-4 text-xs leading-relaxed text-text-secondary"><strong className="text-text-primary">Why might CRA allow the deduction?</strong> The borrowed money is used to earn investment income. The use of the funds must be traceable, and other eligibility rules apply. Personal spending, TFSA/RRSP contributions and investments capable of producing only capital gains do not qualify. See <a className="underline" href="https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/about-your-tax-return/tax-return/completing-a-tax-return/deductions-credits-expenses/line-22100-carrying-charges-interest-expenses.html" target="_blank" rel="noopener noreferrer">CRA’s interest-deduction rules</a>.</p>
      <p className="mt-3 text-xs leading-relaxed text-text-secondary">This calculator uses Canadian tax assumptions. US investment-interest deductions have different limits and itemizing requirements; <a className="underline" href="https://www.irs.gov/publications/p550" target="_blank" rel="noopener noreferrer">IRS rules</a> are not modelled here.</p>
    </section>
    <div className="grid items-start gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
      <aside className="order-2 min-w-0 rounded-2xl border border-space-border bg-space-card lg:order-1">
        <div className="border-b border-space-border p-6"><div className="flex items-center justify-between gap-3"><h2 className="text-sm font-semibold">Your assumptions</h2><button type="button" className="text-xs text-neon-cyan" onClick={() => setX({ ...DEFAULT_SMITH })}>Reset</button></div><p className="mt-3 text-xs leading-relaxed text-text-secondary">All amounts in CAD. Defaults are a worked example, including returns and tax rates. Replace them with your own assumptions.</p></div>
        <section className="space-y-5 border-b border-space-border p-6"><h3 className="text-sm font-semibold">Mortgage & home</h3>
          {field("mortgage", "Starting mortgage", "CAD", "Current mortgage principal. The HELOC and portfolio start at zero.", 0, 1e9)}
          {field("homeValue", "Home value", "CAD", "Held constant; used to flag lending limits. Common home value cancels from the comparison.", 1, 1e9)}
          {field("mortgageRate", "Mortgage interest rate", "%/yr", "Fixed for the entire simulation; renewals are not modelled.")}
          {field("amortization", "Mortgage amortization", "years", "Monthly payments over this full repayment period.", 1, 30, 1)}
          <SimulationToggle label="Canadian semiannual compounding" hint="Effective monthly rate = (1 + annual rate / 2)^(1/6) − 1. Turn off for nominal monthly compounding." checked={x.semiannual} onChange={semiannual => setX(p => ({ ...p, semiannual }))} />
        </section>
        <section id="smith-taxes" className="scroll-mt-24 space-y-5 border-b border-space-border p-6"><h3 className="text-sm font-semibold">Your personal tax rates</h3>
          <p className="text-xs leading-relaxed text-text-secondary">These rates are included in the result. Enter combined federal and provincial rates for your circumstances; the examples are not calculated from your income or province.</p>
          {field("marginalTax", "Personal marginal tax rate", "%", "Used for the tax saving on eligible HELOC interest. A 33% rate means a $33 saving per $100 of deductible interest.")}
          {field("incomeTax", "Effective tax on investment income", "%", "Tax as a share of cash distributions. Interest and different dividends can have different tax treatment; enter a blended effective rate for your portfolio.")}
          {field("gainsTax", "Personal tax rate when you sell", "%", "Applied to the taxable portion of gains on an illustrative sale. It can differ from your current rate, for example in retirement.")}
          {field("inclusion", "Capital gain included in taxable income", "%", "50% means half of a positive gain is taxed at your sale-year personal rate. Editable assumption; losses receive no automatic tax credit.")}
          <p className="rounded-lg bg-space-void p-3 text-xs leading-relaxed">Effective tax on a positive capital gain: {Number.isFinite(x.inclusion * x.gainsTax) ? `${(x.inclusion * x.gainsTax / 100).toFixed(2)}%` : "—"}. Calculated as {Number.isFinite(x.inclusion) ? x.inclusion : "—"}% included × {Number.isFinite(x.gainsTax) ? x.gainsTax : "—"}% personal tax rate.</p>
        </section>
        <section className="space-y-5 border-b border-space-border p-6"><h3 className="text-sm font-semibold">Borrowing & investing</h3>
          {field("helocRate", "HELOC interest rate", "%/yr", "Constant nominal rate, charged monthly on the opening balance.")}
          {field("yield", "Portfolio income yield", "%/yr", "Cash distributions, separate from price growth. Assumed constant before tax and paid monthly.")}
          {field("growth", "Portfolio price growth", "%/yr", "Separate from income yield; annual assumption divided by 12. Losses are allowed.", -99)}
          <SimulationToggle label="Add HELOC interest to the loan" hint="Otherwise paid from cash. Capitalizing increases debt. The model assumes all interest is deductible; actual compound-interest treatment may differ." checked={x.capitalizeInterest} onChange={capitalizeInterest => setX(p => ({ ...p, capitalizeInterest }))} />
          {field("headlineYear", "Show result at year", "year", "Select a year within the fixed 30-year projection.", 1, 30, 1)}
        </section>
        <details className="p-6"><summary className="cursor-pointer text-sm font-semibold">Prepayments & refund timing</summary><div className="mt-5 space-y-5">
          {field("prepayShare", "Income used for mortgage prepayments", "%", "Share of after-tax income; refunds are also applied. Unused cash is retained without earning returns.")}
          {field("refundMonth", "Annual tax refund month", "1–12", "April = 4. Month 1 starts a tax year. No refund in year 1; prior-year interest is refunded once in the chosen month.", 1, 12, 1)}
        </div></details>
      </aside>
      <div className="order-1 min-w-0 space-y-5 lg:order-2">
        {error && <p role="alert" className={`${panel} text-market-down`}>{error}</p>}
        {result && selected && final && <>
          <section className={panel} style={{ background: "var(--color-wash)" }} aria-live="polite">
            <p className="text-xs uppercase tracking-widest text-neon-cyan">Year {x.headlineYear} · Conditional on your assumptions</p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">{Math.abs(selected.advantage) < 1 ? "The two paths are about equal." : <>The strategy is <span className="text-neon-cyan">{money(Math.abs(selected.advantage))}</span> {selected.advantage >= 0 ? "ahead" : "behind"}.</>}</h2>
            <p className="mt-4 text-sm leading-relaxed text-text-secondary">Includes tax on investment income, interest-deduction savings and capital gains tax on an illustrative portfolio sale, plus both debts and cumulative cash costs. This is a difference in cumulative positions, not household net worth or a guaranteed return.</p>
            <div className="mt-6 grid grid-cols-2 gap-5 border-t border-space-border pt-5">
              <SimulationMetric label="Portfolio before exit tax" value={money(selected.portfolio)} />
              <SimulationMetric label="HELOC still owed" value={money(selected.heloc)} />
              <SimulationMetric label="Smith mortgage remaining" value={money(selected.mortgage)} />
              <SimulationMetric label="Baseline mortgage remaining" value={money(selected.baselineMortgage)} />
            </div>
          </section>
          <section className={panel} aria-labelledby="smith-tax-impact">
            <div className="flex flex-wrap items-center justify-between gap-3"><h3 id="smith-tax-impact" className="text-lg font-semibold">Taxes included at year {x.headlineYear}</h3><a href="#smith-taxes" className="text-xs text-neon-cyan underline underline-offset-2">Edit your tax rates</a></div>
            <p className="mt-3 text-xs leading-relaxed text-text-secondary">The tax benefit and the tax bills both matter. Income tax is taken from distributions before mortgage prepayments. Capital gains tax is estimated once, as if you sold at year {x.headlineYear}.</p>
            <div className="mt-5 grid gap-6 sm:grid-cols-3">
              <SimulationMetric label="Interest-deduction tax savings" value={money(selected.refundsReceived)} note={`Refunds received by year ${x.headlineYear}, using your ${x.marginalTax}% personal marginal rate.`} />
              <SimulationMetric label="Tax on investment income" value={money(selected.cumulativeIncomeTax)} note={`Cumulative tax on distributions at your ${x.incomeTax}% effective rate.`} />
              <SimulationMetric label="Capital gains tax if you sell" value={money(selected.exitTax)} note={`${(x.inclusion * x.gainsTax / 100).toFixed(2)}% of the positive gain, rather than the full portfolio.`} />
            </div>
            <div className="mt-6 space-y-3 rounded-xl bg-space-void p-4 text-xs leading-relaxed">
              <p>HELOC interest incurred so far: {money(selected.cumulativeHelocInterest)}. The latest year’s deduction saving arrives the following year.</p>
              <p>Portfolio {money(selected.portfolio)} − invested principal {money(selected.costBasis)} = {money(selected.portfolio - selected.costBasis)} gain / loss.</p>
              <p>Estimated sale tax: {money(Math.max(0, selected.portfolio - selected.costBasis))} positive gain × {x.inclusion}% included × {x.gainsTax}% personal rate = <strong>{money(selected.exitTax)}</strong>.</p>
              <p>Portfolio after sale tax: <strong>{money(selected.portfolio - selected.exitTax)}</strong>, before repaying the HELOC.</p>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-text-secondary">Flat-rate estimate. Your income, province, dividend credits, tax brackets and other gains or losses can change actual tax. A deduction lowers taxable income; your actual refund depends on the rest of your tax return. This model assumes all HELOC interest qualifies and treats the tax saving as cash received the following year.</p>
          </section>
          <div className="rounded-2xl border border-space-border p-5 text-xs leading-relaxed text-text-secondary">Borrowing to invest magnifies losses as well as gains. Paying off the mortgage leaves the HELOC outstanding. This model assumes full interest deductibility and does not enforce lender limits or prepayment penalties.</div>
          {x.capitalizeInterest && <p role="status" className="rounded-2xl border border-neon-purple p-5 text-xs leading-relaxed">Capitalized interest is treated as fully deductible in this simplified model, including interest on interest. CRA rules can require compound interest to be paid before deduction. This option may overstate tax refunds.</p>}
          {(result.peakHeloc > x.homeValue * 0.65 || result.peakCombinedDebt > x.homeValue * 0.8) && <p role="status" className="rounded-2xl border border-neon-purple p-5 text-xs leading-relaxed">Lending-limit flag: the 30-year projection exceeds {result.peakHeloc > x.homeValue * 0.65 ? "65% of home value in the HELOC" : "80% of home value in combined debt"}. Borrowing continues uncapped in this model. Actual lender limits may prevent this path.</p>}
          <section className={panel}><h3 className="text-lg font-semibold">How the strategy unfolds</h3>
            <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Projection view">{(["advantage", "balances"] as const).map(v => <button type="button" key={v} aria-pressed={view === v} onClick={() => setView(v)} className={`${action} ${view === v ? "border-neon-cyan text-neon-cyan" : ""}`}>{v === "advantage" ? "Strategy advantage" : "Debt & portfolio"}</button>)}</div>
            <SimulationChart labels={result.years.map(p => `Year ${p.month / 12}`)} series={view === "advantage" ? [{ name: "Smith advantage", values: result.years.map(p => p.advantage) }, { name: "Baseline comparison", values: result.years.map(() => 0) }] : [{ name: "Portfolio before exit tax", values: result.years.map(p => p.portfolio) }, { name: "Smith total debt", values: result.years.map(p => p.heloc + p.mortgage) }, { name: "Baseline mortgage", values: result.years.map(p => p.baselineMortgage) }]} format={money} description="Thirty yearly projections of the Smith strategy advantage, or portfolio and debt balances. Exact values are available in the annual breakdown." />
            <p className="mt-2 text-xs leading-relaxed text-text-secondary">30-year projection. Returns and rates stay constant. Debt & portfolio shows gross balances; the advantage also accounts for exit tax and cumulative cash costs.</p>
          </section>
          <section className={panel}><h3 className="font-semibold">Mortgage payoff & the full 30-year model</h3><div className="mt-5 grid grid-cols-2 gap-6">
            <SimulationMetric label="Smith mortgage repaid" value={payoff(result.smithPayoff)} note="HELOC remains outstanding." />
            <SimulationMetric label="Baseline mortgage repaid" value={payoff(result.baselinePayoff)} />
            <SimulationMetric label="Mortgage interest saved" value={money(final.baselineInterestPaid - final.mortgageInterestPaid)} note="Total over 30 years, separate from HELOC interest." />
            <SimulationMetric label="Tax refunds received" value={money(final.refundsReceived)} note="Received within 30 years; year-30 interest refund falls outside the model." />
            <SimulationMetric label="Peak HELOC" value={money(result.peakHeloc)} note={`${(result.peakHeloc / x.homeValue * 100).toFixed(1)}% of the fixed home value. The 65% flag is not a borrowing cap.`} />
            <SimulationMetric label="Scheduled mortgage payment" value={`${money(result.payment)}/mo`} />
          </div></section>
          <section className={panel}><h3 className="font-semibold">What if the assumptions disappoint?</h3><p className="mt-2 text-xs text-text-secondary">Year {x.headlineYear} advantage. All other inputs stay fixed. These are deterministic stresses, not probabilities.</p><div className="mt-4 space-y-3">{scenarios.map(s => <div key={s.label} className="flex items-center justify-between gap-4 border-t border-space-border pt-3 text-xs"><span>{s.label}</span><span className="shrink-0 font-mono">{money(s.advantage)}</span></div>)}</div></section>
          <details className={panel}><summary className="cursor-pointer font-semibold">Annual breakdown & export</summary><div className="mt-5 overflow-x-auto"><table className="w-full min-w-[660px] text-xs"><caption className="sr-only">Year-end balances and cumulative strategy advantage in CAD</caption><thead><tr>{["Year", "Mortgage", "HELOC", "Portfolio", "Exit tax", "Advantage"].map(label => <th key={label} className="p-2 text-right first:text-left">{label}</th>)}</tr></thead><tbody>{result.years.map(p => <tr key={p.month} className="border-t border-space-border"><th className="p-2 text-left font-normal">{p.month / 12}</th>{[p.mortgage, p.heloc, p.portfolio, p.exitTax, p.advantage].map((v,i) => <td key={i} className="p-2 text-right font-mono">{money(v)}</td>)}</tr>)}</tbody></table></div><SimulationExport csv={smithCsv(x)} filename="smith-manoeuvre" /></details>
        </>}
        <details className={panel}><summary className="cursor-pointer font-semibold">How the calculation works</summary><div className="mt-4 space-y-3 text-xs leading-relaxed text-text-secondary">
          <p>Each month, mortgage principal repaid through the scheduled payment and prepayments is borrowed back and invested at month-end. Opening portfolio balances earn income and price growth. Income is taxed, then the selected share and the annual refund prepay the mortgage. HELOC interest uses its opening balance.</p>
          <p>Refunds equal the prior tax year’s interest multiplied by the marginal rate and arrive in the chosen month. The simulation starts in January. Cash investment income is reduced by the entered effective income-tax rate. On an illustrative exit, positive portfolio value above invested principal is multiplied by the inclusion share and sale-year personal rate. Exit tax is a snapshot liability, not an annual sale or recurring charge. Rates stay flat; provincial brackets, dividend gross-ups/credits, foreign withholding and loss offsets are not calculated separately.</p>
          <p>Smith position = portfolio − illustrative exit tax − HELOC − mortgage − cumulative external cash − cumulative scheduled mortgage payments. External cash = prepayments + cash-paid HELOC interest − after-tax income − refunds. Unused income and refunds reduce external cash costs. Baseline position = − remaining mortgage − cumulative payments. Their difference is the reported advantage.</p>
          <p>The home value is held flat and cancels between paths. Freed mortgage payments and retained cash earn no investment return. Rates and returns are constant; fees, penalties, rate renewals and lender restrictions are excluded. The 65% HELOC and 80% combined-debt limits are flags only.</p>
          <p>Interest deductibility depends on the use and tracing of borrowed funds, among other requirements. Capitalizing interest does not establish eligibility. See <a className="underline" href="https://www.canada.ca/en/revenue-agency/services/tax/technical-information/income-tax/income-tax-folios-index/series-3-property-investments-savings-plans/series-3-property-investments-savings-plan-folio-6-interest/income-tax-folio-s3-f6-c1-interest-deductibility.html" target="_blank" rel="noopener noreferrer">CRA’s interest deductibility guidance</a> and <a className="underline" href="https://www.canada.ca/en/financial-consumer-agency/services/mortgages/home-equity-line-credit.html" target="_blank" rel="noopener noreferrer">FCAC’s HELOC guide</a>.</p>
          <p>CRA explains <a className="underline" href="https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/about-your-tax-return/tax-return/completing-a-tax-return/deductions-credits-expenses/line-22100-carrying-charges-interest-expenses.html" target="_blank" rel="noopener noreferrer">interest deductions</a>, <a className="underline" href="https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/about-your-tax-return/tax-return/completing-a-tax-return/personal-income/line-12700-capital-gains/calculating-reporting-your-capital-gains-losses.html" target="_blank" rel="noopener noreferrer">capital gains and inclusion</a>, and <a className="underline" href="https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/about-your-tax-return/tax-return/completing-a-tax-return/deductions-credits-expenses/line-40425-federal-dividend-tax-credit.html" target="_blank" rel="noopener noreferrer">Canadian dividend tax credits</a>. The 50% inclusion default is an editable planning assumption, not a tax-law forecast over 30 years. Interest on money borrowed for registered accounts such as a TFSA or RRSP is not deductible; investments that can produce only capital gains do not satisfy CRA’s income-earning test.</p>
          <p>Illustrative planning only, not tax, legal or investment advice. Confirm your circumstances with your lender and tax adviser. Calculator inputs are not saved or transmitted.</p>
        </div></details>
      </div>
    </div>
  </SimulationShell>;
}
