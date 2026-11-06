import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import ts from "typescript";

const source = readFileSync(new URL("../src/lib/housing-model.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ES2020 } });
const { modelHousing, mortgagePayment, DEFAULT_HOUSING, validateHousing, housingBreakEvens, DEFAULT_SIMPLE_HOUSING, modelSimpleHousing, validateSimpleHousing, simpleHousingCsv } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);
const close = (actual, expected, tolerance = 0.01) => assert.ok(Math.abs(actual - expected) < tolerance, `${actual} should equal ${expected}`);
const flat = { ...DEFAULT_HOUSING, price: 120000, downPayment: 120000, rent: 0,
  closingCosts: 0, sellingCosts: 0, mortgageRate: 0, appreciation: 0, investmentReturn: 0,
  propertyTax: 0, maintenance: 0, homeInsurance: 0, renterInsurance: 0, mortgageInsurance: 0,
  hoa: 0, ownerOther: 0, renterOther: 0,
  rentInflation: 0, ownerInflation: 0, renterInflation: 0,
  ownerMoving: 0, renterMoving: 0, movingFrequency: 0, amortization: 10, years: 10 };

const simple = { ...DEFAULT_SIMPLE_HOUSING, price: 120000, downPayment: 120000, rent: 1000,
  years: 1, mortgageRate: 0, amortization: 1, renterInsurance: 25, homeInsurance: 100,
  propertyTax: 200, strata: 50, maintenance: 150, closingCosts: 3000,
  renterMoving: 1500, ownerMoving: 800, sellingCosts: 2000 };

test("simple housing converts monthly bills once and charges transaction costs once", () => {
  const r = modelSimpleHousing(simple);
  close(r.rentMonthlyBill,1025); close(r.buyMonthlyBill,500);
  close(r.rentCost,13800); close(r.buyCost,11800);
  close(r.upfront,123800); close(r.renterUpfront,1500);
  close(r.averageBuyCost,11800/12); close(r.averageRentCost,1150);
  close(r.final.difference,2000);
});

test("simple costs exclude principal and down payment while monthly bills include principal", () => {
  const r = modelSimpleHousing({...simple,price:1200,downPayment:0,rent:100,renterInsurance:0,homeInsurance:0,propertyTax:0,strata:0,maintenance:0,closingCosts:0,renterMoving:0,ownerMoving:0,sellingCosts:0});
  close(r.buyMonthlyBill,100); close(r.monthlyPrincipal,100); close(r.monthlyInterest,0);
  close(r.buyCost,0); close(r.rentCost,1200); close(r.final.buyWealth,1200);
  close(r.final.rentWealth,0); close(r.final.difference,1200);
});

test("simple flat-price zero-return wealth difference reconciles to actual cost difference", () => {
  for(const years of [1,3,25,40,100]) {
    for(const downPayment of [0,60000,120000]) {
      const r=modelSimpleHousing({...simple,downPayment,years,amortization:25,mortgageRate:4.5});
      close(r.final.difference,r.rentCost-r.buyCost);
    }
  }
});

test("simple market growth separates initial investment, contributions and gains", () => {
  const r=modelSimpleHousing({...simple,rent:0,renterInsurance:0,homeInsurance:0,propertyTax:0,strata:0,maintenance:0,closingCosts:0,renterMoving:0,ownerMoving:0,sellingCosts:0,years:2,investmentReturn:10});
  close(r.renterInitialInvestments,120000); close(r.final.renterContributions,0);
  close(r.final.renterMarketGain,25200); close(r.final.rentWealth,145200);
  close(r.final.buyWealth,120000);
});

test("both paths invest actual monthly savings and balances reconcile under losses too", () => {
  for(const investmentReturn of [-20,0,7]) {
    const r=modelSimpleHousing({...simple,downPayment:30000,amortization:2,years:4,mortgageRate:4,investmentReturn});
    assert.ok(r.final.renterContributions>0);
    assert.ok(r.final.ownerContributions>0);
    for(const p of r.points) {
      close(p.rentWealth,r.renterInitialInvestments+p.renterContributions+p.renterMarketGain);
      close(p.ownerInvestments,r.ownerInitialInvestments+p.ownerContributions+p.ownerMarketGain);
      close(p.buyWealth,p.homeValue-p.debt-simple.sellingCosts+p.ownerInvestments);
    }
    close(r.points[2].mortgagePaid,0);
  }
});

test("simple mortgage bill splits exactly into interest, principal and monthly expenses", () => {
  const r=modelSimpleHousing({...simple,downPayment:20000,mortgageRate:6,amortization:25,years:30});
  close(r.monthlyInterest+r.monthlyPrincipal,r.payment);
  close(r.buyMonthlyBill,r.monthlyInterest+r.monthlyPrincipal+500);
  assert.ok(r.points[1].annualInterest<r.points[0].annualInterest);
  close(r.points[25].ownerAnnual,6000);
});

test("simple page keeps other bills flat and has no dormant advanced inputs", () => {
  const a=modelSimpleHousing({...simple,years:10});
  const b=modelSimpleHousing({...simple,years:10,ownerInflation:20,renterInflation:20,movingFrequency:1,mortgageRateChanges:[{year:2,rate:20}]});
  close(a.rentCost,124500); close(a.buyCost,b.buyCost);
  assert.deepEqual(a.points,b.points);
  assert.equal(a.points.filter(p=>p.movingPaid>0).length,1);
});

test("simple rent inflation compounds at anniversaries and feeds total rental costs", () => {
  const r=modelSimpleHousing({...simple,years:3,rentInflation:10});
  [12000,13200,14520].forEach((v,i)=>close(r.points[i].rentPaid,v));
  close(r.rentCosts[0].value,39720);
  close(r.rentCost,42120); // Growing rent + flat insurance + one move.
  close(r.rentMonthlyBill,1025); // The monthly-bills card still shows year 1.
  close(r.final.difference,r.rentCost-r.buyCost);
  const oneYear=modelSimpleHousing({...simple,rentInflation:10});
  close(oneYear.rentCost,modelSimpleHousing(simple).rentCost);
});

test("rising rent changes which path invests the monthly savings", () => {
  const r=modelSimpleHousing({...simple,rent:900,renterInsurance:0,homeInsurance:1000,propertyTax:0,strata:0,maintenance:0,closingCosts:0,renterMoving:0,ownerMoving:0,sellingCosts:0,years:3,rentInflation:20,investmentReturn:6});
  close(r.final.renterContributions,1200); // Renter saves 100/month in year 1 only.
  close(r.final.ownerContributions,4512); // Buyer saves 80/month then 296/month.
  close(r.final.rentWealth,r.renterInitialInvestments+r.final.renterContributions+r.final.renterMarketGain);
  close(r.final.ownerInvestments,r.ownerInitialInvestments+r.final.ownerContributions+r.final.ownerMarketGain);
  assert.ok(r.final.rentWealth<modelSimpleHousing({...simple,rent:900,renterInsurance:0,homeInsurance:1000,propertyTax:0,strata:0,maintenance:0,closingCosts:0,renterMoving:0,ownerMoving:0,sellingCosts:0,years:3,rentInflation:0,investmentReturn:6}).final.rentWealth);
});

test("simple comparison preserves negative equity and validates monthly amounts", () => {
  const r=modelSimpleHousing({...simple,downPayment:0,mortgageRate:8,amortization:40,appreciation:-20});
  assert.ok(r.netHomeEquity<0);
  for(const update of [{renterInsurance:NaN},{propertyTax:-1},{strata:1e8},{years:1.5},{downPayment:120001},{investmentReturn:31},{rentInflation:NaN},{rentInflation:-1},{rentInflation:31}]) {
    assert.ok(validateSimpleHousing({...simple,...update}).length);
    assert.throws(()=>modelSimpleHousing({...simple,...update}));
  }
});

test("simple export states monthly units and reconciles cost and investment summaries", () => {
  const csv=simpleHousingCsv(simple,"CAD");
  assert.ok(csv.includes("Units,Recurring cash inputs are monthly"));
  assert.ok(csv.includes("Renting,13800")); assert.ok(csv.includes("Buying,11800"));
  assert.ok(csv.includes("ownerContributions,renterContributions,ownerMarketGain,renterMarketGain"));
  assert.ok(csv.includes("renterMoving,1500"));
  const growing=simpleHousingCsv({...simple,years:3,rentInflation:10},"CAD");
  assert.ok(growing.includes("rentInflation,10"));
  assert.ok(growing.includes("Renting,42120"));
  assert.ok(growing.includes("year,rentPaid,homeValue"));
  close(Number(growing.split("\n").find(line=>line.startsWith("3,")).split(",")[1]),14520);
});

test("monthly mortgage matches a known 30-year 6% payment", () => {
  close(mortgagePayment(300000, 6, 30, "monthly"), 1798.651575);
});
test("semiannual nominal rate converts to an equivalent monthly rate", () => {
  close(mortgagePayment(100000, 6, 1, "semiannual"), 100000 * (Math.pow(1.03, 1/6)-1) / (1-Math.pow(1.03,-2)), 1e-6);
});
test("zero interest repays principal fully at the selected tenure", () => {
  const r = modelHousing({ ...flat, downPayment: 0, amortization: 2, years: 2 });
  close(r.payment, 5000); close(r.final.debt, 0); close(r.final.interestPaid, 0);
  close(r.final.principalPaid, 120000); close(r.final.difference, 0);
  assert.deepEqual(r.points.map(p => p.year), [1, 2]);
});
test("standard loan balance is zero at full tenure", () => {
  const r = modelHousing({ ...DEFAULT_HOUSING, years: DEFAULT_HOUSING.amortization });
  close(r.final.debt, 0); close(r.final.principalPaid, 600000);
  assert.equal(r.points.length, DEFAULT_HOUSING.amortization);
});
test("equal starting cash and free housing produce equal wealth", () => {
  const r = modelHousing(flat);
  close(r.final.buyWealth, 120000); close(r.final.rentWealth, 120000); close(r.final.difference, 0);
});
test("owner invests savings when renting is more expensive", () => {
  const r = modelHousing({ ...flat, rent: 1000, amortization: 1, years: 1 });
  close(r.final.ownerInvestments, 12000); close(r.final.difference, 12000);
});
test("renter invests savings when ownership is more expensive", () => {
  const r = modelHousing({ ...flat, homeInsurance: 12000, amortization: 1, years: 1 });
  close(r.final.rentWealth, 132000); close(r.final.difference, -12000);
});
test("fixed cash closing and sale costs are charged once", () => {
  const r = modelHousing({ ...flat, closingCosts: 3000, sellingCosts: 6000, amortization: 1, years: 1 });
  close(r.upfront, 123000); close(r.final.buyWealth, 114000); close(r.final.difference, -9000);
  close(r.points[0].ownerCashOutflow, 123000);
});
test("effective annual investment growth is preserved by monthly compounding", () => {
  const r = modelHousing({ ...flat, investmentReturn: 10, amortization: 2, years: 2 });
  close(r.final.rentWealth, 145200);
});
test("rent inflation compounds annually as a percentage", () => {
  const r = modelHousing({ ...flat, rent: 1000, rentInflation: 10, amortization: 3, years: 3 });
  close(r.points[0].rentPaid, 12000); close(r.points[1].rentPaid, 13200); close(r.points[2].rentPaid, 14520);
});
test("expense inflation compounds independently of home growth", () => {
  const r = modelHousing({ ...flat, propertyTax: 1000, ownerInflation: 10,
    renterInsurance: 100, renterInflation: 25, appreciation: 20, amortization: 3, years: 3 });
  [1000, 1100, 1210].forEach((v, i) => close(r.points[i].ownerExpenses, v));
  assert.deepEqual(r.points.map(p => p.renterExpenses), [100, 125, 156.25]);
});
test("actual rental moves happen initially, then at the start of repeat years", () => {
  const r = modelHousing({ ...flat, renterMoving: 2000, movingFrequency: 3, amortization: 7, years: 7 });
  close(r.renterInitialInvestments, 118000);
  assert.deepEqual(r.points.map(p => p.movingPaid), [2000, 0, 0, 2000, 0, 0, 2000]);
  close(r.final.difference, 6000);
  close(r.points[0].renterCashOutflow, 2000); close(r.points[3].renterCashOutflow, 2000);
});
test("zero repeat interval still charges the initial rental move", () => {
  const r = modelHousing({ ...flat, renterMoving: 2000, movingFrequency: 0, amortization: 3, years: 3 });
  close(r.final.difference, 2000); assert.deepEqual(r.points.map(p => p.movingPaid), [2000, 0, 0]);
});
test("identical initial moving costs cancel without double-counting", () => {
  const r = modelHousing({ ...flat, ownerMoving: 2000, renterMoving: 2000 });
  close(r.final.difference, 0); close(r.points[0].ownerCashOutflow, 122000);
});
test("equal initial budgets hold even if renter setup costs exceed buyer setup", () => {
  const r = modelHousing({ ...flat, downPayment: 0, renterMoving: 5000, amortization: 1, years: 1 });
  close(r.startingCash, 5000); close(r.ownerInitialInvestments, 5000); close(r.renterInitialInvestments, 0);
});
test("cash flow includes upfront and recurring spending; net worth excludes double-counted principal", () => {
  const r = modelHousing({ ...flat, downPayment: 0, amortization: 1, years: 1 });
  close(r.points[0].ownerCashOutflow, 120000);
  close(r.final.buyWealth, 120000); close(r.final.rentWealth, 120000);
});
test("net worth reconciles to home plus investments less mortgage and sale costs", () => {
  const r = modelHousing(DEFAULT_HOUSING);
  for (const p of r.points) close(p.buyWealth, p.homeValue + p.ownerInvestments - p.debt - DEFAULT_HOUSING.sellingCosts);
});
test("computed rent and rate thresholds balance final wealth and flip on either side", () => {
  const x = { ...DEFAULT_HOUSING };
  const thresholds = housingBreakEvens(x);
  assert.equal(thresholds.rent.status, "crossing"); assert.equal(thresholds.rate.status, "crossing");
  close(modelHousing({ ...x, rent: thresholds.rent.value }).final.difference, 0);
  assert.ok(modelHousing({ ...x, rent: thresholds.rent.value - 100 }).final.difference < 0);
  assert.ok(modelHousing({ ...x, rent: thresholds.rent.value + 100 }).final.difference > 0);
  close(modelHousing({ ...x, mortgageRate: thresholds.rate.value }).final.difference, 0);
  assert.ok(modelHousing({ ...x, mortgageRate: thresholds.rate.value - 0.1 }).final.difference > 0);
  assert.ok(modelHousing({ ...x, mortgageRate: thresholds.rate.value + 0.1 }).final.difference < 0);
});
test("cash purchase has no mortgage-rate threshold; no crossing is explicitly handled", () => {
  assert.equal(housingBreakEvens(flat).rate.status, "no-loan");
  assert.equal(housingBreakEvens(flat).rent.status, "buy-throughout");
  assert.equal(housingBreakEvens({ ...flat, sellingCosts: 100000000, amortization: 1, years: 1 }).rent.status, "rent-throughout");
});
test("invalid cash values, incomplete inputs and fractional tenure cannot project", () => {
  for (const values of [{ years: 0 }, { amortization: 2, years: 2.5 }, { price: NaN }, { downPayment: 120001 }, { investmentReturn: -100 }, { renterMoving: -5 }, { movingFrequency: 1.5 }]) {
    assert.ok(validateHousing({ ...flat, ...values }).length);
    assert.throws(() => modelHousing({ ...flat, ...values }));
  }
});

 test("time in the house can extend to 100 years beyond mortgage payoff", () => {
  const r = modelHousing({ ...flat, downPayment: 0, amortization: 2, years: 100 });
  assert.equal(r.points.length, 100);
  close(r.points[1].debt, 0);
  close(r.points[2].mortgagePaid, 0);
  close(r.points[99].mortgagePaid, 0);
  close(r.final.principalPaid, 120000);
  close(r.final.difference, 0);
});
test("short stay ends with outstanding mortgage independent of tenure", () => {
  const r = modelHousing({ ...flat, downPayment: 0, amortization: 10, years: 2 });
  assert.equal(r.points.length, 2);
  close(r.final.debt, 96000);
  close(r.final.buyWealth, 24000);
  close(r.final.rentWealth, 24000);
});
test("time horizon rejects more than 100 years", () => {
  assert.ok(validateHousing({ ...flat, years: 101 }).length);
});

test("condo inclusion switches remove separate charges without removing condo fees", () => {
  const x = { ...flat, propertyType: "condo", propertyTax: 3000, homeInsurance: 600, hoa: 7200, years: 2, ownerInflation: 10 };
  const separate = modelHousing(x);
  const included = modelHousing({ ...x, condoTaxIncluded: true, condoInsuranceIncluded: true });
  close(separate.points[0].ownerExpenses, 10800);
  close(included.points[0].ownerExpenses, 7200);
  close(included.points[1].ownerExpenses, 7920);
  close(separate.points[1].ownerExpenses - included.points[1].ownerExpenses, 3960);
});
test("house costs are separate even if dormant condo inclusion flags remain set", () => {
  const r = modelHousing({ ...flat, propertyTax: 3000, homeInsurance: 600, hoa: 7200, condoTaxIncluded: true, condoInsuranceIncluded: true });
  close(r.points[0].ownerExpenses, 10800);
});
test("each condo inclusion flag removes only its own charge", () => {
  const x = { ...flat, propertyType: "condo", propertyTax: 3000, homeInsurance: 600, hoa: 7200 };
  close(modelHousing({ ...x, condoTaxIncluded: true }).points[0].ownerExpenses, 7800);
  close(modelHousing({ ...x, condoInsuranceIncluded: true }).points[0].ownerExpenses, 10200);
});
test("repeat move prices follow rental expense inflation", () => {
  const r = modelHousing({ ...flat, renterMoving: 1000, movingFrequency: 2, renterInflation: 10, years: 3 });
  close(r.points[0].movingPaid, 1000);
  close(r.points[1].movingPaid, 0);
  close(r.points[2].movingPaid, 1210);
});
test("invalid property selections and inflation rates are rejected", () => {
  for (const values of [{ propertyType: "other" }, { rentInflation: -1 }, { ownerInflation: 31 }, { condoTaxIncluded: "yes" }]) {
    assert.ok(validateHousing({ ...flat, ...values }).length);
  }
});


test("utilities cannot change cash flow, wealth or break-even results in either property type", () => {
  for (const propertyType of ["house", "condo"]) {
    const x = { ...DEFAULT_HOUSING, propertyType, ownerInflation: 8, renterInflation: 1 };
    const baseline = modelHousing(x);
    // Older callers may still pass the removed utility fields; neither is charged.
    const withUtilities = { ...x, ownerUtilities: 25000, renterUtilities: 100 };
    assert.deepEqual(modelHousing(withUtilities), baseline);
    assert.deepEqual(housingBreakEvens(withUtilities), housingBreakEvens(x));
  }
});

test("renewal changes payments on the remaining balance and keeps the original payoff year", () => {
  const r = modelHousing({ ...flat, downPayment: 0, amortization: 2, years: 3,
    compounding: "monthly", mortgageRateChanges: [{ year: 2, rate: 12 }] });
  close(r.points[0].debt, 60000);
  close(r.points[0].monthlyMortgagePayment, 5000);
  const renewedPayment = 60000 * 0.01 / (1 - 1.01 ** -12);
  close(r.points[1].monthlyMortgagePayment, renewedPayment);
  close(r.points[1].annualInterest, renewedPayment * 12 - 60000);
  close(r.points[1].debt, 0); close(r.final.principalPaid, 120000);
  close(r.points[2].monthlyMortgagePayment, 0); close(r.points[2].mortgagePaid, 0);
});
test("same-rate renewals preserve a constant-rate mortgage", () => {
  const x = { ...DEFAULT_HOUSING, years: 25 };
  const steady = modelHousing(x);
  const renewed = modelHousing({ ...x, mortgageRateChanges: [{ year: 6, rate: x.mortgageRate }, { year: 11, rate: x.mortgageRate }] });
  for (let i = 0; i < x.years; i++) {
    close(renewed.points[i].mortgagePaid, steady.points[i].mortgagePaid);
    close(renewed.points[i].debt, steady.points[i].debt);
    close(renewed.points[i].buyWealth, steady.points[i].buyWealth);
    close(renewed.points[i].rentWealth, steady.points[i].rentWealth);
  }
});
test("rising and falling rates affect only years after renewal and flow into wealth", () => {
  const x = { ...DEFAULT_HOUSING, mortgageRate: 5, years: 25 };
  const steady = modelHousing(x);
  const rising = modelHousing({ ...x, mortgageRateChanges: [{ year: 6, rate: 6.5 }] });
  const falling = modelHousing({ ...x, mortgageRateChanges: [{ year: 6, rate: 3.5 }] });
  assert.deepEqual(rising.points.slice(0, 5), steady.points.slice(0, 5));
  assert.deepEqual(falling.points.slice(0, 5), steady.points.slice(0, 5));
  assert.ok(rising.points[5].monthlyMortgagePayment > steady.points[5].monthlyMortgagePayment);
  assert.ok(falling.points[5].monthlyMortgagePayment < steady.points[5].monthlyMortgagePayment);
  assert.ok(rising.final.interestPaid > steady.final.interestPaid);
  assert.ok(falling.final.interestPaid < steady.final.interestPaid);
  assert.ok(rising.final.difference < steady.final.difference);
  assert.ok(falling.final.difference > steady.final.difference);
  close(rising.final.debt, 0); close(falling.final.debt, 0);
});
test("multiple renewals apply by year regardless of entry order, including a zero rate", () => {
  const x = { ...DEFAULT_HOUSING, years: 25, mortgageRate: 5 };
  const schedule = [{ year: 6, rate: 6.5 }, { year: 11, rate: 0 }, { year: 16, rate: 4 }];
  const r = modelHousing({ ...x, mortgageRateChanges: schedule });
  assert.deepEqual(modelHousing({ ...x, mortgageRateChanges: [...schedule].reverse() }), r);
  assert.equal(r.points[5].mortgageRate, 6.5); assert.equal(r.points[10].mortgageRate, 0);
  close(r.points[10].annualInterest, 0);
  close(r.points[10].monthlyMortgagePayment, r.points[9].debt / (15 * 12));
  assert.equal(r.points[15].mortgageRate, 4); close(r.final.debt, 0);
});
test("rate changes after the stay or loan payoff have no effect, including cash purchases", () => {
  for (const x of [{ ...DEFAULT_HOUSING, years: 3 }, { ...flat, downPayment: 0, amortization: 2, years: 10 }, flat]) {
    assert.deepEqual(modelHousing({ ...x, mortgageRateChanges: [{ year: 6, rate: 20 }] }), modelHousing(x));
  }
});
test("break-even starting rate preserves entered future renewal rates", () => {
  const x = { ...DEFAULT_HOUSING, mortgageRateChanges: [{ year: 6, rate: 6.5 }] };
  const threshold = housingBreakEvens(x);
  assert.equal(threshold.rate.status, "crossing");
  close(modelHousing({ ...x, mortgageRate: threshold.rate.value }).final.difference, 0);
  assert.ok(modelHousing({ ...x, mortgageRate: threshold.rate.value - 0.1 }).final.difference > 0);
  assert.ok(modelHousing({ ...x, mortgageRate: threshold.rate.value + 0.1 }).final.difference < 0);
  close(modelHousing({ ...x, rent: threshold.rent.value }).final.difference, 0);
});
test("invalid and duplicate renewal entries cannot project", () => {
  for (const mortgageRateChanges of [undefined, null, {}, [{ year: 1, rate: 5 }], [{ year: 41, rate: 5 }],
    [{ year: 6.5, rate: 5 }], [{ year: 6, rate: NaN }], [{ year: 6, rate: -1 }], [{ year: 6, rate: 101 }],
    [{ year: 6, rate: 4 }, { year: 6, rate: 5 }], [null]]) {
    assert.ok(validateHousing({ ...flat, mortgageRateChanges }).length);
    assert.throws(() => modelHousing({ ...flat, mortgageRateChanges }));
  }
});
