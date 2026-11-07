import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

async function load(name) {
  const source = readFileSync(new URL(`../src/lib/${name}.ts`, import.meta.url), "utf8");
  const { outputText } = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } });
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);
}
const { DEFAULT_SMITH: smith, modelSmith, validateSmith, smithCsv, smithPriceGrowth, smithTotalReturn } = await load("smith-manoeuvre");
const { DEFAULT_EQUITY: equity, equityValue, solveEquity, validateEquity, equitySensitivity, equityCsv } = await load("implied-equity");
const close = (a, b, tolerance = 0.01) => assert.ok(Math.abs(a - b) <= tolerance, `${a} differs from ${b}`);

test("Smith reference reconciles headline year and full-model figures", () => {
  const r = modelSmith(smith);
  close(r.headline.advantage, 33009.86);
  assert.equal(r.smithPayoff, 235);
  assert.equal(r.baselinePayoff, 300);
  close(r.months.at(-1).baselineInterestPaid - r.months.at(-1).mortgageInterestPaid, 57329.48);
  close(r.months.at(-1).refundsReceived, 102275.66);
  close(r.peakHeloc, 500000);
  assert.equal(r.months.length, 360);
  assert.equal(r.years.length, 30);
});

test("Smith opening balances receive returns before month-end investment", () => {
  const r = modelSmith(smith), first = r.months[0], second = r.months[1];
  close(first.afterTaxIncome, 0);
  close(first.helocInterest, 0);
  close(first.portfolio, first.reborrowed);
  close(second.afterTaxIncome, first.portfolio * smith.yield / 1200 * (1 - smith.incomeTax / 100));
  close(second.helocInterest, first.heloc * smith.helocRate / 1200);
  close(second.prepayment, second.afterTaxIncome);
  close(second.portfolio, first.portfolio * (1 + smith.growth / 1200) + second.reborrowed);
});

test("Smith reports gross distributions, income tax and HELOC interest cumulatively", () => {
  for (const incomeTax of [0, 20, 100]) {
    const r = modelSmith({ ...smith, incomeTax });
    let previousPortfolio = 0, totalTax = 0, totalInterest = 0;
    for (const p of r.months) {
      close(p.grossIncome, previousPortfolio * smith.yield / 1200);
      close(p.incomeTaxPaid, p.grossIncome * incomeTax / 100);
      close(p.grossIncome, p.afterTaxIncome + p.incomeTaxPaid);
      totalTax += p.incomeTaxPaid;
      totalInterest += p.helocInterest;
      close(p.cumulativeIncomeTax, totalTax);
      close(p.cumulativeHelocInterest, totalInterest);
      previousPortfolio = p.portfolio;
    }
  }
  const base = modelSmith(smith);
  close(base.headline.cumulativeIncomeTax, 11348.37);
  assert.ok(modelSmith({ ...smith, incomeTax: 40 }).headline.advantage < base.headline.advantage);
});

test("Smith refunds use only prior-year interest, in the selected month", () => {
  for (const refundMonth of [1, 4, 12]) {
    const r = modelSmith({ ...smith, refundMonth });
    const yearOneInterest = r.months.slice(0, 12).reduce((s,p) => s + p.helocInterest, 0);
    assert.ok(r.months.slice(0, 12).every(p => p.refund === 0));
    close(r.months[12 + refundMonth - 1].refund, yearOneInterest * smith.marginalTax / 100);
    assert.equal(r.months.slice(12, 24).filter(p => p.refund > 0).length, 1);
  }
});

