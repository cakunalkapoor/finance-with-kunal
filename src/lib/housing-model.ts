export interface MortgageRateChange { year: number; rate: number }

export interface HousingInputs {
  propertyType: "house" | "condo";
  condoTaxIncluded: boolean;
  condoInsuranceIncluded: boolean;
  price: number;
  downPayment: number;
  mortgageRate: number;
  mortgageRateChanges: MortgageRateChange[];
  amortization: number;
  years: number;
  rent: number;
  rentInflation: number;
  appreciation: number;
  investmentReturn: number;
  propertyTax: number;
  maintenance: number;
  homeInsurance: number;
  hoa: number;
  ownerOther: number;
  renterInsurance: number;
  renterOther: number;
  ownerInflation: number;
  renterInflation: number;
  closingCosts: number;
  sellingCosts: number;
  ownerMoving: number;
  renterMoving: number;
  movingFrequency: number;
  mortgageInsurance: number;
  compounding: "monthly" | "semiannual";
}

// Basic inputs are illustrative. Optional numeric assumptions start at zero;
// users enter costs, inflation and growth before including them in a scenario.
export const DEFAULT_HOUSING: HousingInputs = {
  propertyType: "house", condoTaxIncluded: false, condoInsuranceIncluded: false,
  price: 750000, downPayment: 150000, mortgageRate: 4.5, mortgageRateChanges: [], amortization: 25, years: 10,
  rent: 3000, rentInflation: 0, appreciation: 0, investmentReturn: 0,
  propertyTax: 0, maintenance: 0, homeInsurance: 0, hoa: 0,
  ownerOther: 0, renterInsurance: 0,
  renterOther: 0, ownerInflation: 0,
  renterInflation: 0, closingCosts: 0, sellingCosts: 0,
  ownerMoving: 0, renterMoving: 0, movingFrequency: 0,
  mortgageInsurance: 0, compounding: "semiannual",
};

export interface HousingYear {
  year: number;
  homeValue: number;
  debt: number;
  equity: number;
  ownerInvestments: number;
  renterInvestments: number;
  buyWealth: number;
  rentWealth: number;
  difference: number;
  ownerAnnual: number;
  renterAnnual: number;
  ownerCashOutflow: number;
  renterCashOutflow: number;
  ownerExpenses: number;
  renterExpenses: number;
  rentPaid: number;
  movingPaid: number;
  mortgagePaid: number;
  mortgageRate: number;
  monthlyMortgagePayment: number;
  annualInterest: number;
  annualPrincipal: number;
  interestPaid: number;
  principalPaid: number;
}

export function validateHousing(x: HousingInputs): string[] {
  for (const [key, value] of Object.entries(x)) {
    if (!["compounding", "propertyType", "condoTaxIncluded", "condoInsuranceIncluded", "mortgageRateChanges"].includes(key) && (typeof value !== "number" || !Number.isFinite(value))) {
      return ["Complete all numeric assumptions before comparing."];
    }
  }
  const errors: string[] = [];
  if (!Array.isArray(x.mortgageRateChanges) || x.mortgageRateChanges.length > 39 || x.mortgageRateChanges.some(change =>
    !change || !Number.isInteger(change.year) || change.year < 2 || change.year > 40 ||
    typeof change.rate !== "number" || !Number.isFinite(change.rate) || change.rate < 0 || change.rate > 100)) {
    errors.push("Rate changes need a start year from 2 to 40 and a rate from 0% to 100%.");
  } else if (new Set(x.mortgageRateChanges.map(change => change.year)).size !== x.mortgageRateChanges.length) {
    errors.push("Use only one mortgage rate change per year.");
  }
  if (!["house", "condo"].includes(x.propertyType)) errors.push("Choose house or condo.");
  if (typeof x.condoTaxIncluded !== "boolean" || typeof x.condoInsuranceIncluded !== "boolean") errors.push("Confirm which condo costs are included in fees.");
  for (const key of ["rentInflation", "ownerInflation", "renterInflation"] as const) {
    if (x[key] < 0 || x[key] > 30) errors.push("Annual inflation assumptions must be between 0% and 30%.");
  }
  if (x.price <= 0 || x.price > 100000000) errors.push("Home price must be above 0 and at most 100 million.");
  if (x.downPayment < 0 || x.downPayment > x.price) errors.push("Down payment must be between zero and the home price.");
  if (!Number.isInteger(x.years) || x.years < 1 || x.years > 100) errors.push("Time in the house must be a whole number from 1 to 100 years.");
  if (!Number.isInteger(x.amortization) || x.amortization < 1 || x.amortization > 40) errors.push("Mortgage tenure must be a whole number from 1 to 40 years.");
  if (x.mortgageRate < 0 || x.mortgageRate > 100) errors.push("Mortgage rate must be between 0% and 100%.");
  for (const key of ["appreciation", "investmentReturn"] as const) {
    if (x[key] < -20 || x[key] > 30) errors.push(`${key === "appreciation" ? "Home growth" : "Investment return"} must be between −20% and 30%.`);
  }
  for (const key of Object.keys(x) as (keyof HousingInputs)[]) {
    if (["compounding", "propertyType", "condoTaxIncluded", "condoInsuranceIncluded", "mortgageRateChanges", "rentInflation", "ownerInflation", "renterInflation", "appreciation", "investmentReturn", "mortgageRate", "amortization", "years", "movingFrequency"].includes(key)) continue;
    const value = x[key] as number;
    if (value < 0 || value > 100000000) { errors.push("Cash amounts must be between zero and 100 million."); break; }
  }
  if (!Number.isInteger(x.movingFrequency) || x.movingFrequency < 0 || x.movingFrequency > 40) errors.push("Rental moving frequency must be a whole number from 0 to 40 years. Zero means no repeat moves.");
  if (!["monthly", "semiannual"].includes(x.compounding)) errors.push("Choose a mortgage compounding convention.");
  return errors;
}

