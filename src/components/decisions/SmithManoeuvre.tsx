"use client";

import { useMemo, useState } from "react";
import { DEFAULT_SMITH, modelSmith, smithCsv, smithPriceGrowth, smithTotalReturn, validateSmith, type SmithInputs } from "@/lib/smith-manoeuvre";
import { action, panel, SimulationChart, SimulationExport, SimulationField, SimulationMetric, SimulationShell, SimulationToggle } from "./SimulationUI";

const money = (v: number) => new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 }).format(v);
const payoff = (month: number | null) => month === null ? "Beyond 30 years" : `${(month / 12).toFixed(1)} years`;
type NumericKey = { [K in keyof SmithInputs]: SmithInputs[K] extends number ? K : never }[keyof SmithInputs];

export default function SmithManoeuvre() {
  const [x, setX] = useState<SmithInputs>({ ...DEFAULT_SMITH });
  const [view, setView] = useState<"advantage" | "balances">("advantage");
  const error = validateSmith(x);
  const result = useMemo(() => error ? null : modelSmith(x), [x, error]);
  const scenarios = useMemo(() => {
    if (!result) return [];
    const growthAtSix = smithPriceGrowth(6, x.yield);
    const higherHeloc = Math.min(100, x.helocRate + 2);
    return [
      { label: "Your assumptions", advantage: result.headline.advantage },
      ...[
        { label: "6% annual total return", inputs: { ...x, growth: growthAtSix } },
        { label: "7% annual total return", inputs: { ...x, growth: smithPriceGrowth(7, x.yield) } },
        { label: `${higherHeloc}% HELOC rate`, inputs: { ...x, helocRate: higherHeloc } },
        { label: `6% annual total return and ${higherHeloc}% HELOC rate`, inputs: { ...x, growth: growthAtSix, helocRate: higherHeloc } },
        { label: "No interest tax savings", inputs: { ...x, annualTaxSavingLimit: 0 } },
      ].map(s => ({ label: s.label, advantage: modelSmith(s.inputs).headline.advantage })),
    ];
  }, [x, result]);
  const csv = useMemo(() => result ? smithCsv(x, result) : "", [x, result]);
  const field = (key: NumericKey, label: string, unit: string, hint: string, min = 0, max = 100, step: number | "any" = "any") =>
    <SimulationField key={key} id={`smith-${key}`} label={label} unit={unit} hint={hint} value={x[key]} min={min} max={max} step={step} onChange={v => setX(p => ({ ...p, [key]: v ?? NaN }))} />;
  const selected = result?.headline;
  const final = result?.months.at(-1);
  const firstAboveCombinedLimit = result?.months.find(p => p.mortgage + p.heloc - p.combinedDebtLimit >= 0.005);
  return <SimulationShell title="The Smith Manoeuvre" intro="Use repaid mortgage principal to borrow and invest. See how investment returns, borrowing costs and your taxes change the outcome.">
    <section className={`${panel} mb-6`}>
      <h2 className="text-lg font-semibold">How the Smith Manoeuvre works</h2>
      <ol className="mt-4 grid list-inside list-decimal gap-4 text-sm leading-relaxed sm:grid-cols-2">
        <li>You make your normal mortgage payment, reducing what you owe.</li>
        <li>A readvanceable mortgage can let you borrow that repaid principal through a home equity line of credit (HELOC), subject to available credit.</li>
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
          {field("homeValue", "Current appraised home value", "CAD", "Starting value for both the market projection and the lending limits.", 1, 1e9)}
          {field("homeGrowth", "Annual home price change", "%/yr", "Compound growth in market value. A decline reduces modeled lending room immediately.", -99)}
          <SimulationToggle label="Assume a lender reappraisal each year" hint="Uses the projected year-end price as the new appraisal. Leave off to keep the initial appraisal as the ceiling for lending value." checked={x.annualReappraisal} onChange={annualReappraisal => setX(p => ({ ...p, annualReappraisal }))} />
          {field("mortgageRate", "Mortgage interest rate", "%/yr", "Held constant over the projection. Enter the rate from your mortgage terms.")}
          {field("amortization", "Mortgage amortization", "years", "Monthly payments over this full repayment period.", 1, 30, 1)}
          <SimulationToggle label="Semiannual mortgage compounding" hint="Typical for Canadian fixed-rate mortgages. Use the convention in your contract. With this off, the model divides the annual rate by 12." checked={x.semiannual} onChange={semiannual => setX(p => ({ ...p, semiannual }))} />
        </section>
        <section id="smith-taxes" className="scroll-mt-24 space-y-5 border-b border-space-border p-6"><h3 className="text-sm font-semibold">Your personal tax rates</h3>
          <p className="text-xs leading-relaxed text-text-secondary">Enter combined federal and provincial estimates for your circumstances. The example uses the same 25% rate for ordinary investment income and eligible interest savings.</p>
          {field("marginalTax", "Tax savings rate on eligible interest", "%", "Before the annual dollar cap. Use an effective rate if the deduction spans multiple tax brackets.")}
          {field("annualTaxSavingLimit", "Maximum tax savings per year", "CAD", "Caps the estimated refund to reflect your taxable income and brackets. Enter zero to model no interest tax benefit.", 0, 1e9)}
          {field("incomeTax", "Effective tax on investment income", "%", "Use a blended rate for your distributions. Eligible Canadian dividends can have a different effective rate from interest or foreign dividends.")}
          {field("gainsTax", "Personal tax rate when you sell", "%", "Applied to the taxable portion of gains on an illustrative sale. It can differ from your current rate, for example in retirement.")}
          {field("inclusion", "Capital gain included in taxable income", "%", "50% means half of a positive gain is taxed at your sale-year personal rate. Editable assumption; losses receive no automatic tax credit.")}
          <p className="rounded-lg bg-space-void p-3 text-xs leading-relaxed">Effective tax on a positive capital gain: {Number.isFinite(x.inclusion * x.gainsTax) ? `${(x.inclusion * x.gainsTax / 100).toFixed(2)}%` : "—"}. Calculated as {Number.isFinite(x.inclusion) ? x.inclusion : "—"}% included × {Number.isFinite(x.gainsTax) ? x.gainsTax : "—"}% personal tax rate.</p>
        </section>
        <section className="space-y-5 border-b border-space-border p-6"><h3 className="text-sm font-semibold">Borrowing & investing</h3>
          {field("helocRate", "HELOC interest rate", "%/yr", "Enter your lender’s rate. The model holds it constant and charges interest monthly on the opening balance.")}
          <SimulationField id="smith-lenderHelocLimit" label="Lender’s approved HELOC limit" unit="CAD" hint="Optional fixed dollar ceiling. Blank uses the modeled limits alone. Enter zero if your lender offers no revolving credit." value={x.lenderHelocLimit} min={0} max={1e9} optional onChange={lenderHelocLimit => setX(p => ({ ...p, lenderHelocLimit }))} />
          {field("yield", "Portfolio income yield", "%/yr", "Monthly cash distributions are estimated from this annualized yield. Enter returns after investment fees and before personal tax.")}
          {field("growth", "Portfolio price growth", "%/yr", "Separate from income yield. The annualized price assumption is divided by 12. Enter a negative rate to model losses.", -99)}
          {!error && <p className="text-xs leading-relaxed text-text-secondary">Equivalent annual total return before personal tax with distributions reinvested is <strong>{smithTotalReturn(x).toFixed(2)}%</strong>. The projection allocates distributions as cash.</p>}
          <SimulationToggle label="Borrow to cover HELOC interest" hint="Uses available credit for interest first, if your lender permits it. You pay the remainder from cash. The tax estimate credits cash-paid interest on investment advances only." checked={x.capitalizeInterest} onChange={capitalizeInterest => setX(p => ({ ...p, capitalizeInterest }))} />
          {field("headlineYear", "Show result at year", "year", "Select a year within the fixed 30-year projection.", 1, 30, 1)}
        </section>
        <details className="p-6"><summary className="cursor-pointer text-sm font-semibold">Prepayments & refund timing</summary><div className="mt-5 space-y-5">
          {field("prepayShare", "Income used for mortgage prepayments", "%", "Share of after-tax income; refunds are also applied. Unused cash is retained without earning returns.")}
          {field("annualPrepaymentLimit", "Annual mortgage prepayment privilege", "CAD", "Maximum extra principal payment each year. Use the dollar amount from your contract. Unused room expires each December.", 0, 1e9)}
          {field("refundMonth", "Annual tax refund month", "1–12", "April = 4. The simulation starts in January. Estimated tax savings arrive once the following year.", 1, 12, 1)}
        </div></details>
      </aside>
      <div className="order-1 min-w-0 space-y-5 lg:order-2">
        {error && <p role="alert" className={`${panel} text-market-down`}>{error}</p>}
        {result && selected && final && <>
          <section className={panel} style={{ background: "var(--color-wash)" }} aria-live="polite">
            <p className="text-xs uppercase tracking-widest text-neon-cyan">Year {x.headlineYear} · Conditional on your assumptions</p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">{Math.abs(selected.advantage) < 1 ? "The two paths are about equal." : <>The strategy is <span className="text-neon-cyan">{money(Math.abs(selected.advantage))}</span> {selected.advantage >= 0 ? "ahead" : "behind"}.</>}</h2>
            <p className="mt-4 text-sm leading-relaxed text-text-secondary">Compares the cumulative cash and debt positions, including an estimated portfolio sale after tax. Borrowing is limited by modeled credit room. The result is conditional on the entered rates and returns.</p>
            <div className="mt-6 grid grid-cols-2 gap-5 border-t border-space-border pt-5">
              <SimulationMetric label="Portfolio before exit tax" value={money(selected.portfolio)} />
              <SimulationMetric label="HELOC still owed" value={money(selected.heloc)} />
              <SimulationMetric label="Smith mortgage remaining" value={money(selected.mortgage)} />
              <SimulationMetric label="Baseline mortgage remaining" value={money(selected.baselineMortgage)} />
            </div>
          </section>
          <section className={panel} aria-labelledby="smith-credit">
            <h3 id="smith-credit" className="text-lg font-semibold">Credit limits & cash needs</h3>
            <p className="mt-3 text-xs leading-relaxed text-text-secondary">The model reserves combined debt above 65% of the lending value for amortizing mortgage debt. The overall 80% ceiling and any lower approved HELOC limit also apply. <a className="underline" href="https://www.osfi-bsif.gc.ca/en/guidance/guidance-library/clarification-treatment-innovative-real-estate-secured-lending-products-under-guideline-b-20" target="_blank" rel="noopener noreferrer">OSFI’s combined-loan guidance</a></p>
            <div className="mt-5 grid grid-cols-2 gap-6">
              <SimulationMetric label={`Lending value at year ${x.headlineYear}`} value={money(selected.lendingValue)} note={`Projected home value ${money(selected.homeValue)}. Modeled appraisal ${money(selected.appraisedValue)}.`} />
              <SimulationMetric label="Credit remaining after draws" value={money(selected.availableCredit)} note={`At year ${x.headlineYear}, subject to the mortgage balance and lending limits.`} />
              <SimulationMetric label="First month with a reduced draw" value={result.firstLimitedMonth === null ? "None" : `Month ${result.firstLimitedMonth}`} note="A credit constraint can reduce investment advances or move HELOC interest to cash." />
              <SimulationMetric label="Peak extra cash in one month" value={money(result.peakCashGap)} note="Highest net monthly cash requirement above the baseline over 30 years." />
            </div>
            {firstAboveCombinedLimit && <p role="status" className="mt-5 rounded-lg border border-neon-purple p-3 text-xs leading-relaxed">Existing debt exceeds 80% of lending value in month {firstAboveCombinedLimit.month}. The model blocks new draws while the limit is breached and leaves existing debt outstanding.</p>}
          </section>
          <section className={panel} aria-labelledby="smith-tax-impact">
            <div className="flex flex-wrap items-center justify-between gap-3"><h3 id="smith-tax-impact" className="text-lg font-semibold">Taxes included at year {x.headlineYear}</h3><a href="#smith-taxes" className="text-xs text-neon-cyan underline underline-offset-2">Edit your tax rates</a></div>
            <p className="mt-3 text-xs leading-relaxed text-text-secondary">The tax benefit and the tax bills both matter. Income tax is taken from distributions before mortgage prepayments. Capital gains tax is estimated once, as if you sold at year {x.headlineYear}.</p>
            <div className="mt-5 grid gap-6 sm:grid-cols-3">
              <SimulationMetric label="Interest-deduction tax savings" value={money(selected.refundsReceived)} note={`Refunds received by year ${x.headlineYear}, at ${x.marginalTax}% of eligible interest up to ${money(x.annualTaxSavingLimit)} per year.`} />
              <SimulationMetric label="Tax on investment income" value={money(selected.cumulativeIncomeTax)} note={`Cumulative tax on distributions at your ${x.incomeTax}% effective rate.`} />
              <SimulationMetric label="Capital gains tax if you sell" value={money(selected.exitTax)} note={`${(x.inclusion * x.gainsTax / 100).toFixed(2)}% of the positive gain, rather than the full portfolio.`} />
            </div>
            <div className="mt-6 space-y-3 rounded-xl bg-space-void p-4 text-xs leading-relaxed">
              <p>HELOC interest incurred so far: {money(selected.cumulativeHelocInterest)}. Tax savings are based on cash-paid interest attributable to investment draws and arrive the following year.</p>
              <p>Portfolio {money(selected.portfolio)} − invested principal {money(selected.costBasis)} = {money(selected.portfolio - selected.costBasis)} gain / loss.</p>
              <p>Estimated sale tax: {money(Math.max(0, selected.portfolio - selected.costBasis))} positive gain × {x.inclusion}% included × {x.gainsTax}% personal rate = <strong>{money(selected.exitTax)}</strong>.</p>
              <p>Portfolio after sale tax: <strong>{money(selected.portfolio - selected.exitTax)}</strong>, before repaying the HELOC.</p>
            </div>
            <p className="mt-4 text-xs leading-relaxed text-text-secondary">Actual savings depend on your taxable income, province and brackets. Your refund also depends on the rest of your return.</p>
            {(x.inclusion === 0 || x.gainsTax === 0) && <p className="mt-3 rounded-lg border border-neon-purple p-3 text-xs">Your sale tax assumptions produce a zero capital gains tax estimate.</p>}
          </section>
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
            <SimulationMetric label="Peak HELOC" value={money(result.peakHeloc)} note="Highest revolving balance over the full 30 years." />
            <SimulationMetric label="Scheduled mortgage payment" value={`${money(result.payment)}/mo`} />
          </div></section>
          <section className={panel}><h3 className="font-semibold">How the assumptions change the result</h3><p className="mt-2 text-xs text-text-secondary">Year {x.headlineYear} difference versus the baseline. The 6% and 7% cases hold income yield fixed and adjust price growth. Each case still applies the credit limits, costs and relevant taxes.</p><div className="mt-4 space-y-3">{scenarios.map(s => <div key={s.label} className="flex items-center justify-between gap-4 border-t border-space-border pt-3 text-xs"><span>{s.label}</span><span className="shrink-0 font-mono">{money(s.advantage)}</span></div>)}</div></section>
          <details className={panel}><summary className="cursor-pointer font-semibold">Annual breakdown & export</summary><p className="mt-4 text-xs text-text-secondary">The CSV includes all 360 months, with approved limits, requested and funded draws, cash interest and the tax calculation.</p><div className="mt-5 overflow-x-auto"><table className="w-full min-w-[660px] text-xs"><caption className="sr-only">Year-end balances and cumulative strategy advantage in CAD</caption><thead><tr>{["Year", "Mortgage", "HELOC", "Credit left", "Portfolio", "Exit tax", "Advantage"].map(label => <th key={label} className="p-2 text-right first:text-left">{label}</th>)}</tr></thead><tbody>{result.years.map(p => <tr key={p.month} className="border-t border-space-border"><th className="p-2 text-left font-normal">{p.month / 12}</th>{[p.mortgage, p.heloc, p.availableCredit, p.portfolio, p.exitTax, p.advantage].map((v,i) => <td key={i} className="p-2 text-right font-mono">{money(v)}</td>)}</tr>)}</tbody></table></div><SimulationExport csv={csv} filename="smith-manoeuvre" /></details>
        </>}
        <details className={panel}><summary className="cursor-pointer font-semibold">How the calculation works</summary><div className="mt-4 space-y-3 text-xs leading-relaxed text-text-secondary">
          <p>Opening balances determine returns and interest. The mortgage payment and permitted prepayment reduce principal before month-end HELOC draws. With interest financing enabled, borrowing room pays HELOC interest first. Remaining room funds investments up to the principal repaid that month. Any unfunded interest is paid from cash.</p>
          <p>The estimated refund multiplies the prior year’s eligible cash-paid interest by the entered savings rate, up to the annual refund cap. The model allocates cash interest proportionally between investment draws and amounts borrowed to fund interest. On an illustrative exit, the inclusion share and sale-year rate apply once to a positive gain over invested principal. Tax treatment is simplified to the entered rates and limits.</p>
          <p>Smith position = portfolio − illustrative exit tax − HELOC − mortgage − cumulative external cash − cumulative scheduled mortgage payments. External cash = prepayments + cash-paid HELOC interest − after-tax income − refunds. Unused income and refunds reduce external cash costs. Baseline position = − remaining mortgage − cumulative payments. Their difference is the reported advantage.</p>
          <p>Home value is common to both paths. New draws use the lower of the projected market value and the last modeled appraisal. Lenders can require requalification, a new appraisal or a lower limit. The model holds rates and returns constant, assigns zero return to saved cash and freed payments, and excludes lender fees and penalties.</p>
          <p>Interest deductibility depends on the use and tracing of borrowed funds. The tax estimate excludes interest covered by new borrowing and interest on the portion of the loan used to fund interest. See <a className="underline" href="https://www.canada.ca/en/revenue-agency/services/tax/technical-information/income-tax/income-tax-folios-index/series-3-property-investments-savings-plans/series-3-property-investments-savings-plan-folio-6-interest/income-tax-folio-s3-f6-c1-interest-deductibility.html" target="_blank" rel="noopener noreferrer">CRA’s interest deductibility guidance</a> and <a className="underline" href="https://www.canada.ca/en/financial-consumer-agency/services/mortgages/home-equity-line-credit.html" target="_blank" rel="noopener noreferrer">FCAC’s HELOC guide</a>.</p>
          <p>CRA explains <a className="underline" href="https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/about-your-tax-return/tax-return/completing-a-tax-return/deductions-credits-expenses/line-22100-carrying-charges-interest-expenses.html" target="_blank" rel="noopener noreferrer">interest deductions</a>, <a className="underline" href="https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/about-your-tax-return/tax-return/completing-a-tax-return/personal-income/line-12700-capital-gains/calculating-reporting-your-capital-gains-losses.html" target="_blank" rel="noopener noreferrer">capital gains and inclusion</a>, and <a className="underline" href="https://www.canada.ca/en/revenue-agency/services/tax/individuals/topics/about-your-tax-return/tax-return/completing-a-tax-return/deductions-credits-expenses/line-40425-federal-dividend-tax-credit.html" target="_blank" rel="noopener noreferrer">Canadian dividend tax credits</a>. The 50% inclusion default is an editable planning assumption, not a tax-law forecast over 30 years. Interest on money borrowed for registered accounts such as a TFSA or RRSP is not deductible; investments that can produce only capital gains do not satisfy CRA’s income-earning test.</p>
          <p>Illustrative planning only, not tax, legal or investment advice. Confirm your circumstances with your lender and tax adviser. Calculator inputs are not saved or transmitted.</p>
        </div></details>
      </div>
    </div>
  </SimulationShell>;
}
