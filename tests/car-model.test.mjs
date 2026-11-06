import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";
const source = readFileSync(new URL("../src/lib/car-model.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ES2020 } });
const { modelCar, validateCar, DEFAULT_CAR, carBreakEvens, carScenarioCsv } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);
const close = (a, b) => assert.ok(Math.abs(a - b) < 0.01, `${a} != ${b}`);
test("zero-interest partial loan credits equity without double-counting principal", () => {
 const p = { ...DEFAULT_CAR, price: 30000, down: 6000, rate: 0, loanMonths: 60, leaseMonths: 36, resale: 18000 };
 const r = modelCar(p); close(r.payment, 400); close(r.balance, 9600); close(r.buyCost, 12000);
});
test("payments stop at payoff; cash purchase has no debt", () => {
 const r = modelCar({ ...DEFAULT_CAR, loanMonths: 12, leaseMonths: 36 }); close(r.balance, 0);
 assert.ok(r.points.slice(12).every(p => p.loanPaid === 0 && p.interest === 0 && p.principal === 0));
 assert.ok(r.points.at(-1).buyInvestments > r.points[11].buyInvestments);
 const cash = modelCar({ ...DEFAULT_CAR, down: DEFAULT_CAR.price }); close(cash.payment, 0); close(cash.buyCost, DEFAULT_CAR.price - DEFAULT_CAR.resale);
});
test("lease includes prorated mileage, fees and all monthly payments", () => {
 const r = modelCar({ ...DEFAULT_CAR, leaseMonths: 36, distance: 25000, allowance: 20000, excessRate: 0.2, returnFees: 500 });
 close(r.mileageFees, 3000); close(r.leaseCost, 23500);
});
test("known amortized payment and invalid input handling", () => {
 close(modelCar(DEFAULT_CAR).payment, 676.6481);
 assert.ok(validateCar({ ...DEFAULT_CAR, down: 50000 }));
 assert.ok(validateCar({ ...DEFAULT_CAR, leaseMonths: 0 }));
 assert.ok(validateCar({ ...DEFAULT_CAR, leaseMonths: 24.5 }));
 assert.ok(validateCar({ ...DEFAULT_CAR, leaseMonths: 121 }));
 assert.ok(validateCar({ ...DEFAULT_CAR, loanMonths: 0 }));
 assert.ok(validateCar({ ...DEFAULT_CAR, price: NaN }));
});

test("zero investment return reconciles wealth and cost advantages", () => {
 for (const p of [DEFAULT_CAR, { ...DEFAULT_CAR, upfront: 12000, returnFees: 700, buyRunning: 2000, leaseRunning: 1000 }, { ...DEFAULT_CAR, resale: 0, down: 0 }]) {
  const r = modelCar(p); close(r.final.difference, r.leaseCost - r.buyCost);
  close(r.buyInitialInvestments + p.down, r.startingCash);
  close(r.leaseInitialInvestments + p.upfront, r.startingCash);
 }
});
test("effective annual investment compounding and month-end savings", () => {
 const p = { ...DEFAULT_CAR, price: 12000, down: 12000, rate: 0, leaseMonths: 12, resale: 12000, upfront: 0, lease: 0, investmentReturn: 10 };
 const r = modelCar(p); close(r.final.leaseInvestments, 13200); close(r.final.buyInvestments, 0);
 const savings = modelCar({ ...p, down: 0, loanMonths: 12, investmentReturn: 0 });
 close(savings.final.leaseInvestments, 12000);
});
test("return fees are paid and invested against only at the final month", () => {
 const p = { ...DEFAULT_CAR, price: 12000, down: 12000, lease: 0, upfront: 0, leaseMonths: 24, returnFees: 1000, investmentReturn: 10 };
 const r = modelCar(p); close(r.points[22].buyInvestments, 0); close(r.final.buyInvestments, 1000);
 close(r.points[22].leaseCashOutflow, 0); close(r.final.leaseCashOutflow, 1000);
});
test("running inflation applies at anniversaries; partial final period totals reconcile", () => {
 const r = modelCar({ ...DEFAULT_CAR, leaseMonths: 25, buyRunning: 1200, leaseRunning: 600, runningInflation: 10 });
 close(r.buyRunningPaid, 1200 + 1320 + 121);
 close(r.periods.reduce((s,p) => s+p.buyCashOutflow,0), r.buyCash);
 close(r.periods.reduce((s,p) => s+p.leaseCashOutflow,0), r.leaseCash);
 assert.equal(r.periods[2].startMonth,25); assert.equal(r.periods[2].month,25);
 close(r.principalPaid + r.balance, DEFAULT_CAR.price - DEFAULT_CAR.down);
 close(r.paid, r.principalPaid + r.interestPaid);
});
test("thresholds solve wealth equality with positive and negative returns", () => {
 for (const investmentReturn of [0, 8, -10]) {
  const p = { ...DEFAULT_CAR, investmentReturn }; const t = carBreakEvens(p);
  assert.notEqual(t.lease,null); assert.notEqual(t.resale,null);
  close(modelCar({ ...p, lease:t.lease }).final.difference,0);
  close(modelCar({ ...p, resale:t.resale }).final.difference,0);
  assert.ok(modelCar({ ...p, lease:t.lease+10 }).final.difference > 0);
  assert.ok(modelCar({ ...p, resale:t.resale+100 }).final.difference > 0);
 }
 assert.equal(carBreakEvens({ ...DEFAULT_CAR, resale:1000000 }).lease,null);
});
test("negative equity is preserved and validation prevents invalid projections", () => {
 const r = modelCar({ ...DEFAULT_CAR, leaseMonths:1, resale:0 }); assert.ok(r.final.equity < 0); assert.ok(r.final.buyWealth < 0);
 assert.ok(validateCar({ ...DEFAULT_CAR, investmentReturn:-21 }));
 assert.ok(validateCar({ ...DEFAULT_CAR, runningInflation:31 }));
 assert.throws(() => modelCar({ ...DEFAULT_CAR, leaseMonths:0 }));
});
test("CSV exports assumptions and the same monthly values as the model", () => {
 const r = modelCar(DEFAULT_CAR), csv = carScenarioCsv(DEFAULT_CAR,"CAD");
 assert.ok(csv.includes("investmentReturn,0")); assert.ok(csv.includes("Currency,CAD"));
 const rows = csv.split("\n"); const last = rows.at(-1).split(",");
 assert.equal(Number(last[0]),DEFAULT_CAR.leaseMonths); close(Number(last[5]),r.final.buyWealth);
 close(Number(last[8]),r.final.buyCashOutflow);
});

test("24-month lease sets the horizon and settles the unpaid 60-month loan at resale", () => {
 const r = modelCar({ ...DEFAULT_CAR, leaseMonths:24 });
 assert.equal(r.comparisonMonths,24); assert.equal(r.points.length,24); assert.equal(r.final.month,24);
 assert.deepEqual(r.periods.map(p=>p.month),[12,24]);
 close(r.payment,676.64805353); close(r.paid,16239.55328472); close(r.balance,22242.10915585);
 close(r.final.carValue,26000); close(r.final.equity,3757.89084415);
 close(r.buyCost,17481.66244057); close(r.leaseCost,14000);
 close(r.final.leaseInvestments,7239.55328472); close(r.final.difference,-3481.66244057);
 close(r.buyCost,r.buyCash+r.balance-26000);
 close(r.paid+r.balance,35000+r.interestPaid); // Principal is paid down or settled, never counted twice.
});
test("one lease has one upfront payment and one final mileage and return charge", () => {
 const p = { ...DEFAULT_CAR, leaseMonths:24, returnFees:500, distance:25000, allowance:20000, excessRate:0.2 };
 const r = modelCar(p);
 close(r.leaseUpfrontPaid,2000); close(r.totalReturnFees,500); close(r.mileageFees,2000);
 close(r.leaseCost,16500); close(r.points[0].leaseCashOutflow,2500);
 assert.ok(r.points.slice(1,-1).every(p=>p.leaseCashOutflow===500));
 close(r.points[23].leaseCashOutflow,3000);
 close(r.periods.reduce((sum,p)=>sum+p.leaseCashOutflow,0),r.leaseCash);
 close(r.points.reduce((sum,p)=>sum+p.leaseCashOutflow,0),r.leaseCash);
 close(r.final.difference,r.leaseCost-r.buyCost);
});
test("loan repayment term changes payments and debt without changing the comparison length", () => {
 for (const loanMonths of [12,24,60,120]) {
  const r=modelCar({...DEFAULT_CAR,leaseMonths:24,loanMonths});
  assert.equal(r.comparisonMonths,24); assert.equal(r.points.length,24); assert.equal(r.final.month,24);
  close(r.leaseCost,14000); close(r.final.difference,r.leaseCost-r.buyCost);
  if (loanMonths<=24) close(r.balance,0); else assert.ok(r.balance>0);
 }
});
test("legacy driving-duration values cannot extend a single lease comparison", () => {
 const expected=modelCar({...DEFAULT_CAR,leaseMonths:24});
 const legacy=modelCar({...DEFAULT_CAR,leaseMonths:24,months:72});
 assert.deepEqual(legacy,expected);
 assert.equal(validateCar({...DEFAULT_CAR,leaseMonths:24,months:36}),null);
});
test("driving kilometres cannot affect purchase costs or debt", () => {
 const a = modelCar({ ...DEFAULT_CAR, leaseMonths:24, distance:0, excessRate:0.2 });
 const b = modelCar({ ...DEFAULT_CAR, leaseMonths:24, distance:100000, allowance:0, excessRate:0.2 });
 close(a.buyCash,b.buyCash); close(a.buyCost,b.buyCost); close(a.balance,b.balance);
 assert.ok(b.mileageFees > a.mileageFees);
});
test("valid lease lengths work directly and thresholds use that same lease-end date", () => {
 assert.equal(validateCar({ ...DEFAULT_CAR, leaseMonths:24 }),null);
 assert.ok(validateCar({ ...DEFAULT_CAR, leaseMonths:0 }));
 const r = modelCar({ ...DEFAULT_CAR, leaseMonths:120, resale:0 });
 assert.equal(r.comparisonMonths,120); assert.equal(r.points.length,120); close(r.balance,0);
 const p={...DEFAULT_CAR,leaseMonths:24,investmentReturn:8};
 const t=carBreakEvens(p);
 close(modelCar({ ...p, lease:t.lease }).final.difference,0);
 close(modelCar({ ...p, resale:t.resale }).final.difference,0);
});
test("24-month CSV declares one lease, omits stale duration and ends at month 24", () => {
 const p={...DEFAULT_CAR,leaseMonths:24,months:72};
 const csv=carScenarioCsv(p,"CAD"), rows=csv.split("\n");
 assert.ok(!rows.some(row=>row.startsWith("months,")));
 const comparisonRow=rows.find(row=>row.startsWith("Comparison period"));
 assert.ok(comparisonRow); assert.equal(Number(comparisonRow.split(",").at(-1)),24);
 assert.ok(/single(?:-| )lease|one(?: complete)? lease/i.test(csv));
 assert.ok(!csv.includes("Repeat identical leases"));
 const last=rows.at(-1).split(",");
 assert.equal(Number(last[0]),24); close(Number(last[2]),22242.10915585);
 close(Number(last[5]),3757.89084415); close(Number(last[6]),7239.55328472);
});