export function mortgagePayment(principal: number, annualPercent: number, years: number, compounding: HousingInputs["compounding"]): number {
  const rate = compounding === "semiannual" ? Math.pow(1 + annualPercent / 200, 1 / 6) - 1 : annualPercent / 1200;
  if (principal === 0) return 0;
  if (rate === 0) return principal / (years * 12);
  return principal * rate / (1 - Math.pow(1 + rate, -years * 12));
}

export function modelHousing(x: HousingInputs) {
  const errors = validateHousing(x);
  if (errors.length) throw new Error(errors.join(" "));
  const upfront = x.downPayment + x.closingCosts + x.ownerMoving;
  const renterUpfront = x.renterMoving;
  // Equal initial funds even when renting has unusually high setup costs.
  const startingCash = Math.max(upfront, renterUpfront);
  const loan = x.price - x.downPayment;
  const payment = mortgagePayment(loan, x.mortgageRate, x.amortization, x.compounding);
  let currentRate = x.mortgageRate;
  let currentPayment = payment;
  const rateChanges = new Map(x.mortgageRateChanges.map(change => [change.year, change.rate]));
  const monthlyReturn = Math.pow(1 + x.investmentReturn / 100, 1 / 12) - 1;
  const separatePropertyTax = x.propertyType === "condo" && x.condoTaxIncluded ? 0 : x.propertyTax;
  const separateInsurance = x.propertyType === "condo" && x.condoInsuranceIncluded ? 0 : x.homeInsurance;
  // Utilities are assumed equal in both paths and excluded from the comparison.
  const ownerBaseExpenses = separatePropertyTax + x.maintenance + separateInsurance + x.hoa + x.ownerOther;
  const renterBaseExpenses = x.renterInsurance + x.renterOther;
  let debt = loan;
  let renterInvestments = startingCash - renterUpfront;
  let ownerInvestments = startingCash - upfront;
  let interestPaid = 0;
  let principalPaid = 0;
  const points: HousingYear[] = [];
  for (let year = 1; year <= x.years; year++) {
    const nextRate = rateChanges.get(year);
    if (nextRate !== undefined && debt > 0.000001 && year <= x.amortization) {
      currentRate = nextRate;
      // Keep the original payoff date; renew only the remaining balance.
      currentPayment = mortgagePayment(debt, currentRate, x.amortization - year + 1, x.compounding);
    }
    const mortgageActive = debt > 0.000001;
    const monthlyMortgagePayment = mortgageActive ? currentPayment : 0;
    const mortgageRate = mortgageActive ? currentRate : 0;
    const rate = x.compounding === "semiannual" ? Math.pow(1 + currentRate / 200, 1 / 6) - 1 : currentRate / 1200;
    const ownerExpenses = ownerBaseExpenses * Math.pow(1 + x.ownerInflation / 100, year - 1);
    const renterExpenses = renterBaseExpenses * Math.pow(1 + x.renterInflation / 100, year - 1);
    const rentPaid = x.rent * Math.pow(1 + x.rentInflation / 100, year - 1) * 12;
    // Initial rental move is paid at time zero; subsequent moves occur at
    // the start of year 1 + frequency, then 1 + 2*frequency, etc.
    const repeatMove = x.movingFrequency > 0 && year > 1 && (year - 1) % x.movingFrequency === 0 ? x.renterMoving * Math.pow(1 + x.renterInflation / 100, year - 1) : 0;
    let ownerAnnual = 0;
    let renterAnnual = 0;
    let annualInterest = 0;
    let annualPrincipal = 0;
    let mortgagePaid = 0;
    for (let month = 0; month < 12; month++) {
      const interest = debt > 0.000001 ? debt * rate : 0;
      const paid = debt > 0.000001 ? Math.min(currentPayment, debt + interest) : 0;
      const principal = Math.max(0, paid - interest);
      const ownerCost = paid + ownerExpenses / 12 + (debt > 0.000001 ? x.mortgageInsurance / 12 : 0);
      const renterCost = (rentPaid + renterExpenses) / 12 + (month === 0 ? repeatMove : 0);
      debt = Math.max(0, debt - principal);
      annualInterest += interest; annualPrincipal += principal; mortgagePaid += paid;
      renterInvestments = renterInvestments * (1 + monthlyReturn) + Math.max(0, ownerCost - renterCost);
      ownerInvestments = ownerInvestments * (1 + monthlyReturn) + Math.max(0, renterCost - ownerCost);
      ownerAnnual += ownerCost; renterAnnual += renterCost;
    }
    interestPaid += annualInterest; principalPaid += annualPrincipal;
    const homeValue = x.price * Math.pow(1 + x.appreciation / 100, year);
    const equity = homeValue - debt;
    const buyWealth = equity - x.sellingCosts + ownerInvestments;
    points.push({ year, homeValue, debt, equity, ownerInvestments, renterInvestments,
      buyWealth, rentWealth: renterInvestments, difference: buyWealth - renterInvestments,
      ownerAnnual, renterAnnual,
      ownerCashOutflow: ownerAnnual + (year === 1 ? upfront : 0),
      renterCashOutflow: renterAnnual + (year === 1 ? renterUpfront : 0),
      ownerExpenses, renterExpenses, rentPaid, movingPaid: repeatMove + (year === 1 ? renterUpfront : 0),
      mortgagePaid, mortgageRate, monthlyMortgagePayment, annualInterest, annualPrincipal, interestPaid, principalPaid });
  }
  const final = points[points.length - 1];
  const firstBuyingLead = points.find(p => p.difference >= 0)?.year ?? null;
  return { points, final, upfront, renterUpfront, startingCash, loan, payment, firstBuyingLead,
    ownerInitialInvestments: startingCash - upfront, renterInitialInvestments: startingCash - renterUpfront };
}