test("Smith marginal tax rate changes the prior-year interest saving and mortgage path", () => {
  for (const marginalTax of [0, 20, 50]) {
    const r = modelSmith({ ...smith, marginalTax });
    const yearOneInterest = r.months.slice(0, 12).reduce((sum, p) => sum + p.helocInterest, 0);
    close(r.months[12 + smith.refundMonth - 1].refund, yearOneInterest * marginalTax / 100);
    if (marginalTax === 0) assert.ok(r.months.every(p => p.refund === 0 && p.refundsReceived === 0));
  }
  const noDeduction = modelSmith({ ...smith, marginalTax: 0 });
  const base = modelSmith(smith);
  const higherDeduction = modelSmith({ ...smith, marginalTax: 50 });
  assert.ok(noDeduction.headline.advantage < base.headline.advantage);
  assert.ok(higherDeduction.headline.advantage > base.headline.advantage);
  assert.ok(noDeduction.smithPayoff > base.smithPayoff);
  assert.ok(higherDeduction.smithPayoff < base.smithPayoff);
});

test("Smith capital gains rates affect hypothetical exit tax without changing the investment or debt path", () => {
  const base = modelSmith(smith);
  for (const taxChange of [{ gainsTax: 50 }, { inclusion: 75 }, { gainsTax: 0 }, { inclusion: 0 }]) {
    const assumptions = { ...smith, ...taxChange };
    const r = modelSmith(assumptions);
    for (const [i, p] of r.months.entries()) {
      const original = base.months[i];
      for (const key of ["mortgage", "baselineMortgage", "heloc", "portfolio", "costBasis", "afterTaxIncome", "refund", "cumulativeExtraCash"]) {
        close(p[key], original[key]);
      }
      close(p.exitTax, Math.max(0, p.portfolio - p.costBasis) * assumptions.inclusion / 100 * assumptions.gainsTax / 100);
      close(p.advantage - original.advantage, original.exitTax - p.exitTax);
    }
  }
  for (const growth of [0, -20]) {
    const r = modelSmith({ ...smith, growth });
    assert.ok(r.months.every(p => p.exitTax === 0));
  }
});

test("zero-rate and zero-return Smith strategy has no artificial advantage", () => {
  const r = modelSmith({ ...smith, mortgageRate: 0, helocRate: 0, yield: 0, growth: 0 });
  close(r.payment, smith.mortgage / 300);
  for (const p of r.months) close(p.advantage, 0);
  assert.equal(r.smithPayoff, 300);
  assert.equal(r.baselinePayoff, 300);
});

test("Smith borrows interest first within the lender limit and pays unfunded interest from cash", () => {
  const r = modelSmith({ ...smith, mortgage: 600, homeValue: 1000, amortization: 1, mortgageRate: 0,
    lenderHelocLimit: 50.25, capitalizeInterest: true, helocRate: 12, yield: 0, growth: 0 });
  const [first, second, third] = r.months;
  close(first.heloc, 50);
  close(second.helocInterest, 0.50);
  close(second.helocInterestBorrowed, 0.25);
  close(second.blockedInterest, 0.25);
  close(second.helocInterestCash, 0.25);
  close(second.eligibleInterest, 0.25);
  close(second.extraCash, 0.25);
  close(second.blockedInvestment, 50);
  close(second.reborrowed, 0);
  close(second.heloc, 50.25);
  close(third.helocInterestCash, 0.5025, 1e-8);
  close(third.eligibleInterest, 0.5, 1e-8);
  close(third.costBasis, 50);
  assert.equal(r.firstLimitedMonth, 2);
  close(r.peakHeloc, 50.25);
});

test("Smith accounts for retained income, exit taxes and cash payments once", () => {
  const r = modelSmith({ ...smith, prepayShare: 0 });
  let scheduled = 0, baselineScheduled = 0;
  for (const p of r.months) {
    scheduled += p.payment; baselineScheduled += p.baselinePayment;
    close(p.extraCash, p.prepayment + p.helocInterest - p.afterTaxIncome - p.refund);
    close(p.exitTax, Math.max(0,p.portfolio-p.costBasis) * smith.inclusion / 100 * smith.gainsTax / 100);
    close(p.smithPosition, p.portfolio - p.exitTax - p.heloc - p.mortgage - p.cumulativeExtraCash - scheduled);
    close(p.baselinePosition, -p.baselineMortgage - baselineScheduled);
    close(p.advantage, p.smithPosition - p.baselinePosition);
  }
});

