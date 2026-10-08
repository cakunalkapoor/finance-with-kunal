export type CarInputs = {
  price: number; down: number; rate: number; loanMonths: number; months: number; leaseMonths: number;
  resale: number; lease: number; upfront: number; buyRunning: number; leaseRunning: number;
  distance: number; allowance: number; excessRate: number; returnFees: number;
  investmentReturn: number; runningInflation: number;
};
export const DEFAULT_CAR: CarInputs = {
  price: 40000, down: 5000, rate: 6, loanMonths: 60, months: 36, leaseMonths: 36, resale: 26000,
  lease: 500, upfront: 2000, buyRunning: 0, leaseRunning: 0, distance: 15000,
  allowance: 20000, excessRate: 0, returnFees: 0, investmentReturn: 0, runningInflation: 0,
};
export function validateCar(p: CarInputs) {
  if (Object.values(p).some(v => !Number.isFinite(v))) return "Complete every assumption with a valid number.";
  if (Object.entries(p).some(([key, v]) => key !== "investmentReturn" && (v < 0 || v > 100000000))) return "Enter non-negative amounts no greater than 100 million.";
  if (p.price <= 0) return "Purchase price must be above zero.";
  if (p.down > p.price) return "The down payment cannot exceed the purchase price.";
  if (!Number.isInteger(p.months) || p.months < 1 || p.months > 360) return "Choose a driving duration from 1 to 360 whole months.";
  if (![p.leaseMonths, p.loanMonths].every(v => Number.isInteger(v) && v >= 1 && v <= 120)) return "Enter whole-number terms between 1 and 120 months.";
  if (p.months % p.leaseMonths !== 0) return "Choose a driving duration covering complete leases (a multiple of the lease term). Early termination is not modeled.";
  if (p.rate > 100) return "Enter a loan rate between 0% and 100%.";
  if (p.investmentReturn < -20 || p.investmentReturn > 30) return "Investment return must be between −20% and 30%.";
  if (p.runningInflation > 30) return "Running-cost inflation must be between 0% and 30%.";
  return null;
}
export interface CarPoint {
  month: number; carValue: number; balance: number; equity: number;
  buyInvestments: number; leaseInvestments: number; buyWealth: number; leaseWealth: number;
  difference: number; buyCashOutflow: number; leaseCashOutflow: number;
  cumulativeBuyCash: number; cumulativeLeaseCash: number;
  loanPaid: number; interest: number; principal: number;
}
export function modelCar(p: CarInputs) {
  const error = validateCar(p);
  if (error) throw new Error(error);
  const principal = p.price - p.down, r = p.rate / 1200;
  const payment = r === 0 ? principal / p.loanMonths : principal * r / (1 - (1 + r) ** -p.loanMonths);
  const startingCash = Math.max(p.down, p.upfront);
  const monthlyReturn = (1 + p.investmentReturn / 100) ** (1 / 12) - 1;
  const leaseCount = p.months / p.leaseMonths;
  const mileageFeesPerLease = Math.max(0, (p.distance - p.allowance) * p.leaseMonths / 12) * p.excessRate;
  const mileageFees = mileageFeesPerLease * leaseCount;
  const totalReturnFees = p.returnFees * leaseCount;
  const leaseUpfrontPaid = p.upfront * leaseCount;
  let balance = principal, paid = 0, interestPaid = 0, principalPaid = 0;
  let buyCash = p.down, leaseCash = p.upfront, buyRunningPaid = 0, leaseRunningPaid = 0;
  let buyInvestments = startingCash - p.down, leaseInvestments = startingCash - p.upfront;
  const points: CarPoint[] = [];
  for (let month = 1; month <= p.months; month++) {
    const interest = balance > 0.000001 && month <= p.loanMonths ? balance * r : 0;
    const amount = balance > 0.000001 && month <= p.loanMonths ? Math.min(payment, balance + interest) : 0;
    const repaid = amount - interest;
    balance = month >= p.loanMonths ? 0 : Math.max(0, balance - repaid);
    paid += amount; interestPaid += interest; principalPaid += repaid;
    const inflation = (1 + p.runningInflation / 100) ** Math.floor((month - 1) / 12);
    const buyRunning = p.buyRunning / 12 * inflation, leaseRunning = p.leaseRunning / 12 * inflation;
    buyRunningPaid += buyRunning; leaseRunningPaid += leaseRunning;
    const buyMonthly = amount + buyRunning;
    const leaseReturn = month % p.leaseMonths === 0 ? mileageFeesPerLease + p.returnFees : 0;
    const replacementUpfront = month > 1 && (month - 1) % p.leaseMonths === 0 ? p.upfront : 0;
    const leaseMonthly = p.lease + leaseRunning + leaseReturn + replacementUpfront;
    buyCash += buyMonthly; leaseCash += leaseMonthly;
    buyInvestments = buyInvestments * (1 + monthlyReturn) + Math.max(0, leaseMonthly - buyMonthly);
    leaseInvestments = leaseInvestments * (1 + monthlyReturn) + Math.max(0, buyMonthly - leaseMonthly);
    // Intermediate values illustrate a straight-line path to the entered net resale proceeds.
    // They are not market estimates or early-exit valuations.
    const carValue = p.price + (p.resale - p.price) * month / p.months;
    const equity = carValue - balance;
    const buyWealth = equity + buyInvestments;
    points.push({ month, carValue, balance, equity, buyInvestments, leaseInvestments, buyWealth,
      leaseWealth: leaseInvestments, difference: buyWealth - leaseInvestments,
      buyCashOutflow: buyMonthly + (month === 1 ? p.down : 0),
      leaseCashOutflow: leaseMonthly + (month === 1 ? p.upfront : 0),
      cumulativeBuyCash: buyCash, cumulativeLeaseCash: leaseCash, loanPaid: amount, interest, principal: repaid });
  }
  const final = points[points.length - 1];
  const periods = points.filter(p => p.month % 12 === 0 || p.month === final.month).map((end, i, ends) => {
    const previousMonth = i === 0 ? 0 : ends[i - 1].month;
    const period = points.slice(previousMonth, end.month);
    return { ...end, startMonth: previousMonth + 1,
      buyCashOutflow: period.reduce((s, v) => s + v.buyCashOutflow, 0),
      leaseCashOutflow: period.reduce((s, v) => s + v.leaseCashOutflow, 0),
      loanPaid: period.reduce((s, v) => s + v.loanPaid, 0),
      interest: period.reduce((s, v) => s + v.interest, 0),
      principal: period.reduce((s, v) => s + v.principal, 0) };
  });
  return { payment, balance, paid, mileageFees, leaseCount, totalReturnFees, leaseUpfrontPaid, buyCash, leaseCash, equity: final.equity,
    buyCost: buyCash - final.equity, leaseCost: leaseCash, startingCash,
    buyInitialInvestments: startingCash - p.down, leaseInitialInvestments: startingCash - p.upfront,
    interestPaid, principalPaid, buyRunningPaid, leaseRunningPaid, points, periods, final };
}
export function carBreakEvens(p: CarInputs) {
  function solve(key: "lease" | "resale", max: number) {
    const at = (value: number) => modelCar({ ...p, [key]: value }).final.difference;
    if (at(0) > 0 || at(max) < 0) return null;
    let low = 0, high = max;
    for (let i = 0; i < 48; i++) {
      const mid = (low + high) / 2;
      if (at(mid) >= 0) high = mid; else low = mid;
    }
    return (low + high) / 2;
  }
  return { lease: solve("lease", 100000), resale: solve("resale", 100000000) };
}
export function carScenarioCsv(p: CarInputs, currency: string) {
  const result = modelCar(p);
  return ["Car buy versus lease — illustrative projection", `Currency,${currency}`, "Assumption,Value",
    ...Object.entries(p).map(([key, value]) => `${key},${value}`),
    "Method,Equal starting cash and equal monthly budgets; cheaper path invests the difference",
    "Car value path,Straight-line illustration from all-in price to entered net resale proceeds",
    "Lease ending,Repeat identical leases; upfront costs at each start and fees at each return; no early exit",
    "", "Month,Illustrative car value,Loan balance,Buyer investments,Lessee investments,Buy net worth,Lease net worth,Buy minus lease,Buy cash outflow,Lease cash outflow,Loan payment,Loan interest,Loan principal",
    ...result.points.map(v => [v.month, v.carValue, v.balance, v.buyInvestments, v.leaseInvestments, v.buyWealth, v.leaseWealth, v.difference, v.buyCashOutflow, v.leaseCashOutflow, v.loanPaid, v.interest, v.principal].map(n => n.toFixed(2)).join(","))].join("\n");
}
