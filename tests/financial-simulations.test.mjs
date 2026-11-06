import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

async function load(name) {
  const source = readFileSync(new URL(`../src/lib/${name}.ts`, import.meta.url), "utf8");
  const { outputText } = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } });
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);
}
const { DEFAULT_SMITH: smith, modelSmith, validateSmith, smithCsv } = await load("smith-manoeuvre");
const { DEFAULT_EQUITY: equity, equityValue, solveEquity, validateEquity, equitySensitivity, equityCsv } = await load("implied-equity");
const close = (a, b, tolerance = 0.01) => assert.ok(Math.abs(a - b) <= tolerance, `${a} differs from ${b}`);

test("Smith reference reconciles headline year and full-model figures", () => {
  const r = modelSmith(smith);
  close(r.headline.advantage, 277453.2595);
  assert.equal(r.smithPayoff, 220);
  assert.equal(r.baselinePayoff, 300);
  close(r.months.at(-1).baselineInterestPaid - r.months.at(-1).mortgageInterestPaid, 70717, 1);
  close(r.months.at(-1).refundsReceived, 143215, 1);
  close(r.peakHeloc, 500000);
  assert.equal(r.months.length, 360);
  assert.equal(r.years.length, 30);
});

test("Smith opening balances receive returns before month-end investment", () => {
  const r = modelSmith(smith), first = r.months[0], second = r.months[1];
  close(first.afterTaxIncome, 0);
  close(first.helocInterest, 0);
  close(first.portfolio, first.reborrowed);
  close(second.afterTaxIncome, first.portfolio * 0.03 / 12 * 0.8);
  close(second.helocInterest, first.heloc * 0.05 / 12);
  close(second.prepayment, second.afterTaxIncome);
  close(second.portfolio, first.portfolio * (1 + 0.05 / 12) + second.reborrowed);
});

test("Smith refunds use only prior-year interest, in the selected month", () => {
  for (const refundMonth of [1, 4, 12]) {
    const r = modelSmith({ ...smith, refundMonth });
    const yearOneInterest = r.months.slice(0, 12).reduce((s,p) => s + p.helocInterest, 0);
    assert.ok(r.months.slice(0, 12).every(p => p.refund === 0));
    close(r.months[12 + refundMonth - 1].refund, yearOneInterest * 0.33);
    assert.equal(r.months.slice(12, 24).filter(p => p.refund > 0).length, 1);
  }
});

test("zero-rate and zero-return Smith strategy has no artificial advantage", () => {
  const r = modelSmith({ ...smith, mortgageRate: 0, helocRate: 0, yield: 0, growth: 0 });
  close(r.payment, smith.mortgage / 300);
  for (const p of r.months) close(p.advantage, 0);
  assert.equal(r.smithPayoff, 300);
  assert.equal(r.baselinePayoff, 300);
});

test("capitalized HELOC interest increases debt and is not charged as cash too", () => {
  const r = modelSmith({ ...smith, capitalizeInterest: true });
  for (let i = 1; i < 12; i++) {
    const p = r.months[i], prev = r.months[i-1];
    close(p.heloc - prev.heloc, p.reborrowed + p.helocInterest);
    close(p.extraCash, p.prepayment - p.afterTaxIncome - p.refund);
  }
  assert.ok(r.peakHeloc > smith.mortgage);
});

test("Smith accounts for retained income, exit taxes and cash payments once", () => {
  const r = modelSmith({ ...smith, prepayShare: 0 });
  let scheduled = 0, baselineScheduled = 0;
  for (const p of r.months) {
    scheduled += p.payment; baselineScheduled += p.baselinePayment;
    close(p.extraCash, p.prepayment + p.helocInterest - p.afterTaxIncome - p.refund);
    close(p.exitTax, Math.max(0,p.portfolio-p.costBasis) * 0.5 * 0.33);
    close(p.smithPosition, p.portfolio - p.exitTax - p.heloc - p.mortgage - p.cumulativeExtraCash - scheduled);
    close(p.baselinePosition, -p.baselineMortgage - baselineScheduled);
    close(p.advantage, p.smithPosition - p.baselinePosition);
  }
});

test("Smith does not invent loss credits, lending caps or post-payoff investments", () => {
  const loss = modelSmith({ ...smith, growth: -20, homeValue: 500000 });
  assert.ok(loss.months.every(p => p.exitTax === 0));
  assert.ok(loss.peakHeloc > 0.65 * 500000);
  const r = modelSmith(smith);
  assert.ok(r.months.slice(r.smithPayoff).every(p => p.reborrowed === 0 && p.payment === 0 && p.prepayment === 0));
  const zero = modelSmith({ ...smith, mortgage: 0 });
  assert.equal(zero.smithPayoff, 0);
  assert.ok(zero.months.every(p => p.advantage === 0));
});

test("Smith rejects incomplete and out-of-range assumptions", () => {
  for (const update of [{ mortgage: NaN }, { homeValue: 0 }, { mortgageRate: -1 }, { amortization: 31 }, { headlineYear: 2.5 }, { refundMonth: 13 }, { prepayShare: 101 }, { growth: -100 }]) {
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
  assert.ok(a.includes("headlineYear,20"));
  assert.ok(a.includes("Limitations,"));
  assert.ok(a.split("\n").at(-1).startsWith("360,"));
  assert.ok(b.includes("Currency,INR"));
  assert.ok(b.includes("Implied annual rate,"));
  assert.ok(b.includes("Year,EPS,Dividend,Present value of dividend"));
  assert.ok(b.includes("sensitivity"));
});