test("Smith gives no tax credit for losses and stops mortgage-funded investing at payoff", () => {
  const loss = modelSmith({ ...smith, growth: -20, homeValue: 500000 });
  assert.ok(loss.months.every(p => p.exitTax === 0));
  close(loss.peakHeloc, 0.65 * 500000);
  const r = modelSmith(smith);
  assert.ok(r.months.slice(r.smithPayoff).every(p => p.reborrowed === 0 && p.payment === 0 && p.prepayment === 0));
  const zero = modelSmith({ ...smith, mortgage: 0 });
  assert.equal(zero.smithPayoff, 0);
  assert.ok(zero.months.every(p => p.advantage === 0));
});

test("Smith treats debt above the 65% threshold as amortizing even below the 80% ceiling", () => {
  const r = modelSmith({ ...smith, mortgage: 750000, homeValue: 1000000, amortization: 1, mortgageRate: 0, yield: 0 });
  const [first, second, third] = r.months;
  close(first.mortgage, 687500);
  close(first.reborrowed, 0);
  close(second.mortgage, 625000);
  close(second.reborrowed, 25000);
  close(third.reborrowed, 62500);
  assert.equal(r.firstLimitedMonth, 1);
  for (const p of r.months) {
    if (p.reborrowed > 0) assert.ok(p.mortgage + p.heloc <= p.readvanceableLimit + 0.01);
    assert.ok(p.mortgage + p.heloc <= p.combinedDebtLimit + 0.01);
  }
  const noCredit = modelSmith({ ...smith, lenderHelocLimit: 0 });
  assert.ok(noCredit.months.every(p => p.heloc === 0 && p.advantage === 0));
});

test("Smith uses appreciation for new credit only after an assumed appraisal and respects a lender's fixed limit", () => {
  const x = { ...smith, homeGrowth: 10, capitalizeInterest: true, lenderHelocLimit: 530000 };
  const fixed = modelSmith(x);
  const reappraised = modelSmith({ ...x, annualReappraisal: true });
  close(fixed.months[11].homeValue, 880000);
  close(fixed.months[11].lendingValue, 800000);
  close(reappraised.months[10].lendingValue, 800000);
  close(reappraised.months[11].lendingValue, 880000);
  close(reappraised.months[11].helocLimit, 530000);
  close(reappraised.months[12].lendingValue, 880000);
  close(fixed.peakHeloc, 520000);
  close(reappraised.peakHeloc, 530000);
});

test("Smith freezes new draws when collateral falls below existing debt", () => {
  const r = modelSmith({ ...smith, homeGrowth: -20, amortization: 1, capitalizeInterest: true });
  const over = r.months.findIndex(p => p.heloc > p.helocLimit + 0.01);
  assert.ok(over > 0);
  for (const [i, p] of r.months.entries()) {
    if (i < over) continue;
    close(p.heloc, r.months[i - 1].heloc);
    close(p.availableCredit, 0);
    close(p.reborrowed, 0);
    close(p.helocInterestBorrowed, 0);
    close(p.helocInterestCash, p.helocInterest);
  }
});

test("Smith applies the tax savings and prepayment limits afresh each year", () => {
  const x = { ...smith, annualTaxSavingLimit: 80, annualPrepaymentLimit: 75 };
  const r = modelSmith(x);
  for (let year = 0; year < 10; year++) {
    const months = r.months.slice(year * 12, (year + 1) * 12);
    close(months.reduce((sum,p) => sum + p.prepayment, 0), 75);
    close(months[x.refundMonth - 1].refund, year === 0 ? 0 : 80);
    assert.ok(months.every((p,i) => i === x.refundMonth - 1 || p.refund === 0));
  }
});

