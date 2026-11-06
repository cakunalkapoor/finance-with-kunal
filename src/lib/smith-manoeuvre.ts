export interface SmithInputs {
  mortgage: number;
  homeValue: number;
  mortgageRate: number;
  amortization: number;
  semiannual: boolean;
  helocRate: number;
  capitalizeInterest: boolean;
  yield: number;
  growth: number;
  incomeTax: number;
  marginalTax: number;
  gainsTax: number;
  inclusion: number;
  prepayShare: number;
  refundMonth: number;
  headlineYear: number;
}

export const DEFAULT_SMITH: SmithInputs = {
  mortgage: 500000, homeValue: 800000, mortgageRate: 4.5, amortization: 25,
  semiannual: true, helocRate: 5, capitalizeInterest: false, yield: 3,
  growth: 5, incomeTax: 20, marginalTax: 33, gainsTax: 33, inclusion: 50,
  prepayShare: 100, refundMonth: 4, headlineYear: 20,
};

export interface SmithMonth {
  month: number;
  mortgage: number;
  baselineMortgage: number;
  heloc: number;
  portfolio: number;
  costBasis: number;
  exitTax: number;
  payment: number;
  baselinePayment: number;
  prepayment: number;
  reborrowed: number;
  helocInterest: number;
  afterTaxIncome: number;
  refund: number;
  extraCash: number;
  cumulativeExtraCash: number;
  mortgageInterestPaid: number;
  baselineInterestPaid: number;
  refundsReceived: number;
  smithPosition: number;
  baselinePosition: number;
  advantage: number;
}

export function validateSmith(x: SmithInputs): string | null {
  if (Object.values(x).some(v => typeof v === "number" && !Number.isFinite(v))) return "Complete every numeric assumption.";
  if (!(x.homeValue > 0) || x.homeValue > 1e9 || x.mortgage < 0 || x.mortgage > x.homeValue) return "Enter a positive home value (up to 1 billion) and a mortgage between zero and the home value.";
  if (!Number.isInteger(x.amortization) || x.amortization < 1 || x.amortization > 30) return "Amortization must be a whole number from 1 to 30 years.";
  if (!Number.isInteger(x.headlineYear) || x.headlineYear < 1 || x.headlineYear > 30) return "Choose a result year from 1 to 30.";
  if (!Number.isInteger(x.refundMonth) || x.refundMonth < 1 || x.refundMonth > 12) return "Refund month must be from 1 to 12.";
  for (const key of ["mortgageRate", "helocRate", "yield", "incomeTax", "marginalTax", "gainsTax", "inclusion", "prepayShare"] as const) {
    if (x[key] < 0 || x[key] > 100) return "Rates, tax assumptions and shares must be between 0% and 100%.";
  }
  if (x.growth < -99 || x.growth > 100) return "Annual portfolio price growth must be between −99% and 100%.";
  return null;
}

