import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";
const source = readFileSync(new URL("../src/lib/car-model.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ES2020 } });
const { modelCar, validateCar, DEFAULT_CAR, carBreakEvens, carScenarioCsv } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);
const close = (a, b) => assert.ok(Math.abs(a - b) < 0.01, `${a} != ${b}`);
test("zero-interest partial loan credits equity without double-counting principal", () => {
 const p = { ...DEFAULT_CAR, price: 30000, down: 6000, rate: 0, loanMonths: 60, months: 36, resale: 18000 };
 const r = modelCar(p); close(r.payment, 400); close(r.balance, 9600); close(r.buyCost, 12000);
});
test("payments stop at payoff; cash purchase has no debt", () => {
 const r = modelCar({ ...DEFAULT_CAR, loanMonths: 12, months: 36 }); close(r.balance, 0);
 const cash = modelCar({ ...DEFAULT_CAR, down: DEFAULT_CAR.price }); close(cash.payment, 0); close(cash.buyCost, DEFAULT_CAR.price - DEFAULT_CAR.resale);
});
test("lease includes prorated mileage, fees and all monthly payments", () => {
 const r = modelCar({ ...DEFAULT_CAR, months: 36, distance: 25000, allowance: 20000, excessRate: 0.2, returnFees: 500 });
 close(r.mileageFees, 3000); close(r.leaseCost, 23500);
});
test("known amortized payment and invalid input handling", () => {
 close(modelCar(DEFAULT_CAR).payment, 676.6481);
 assert.ok(validateCar({ ...DEFAULT_CAR, down: 50000 }));
 assert.ok(validateCar({ ...DEFAULT_CAR, months: 0 }));
 assert.ok(validateCar({ ...DEFAULT_CAR, months: 36.5 }));
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
 const p = { ...DEFAULT_CAR, price: 12000, down: 12000, rate: 0, months: 12, leaseMonths: 12, resale: 12000, upfront: 0, lease: 0, investmentReturn: 10 };
 const r = modelCar(p); close(r.final.leaseInvestments, 13200); close(r.final.buyInvestments, 0);
 const savings = modelCar({ ...p, down: 0, loanMonths: 12, investmentReturn: 0 });
 close(savings.final.leaseInvestments, 12000);
});
test("return fees are paid and invested against only at the final month", () => {
 const p = { ...DEFAULT_CAR, price: 12000, down: 12000, lease: 0, upfront: 0, months: 24, leaseMonths: 24, returnFees: 1000, investmentReturn: 10 };
 const r = modelCar(p); close(r.points[22].buyInvestments, 0); close(r.final.buyInvestments, 1000);
 close(r.points[22].leaseCashOutflow, 0); close(r.final.leaseCashOutflow, 1000);
});
test("running inflation applies at anniversaries; partial final period totals reconcile", () => {
 const r = modelCar({ ...DEFAULT_CAR, months: 25, leaseMonths: 25, buyRunning: 1200, leaseRunning: 600, runningInflation: 10 });
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
 const r = modelCar({ ...DEFAULT_CAR, months:1, leaseMonths:1, resale:0 }); assert.ok(r.final.equity < 0); assert.ok(r.final.buyWealth < 0);
 assert.ok(validateCar({ ...DEFAULT_CAR, investmentReturn:-21 }));
 assert.ok(validateCar({ ...DEFAULT_CAR, runningInflation:31 }));
 assert.throws(() => modelCar({ ...DEFAULT_CAR, months:0 }));
});
test("CSV exports assumptions and the same monthly values as the model", () => {
 const r = modelCar(DEFAULT_CAR), csv = carScenarioCsv(DEFAULT_CAR,"CAD");
 assert.ok(csv.includes("investmentReturn,0")); assert.ok(csv.includes("Currency,CAD"));
 const rows = csv.split("\n"); const last = rows.at(-1).split(",");
 assert.equal(Number(last[0]),DEFAULT_CAR.months); close(Number(last[5]),r.final.buyWealth);
 close(Number(last[8]),r.final.buyCashOutflow);
});

test("longer driving duration keeps one purchased car and repeats whole leases", () => {
 const p = { ...DEFAULT_CAR, months:72, leaseMonths:36, loanMonths:60, returnFees:500, distance:25000, allowance:20000, excessRate:0.2 };
 const r = modelCar(p); assert.equal(r.leaseCount,2); close(r.balance,0);
 close(r.leaseUpfrontPaid,4000); close(r.totalReturnFees,1000); close(r.mileageFees,6000);
 close(r.leaseCost,47000); close(r.points[35].leaseCashOutflow,4000);
 close(r.points[36].leaseCashOutflow,2500); close(r.points[71].leaseCashOutflow,4000);
 close(r.points[60].loanPaid,0); close(r.final.difference,r.leaseCost-r.buyCost);
 close(r.periods.reduce((sum,p)=>sum+p.leaseCashOutflow,0),r.leaseCash);
});
test("driving kilometres cannot affect purchase costs or debt", () => {
 const a = modelCar({ ...DEFAULT_CAR, months:72, distance:0, excessRate:0.2 });
 const b = modelCar({ ...DEFAULT_CAR, months:72, distance:100000, allowance:0, excessRate:0.2 });
 close(a.buyCash,b.buyCash); close(a.buyCost,b.buyCost); close(a.balance,b.balance);
 assert.ok(b.mileageFees > a.mileageFees);
});
test("incomplete leases rejected and long ownership duration supported", () => {
 assert.ok(validateCar({ ...DEFAULT_CAR, months:48, leaseMonths:36 }));
 assert.ok(validateCar({ ...DEFAULT_CAR, leaseMonths:0 }));
 const r = modelCar({ ...DEFAULT_CAR, months:360, resale:0 });
 assert.equal(r.leaseCount,10); close(r.balance,0);
 const t=carBreakEvens({ ...DEFAULT_CAR, months:72, investmentReturn:8 });
 close(modelCar({ ...DEFAULT_CAR, months:72, investmentReturn:8, lease:t.lease }).final.difference,0);
});