test("Smith reconciles every month of the uploaded scenario under the revised lending and tax rules", () => {
  const x = { ...smith, mortgageRate: 5, amortization: 15, semiannual: false, capitalizeInterest: true,
    yield: 3, growth: 8, incomeTax: 10, prepayShare: 0 };
  const r = modelSmith(x);
  close(r.payment, 3953.97);
  close(r.headline.advantage, 116366.94);
  assert.equal(r.firstLimitedMonth, 56);
  close(r.peakHeloc, 520000);
  for (const [i, p] of r.months.entries()) {
    const previous = r.months[i - 1];
    close(p.mortgagePrincipalRepaid, (previous?.mortgage ?? x.mortgage) - p.mortgage);
    close(p.mortgagePrincipalRepaid, p.reborrowed + p.blockedInvestment);
    close(p.heloc, (previous?.heloc ?? 0) + p.reborrowed + p.helocInterestBorrowed);
    close(p.helocInterest, p.helocInterestCash + p.helocInterestBorrowed);
    close(p.costBasis, (previous?.costBasis ?? 0) + p.reborrowed);
    close(p.cashGapVsBaseline, p.payment + p.extraCash - p.baselinePayment);
    assert.ok(p.heloc + p.mortgage <= p.readvanceableLimit + 0.01);
    assert.ok(p.refund <= x.annualTaxSavingLimit);
  }
  for (const [total, expected] of [[6, -102971.39], [7, -71261.38]]) {
    const stress = { ...x, growth: smithPriceGrowth(total, x.yield) };
    close(smithTotalReturn(stress), total, 1e-9);
    close(modelSmith(stress).headline.advantage, expected);
  }
});

test("Smith amortizes at near-zero mortgage rates and reconciles the final payment", () => {
  const x = { ...smith, mortgage: 1200, mortgageRate: 1e-14, amortization: 1, lenderHelocLimit: 0 };
  const r = modelSmith(x);
  close(r.payment, 100, 1e-8);
  assert.equal(r.smithPayoff, 12);
  assert.equal(r.baselinePayoff, 12);
  close(r.months.reduce((sum, p) => sum + p.mortgagePrincipalRepaid, 0), x.mortgage, 1e-8);
});

test("Smith keeps payments level across a long amortization at the upper supported mortgage rate", () => {
  const x = { ...smith, mortgageRate: 100, amortization: 30, semiannual: false, lenderHelocLimit: 0 };
  const r = modelSmith(x);
  for (const p of r.months) {
    close(p.payment, r.payment, 1e-8);
    close(p.baselinePayment, r.payment, 1e-8);
  }
  close(r.months.reduce((sum, p) => sum + p.mortgagePrincipalRepaid, 0), x.mortgage, 1e-8);
  assert.equal(r.smithPayoff, 360);
});

test("Smith rejects incomplete and out-of-range assumptions", () => {
  for (const update of [{ mortgage: NaN }, { homeValue: 0 }, { mortgageRate: -1 }, { amortization: 31 }, { headlineYear: 2.5 }, { refundMonth: 13 }, { prepayShare: 101 }, { growth: -100 }, { homeGrowth: -100 }, { lenderHelocLimit: -1 }, { annualTaxSavingLimit: Infinity }, { annualPrepaymentLimit: -1 }]) {
    assert.ok(validateSmith({ ...smith, ...update }));
    assert.throws(() => modelSmith({ ...smith, ...update }));
  }
});

test("equity solves both terminal-ROE numerical reference cases", () => {
  close(solveEquity(equity) * 100, 8.87, 0.01);
  close(solveEquity({ ...equity, linkRoe: false }) * 100, 10.92, 0.01);
  for (const linkRoe of [true,false]) {
    const x = { ...equity, linkRoe };
    close(equityValue(x, solveEquity(x)).total, x.price, 1e-8);
  }
});

test("linked terminal ROE cancels the Gordon growth expression", () => {
  const rate = 0.12, g = 0.0712;
  const a = equityValue(equity,rate);
  const b = equityValue({ ...equity, linkRoe: false, terminalRoe: rate * 100 },rate);
  close(a.total,b.total,1e-8);
  close(a.terminalValue,equity.eps * 1.12**5 * (1+g) / rate,1e-8);
});