/** The supplied model uses nominal monthly yield/growth and a fixed 360-month run. */
export function modelSmith(x: SmithInputs) {
  const error = validateSmith(x);
  if (error) throw new Error(error);
  const mr = x.semiannual ? (1 + x.mortgageRate / 200) ** (1 / 6) - 1 : x.mortgageRate / 1200;
  const payment = mr === 0 ? x.mortgage / (x.amortization * 12) : x.mortgage * mr / (1 - (1 + mr) ** (-x.amortization * 12));
  let mortgage = x.mortgage, baselineMortgage = x.mortgage, heloc = 0, portfolio = 0, costBasis = 0;
  let paid = 0, baselinePaid = 0, cumulativeExtraCash = 0, mortgageInterestPaid = 0, baselineInterestPaid = 0;
  let yearInterest = 0, priorYearInterest = 0, refundsReceived = 0, peakHeloc = 0, peakCombinedDebt = x.mortgage;
  let smithPayoff: number | null = x.mortgage === 0 ? 0 : null;
  let baselinePayoff: number | null = x.mortgage === 0 ? 0 : null;
  const months: SmithMonth[] = [];
  for (let month = 1; month <= 360; month++) {
    if ((month - 1) % 12 === 0) { priorYearInterest = yearInterest; yearInterest = 0; }
    const refund = (month - 1) % 12 + 1 === x.refundMonth ? priorYearInterest * x.marginalTax / 100 : 0;
    const afterTaxIncome = portfolio * x.yield / 1200 * (1 - x.incomeTax / 100);
    const interest = mortgage * mr;
    const scheduled = Math.min(payment, mortgage + interest);
    const prepayment = Math.max(0, Math.min(mortgage + interest - scheduled, afterTaxIncome * x.prepayShare / 100 + refund));
    const reborrowed = Math.max(0, scheduled - interest + prepayment);
    // Interest and investment returns use opening balances; advances invest at month-end.
    const helocInterest = heloc * x.helocRate / 1200;
    mortgage = Math.max(0, mortgage + interest - scheduled - prepayment);
    if (mortgage < 1e-7) { mortgage = 0; smithPayoff ??= month; }
    heloc += reborrowed + (x.capitalizeInterest ? helocInterest : 0);
    portfolio = portfolio * (1 + x.growth / 1200) + reborrowed;
    costBasis += reborrowed;
    yearInterest += helocInterest;
    refundsReceived += refund;
    // Negative extra cash represents retained income/refunds, without further investment returns.
    const extraCash = prepayment + (x.capitalizeInterest ? 0 : helocInterest) - afterTaxIncome - refund;
    cumulativeExtraCash += extraCash;
    paid += scheduled;
    mortgageInterestPaid += interest;
    const baselineInterest = baselineMortgage * mr;
    const baselinePayment = Math.min(payment, baselineMortgage + baselineInterest);
    baselineMortgage = Math.max(0, baselineMortgage + baselineInterest - baselinePayment);
    if (baselineMortgage < 1e-7) { baselineMortgage = 0; baselinePayoff ??= month; }
    baselinePaid += baselinePayment;
    baselineInterestPaid += baselineInterest;
    const exitTax = Math.max(0, portfolio - costBasis) * x.inclusion / 100 * x.gainsTax / 100;
    const smithPosition = portfolio - exitTax - heloc - mortgage - cumulativeExtraCash - paid;
    const baselinePosition = -baselineMortgage - baselinePaid;
    peakHeloc = Math.max(peakHeloc, heloc);
    peakCombinedDebt = Math.max(peakCombinedDebt, heloc + mortgage);
    months.push({ month, mortgage, baselineMortgage, heloc, portfolio, costBasis, exitTax,
      payment: scheduled, baselinePayment, prepayment, reborrowed, helocInterest, afterTaxIncome,
      refund, extraCash, cumulativeExtraCash, mortgageInterestPaid, baselineInterestPaid,
      refundsReceived, smithPosition, baselinePosition, advantage: smithPosition - baselinePosition });
  }
  return { payment, months, years: months.filter(p => p.month % 12 === 0),
    headline: months[x.headlineYear * 12 - 1], smithPayoff, baselinePayoff, peakHeloc, peakCombinedDebt };
}

export function smithCsv(x: SmithInputs): string {
  const r = modelSmith(x);
  const keys = Object.keys(r.months[0]) as (keyof SmithMonth)[];
  return ["Smith Manoeuvre · illustrative model,CAD", "Assumption,Value", ...Object.entries(x).map(([k,v]) => `${k},${v}`),
    "Method,360 months; opening-balance returns; month-end advances; prior-year interest refund",
    "Limitations,Constant rates and returns; full interest deductibility assumed; lending caps flagged but not enforced; no return on retained cash or freed payments; no loss tax credit",
    "Tax caveat,Capitalized interest deduction is a simplifying assumption; compound interest may require payment; verify eligibility with a tax adviser",
    "Position,Portfolio less exit tax and all debt and cumulative external cash and scheduled payments; common home value excluded",
    "", keys.join(","), ...r.months.map(p => keys.map(k => p[k]).join(","))].join("\n");
}