export type HousingThreshold = { value: number | null; status: "crossing" | "buy-throughout" | "rent-throughout" | "no-loan" };

// Holding everything else fixed, wealth advantage is increasing in rent and
// decreasing in the starting mortgage rate (future entered rates stay fixed). Solve the final-year equality, not monthly cost.
export function housingBreakEvens(x: HousingInputs): { rent: HousingThreshold; rate: HousingThreshold } {
  function solve(key: "rent" | "mortgageRate", max: number, increasing: boolean): HousingThreshold {
    const at = (v: number) => modelHousing({ ...x, [key]: v }).final.difference;
    const lowDifference = at(0); const highDifference = at(max);
    if (lowDifference >= 0 && highDifference >= 0) return { value: null, status: "buy-throughout" };
    if (lowDifference < 0 && highDifference < 0) return { value: null, status: "rent-throughout" };
    let low = 0; let high = max;
    for (let i = 0; i < 48; i++) {
      const mid = (low + high) / 2;
      if ((at(mid) >= 0) === increasing) high = mid; else low = mid;
    }
    return { value: (low + high) / 2, status: "crossing" };
  }
  return { rent: solve("rent", 100000, true), rate: x.downPayment === x.price ? { value: null, status: "no-loan" } : solve("mortgageRate", 25, false) };
}