test("equity supports zero explicit dividends and recovers a known rate", () => {
  const x = { ...equity, dps: 0 };
  const v = equityValue(x,0.11);
  assert.equal(v.explicitValue,0);
  close(solveEquity({ ...x, price: v.total }),0.11,1e-10);
  close(v.terminalPresentValue,v.total,1e-8);
});

test("perpetual-growth link follows the entered risk-free rate", () => {
  const x = { ...equity, riskFree: 4, terminalGrowth: 2 };
  close(equityValue(x,0.1).total,equityValue({ ...x, linkGrowth: false, terminalGrowth: 4 },0.1).total,1e-8);
});

test("inactive terminal inputs do not block linked modes or alter their result", () => {
  const x = { ...equity, terminalGrowth: NaN, terminalRoe: NaN };
  assert.equal(validateEquity(x), null);
  close(solveEquity(x),solveEquity(equity),1e-10);
  assert.ok(validateEquity({ ...x, linkGrowth: false }));
  assert.ok(validateEquity({ ...x, linkRoe: false }));
});

test("equity model values fall with rates for both valid terminal modes", () => {
  for (const linkRoe of [true,false]) {
    const x = { ...equity, linkRoe };
    assert.ok(equityValue(x,0.09).total > equityValue(x,0.12).total);
    assert.ok(equityValue(x,0.12).total > equityValue(x,0.2).total);
  }
});

test("equity rejects unsupported earnings, payouts, terminal economics and beta", () => {
  for (const update of [{ eps: 0 }, { eps: -5 }, { price: 0 }, { price: NaN }, { dps: 50 }, { years: 21 }, { years: 1.5 }, { growth: -100 }, { beta: 0 }, { beta: NaN }, { linkRoe: false, terminalRoe: 5 }]) {
    assert.ok(validateEquity({ ...equity, ...update }));
    assert.equal(solveEquity({ ...equity, ...update }),null);
  }
  assert.throws(() => equityValue(equity,0.0712));
});

test("equity reports no bracket rather than returning a boundary as a rate", () => {
  assert.equal(solveEquity({ ...equity, price: 0.01 }),null);
  // A rate below long-run growth would imply an invalid mature payout.
  assert.equal(solveEquity({ ...equity, price: 100000000 }),null);
  assert.equal(solveEquity({ ...equity, dps: 0, linkRoe: false, terminalRoe: 7.12 }),null);
});

test("sensitivity centres on the current rate and explicitly unlinks growth", () => {
  const s = equitySensitivity(equity);
  close(s.rates[2][2],solveEquity(equity),1e-10);
  close(s.rates[4][0],solveEquity({ ...equity, growth:16, linkGrowth:false, terminalGrowth:5.12 }),1e-10);
  assert.ok(s.rates[4][2] > s.rates[0][2]);
});

test("CSV exports contain assumptions, all model rows and method limitations", () => {
  const a = smithCsv(smith), b = equityCsv(equity,"INR");
  assert.ok(a.includes("headlineYear,15"));
  assert.ok(a.includes("Model version,2"));
  assert.ok(a.includes("Limitations,"));
  assert.ok(a.includes("Income tax,Monthly gross cash distributions times incomeTax"));
  assert.ok(a.includes("Capital gains tax,Hypothetical sale"));
  assert.ok(a.includes("grossIncome,incomeTaxPaid,afterTaxIncome,cumulativeIncomeTax,cumulativeHelocInterest"));
  const [header, ...rows] = a.split("\n").slice(a.split("\n").findIndex(line => line.startsWith("month,mortgage,")));
  assert.equal(rows.length, 360);
  assert.ok(header.includes("helocInterestBorrowed,blockedInterest,helocInterestCash,eligibleInterest"));
  assert.ok(rows.every((row,i) => row.startsWith(`${i + 1},`) && row.split(",").length === header.split(",").length));
  assert.ok(b.includes("Currency,INR"));
  assert.ok(b.includes("Implied annual rate,"));
  assert.ok(b.includes("Year,EPS,Dividend,Present value of dividend"));
  assert.ok(b.includes("sensitivity"));
});
