export interface SmithInputs {
  mortgage: number;
  homeValue: number;
  homeGrowth: number;
  annualReappraisal: boolean;
  lenderHelocLimit: number | null;
  mortgageRate: number;
  amortization: number;
  semiannual: boolean;
  helocRate: number;
  capitalizeInterest: boolean;
  yield: number;
  growth: number;
  incomeTax: number;
  marginalTax: number;
  annualTaxSavingLimit: number;
  gainsTax: number;
  inclusion: number;
  prepayShare: number;
  annualPrepaymentLimit: number;
  refundMonth: number;
  headlineYear: number;
}

export const DEFAULT_SMITH: SmithInputs = {
  mortgage: 500000, homeValue: 800000, homeGrowth: 0, annualReappraisal: false, lenderHelocLimit: null,
  mortgageRate: 4.5, amortization: 25, semiannual: true, helocRate: 7,
  capitalizeInterest: false, yield: 2, growth: 4.4, incomeTax: 25, marginalTax: 25,
  annualTaxSavingLimit: 5000, gainsTax: 25, inclusion: 50,
  prepayShare: 100, annualPrepaymentLimit: 50000, refundMonth: 4, headlineYear: 15,
};

const READVANCE_LTV = 0.65;
const COMBINED_LTV = 0.8;

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
  grossIncome: number;
  incomeTaxPaid: number;
  afterTaxIncome: number;
  cumulativeIncomeTax: number;
  cumulativeHelocInterest: number;
  refund: number;
  extraCash: number;
  cumulativeExtraCash: number;
  mortgageInterestPaid: number;
  baselineInterestPaid: number;
  refundsReceived: number;
  smithPosition: number;
  baselinePosition: number;
  advantage: number;
  homeValue: number;
  appraisedValue: number;
  lendingValue: number;
  helocLimit: number;
  readvanceableLimit: number;
  combinedDebtLimit: number;
  availableCredit: number;
  mortgagePrincipalRepaid: number;
  blockedInvestment: number;
  helocInterestBorrowed: number;
  blockedInterest: number;
  helocInterestCash: number;
  eligibleInterest: number;
  cashGapVsBaseline: number;
}

export function validateSmith(x: SmithInputs): string | null {
  for (const key of Object.keys(DEFAULT_SMITH) as (keyof SmithInputs)[]) {
    if (key === "lenderHelocLimit" && x[key] === null) continue;
    const value = x[key];
    if (typeof DEFAULT_SMITH[key] === "boolean" ? typeof value !== "boolean" : typeof value !== "number" || !Number.isFinite(value)) {
      return "Complete every required assumption.";
    }
  }
  if (!(x.homeValue > 0) || x.homeValue > 1e9 || x.mortgage < 0 || x.mortgage > x.homeValue) return "Enter a positive home value (up to 1 billion) and a mortgage between zero and the home value.";
  if (!Number.isInteger(x.amortization) || x.amortization < 1 || x.amortization > 30) return "Amortization must be a whole number from 1 to 30 years.";
  if (!Number.isInteger(x.headlineYear) || x.headlineYear < 1 || x.headlineYear > 30) return "Choose a result year from 1 to 30.";
  if (!Number.isInteger(x.refundMonth) || x.refundMonth < 1 || x.refundMonth > 12) return "Refund month must be from 1 to 12.";
  for (const key of ["mortgageRate", "helocRate", "yield", "incomeTax", "marginalTax", "gainsTax", "inclusion", "prepayShare"] as const) {
    if (x[key] < 0 || x[key] > 100) return "Rates, tax assumptions and shares must be between 0% and 100%.";
  }
  if (x.growth < -99 || x.growth > 100) return "Annual portfolio price growth must be between −99% and 100%.";
  if (x.homeGrowth < -99 || x.homeGrowth > 100) return "Annual home price change must be between −99% and 100%.";
  for (const limit of [x.lenderHelocLimit ?? 0, x.annualTaxSavingLimit, x.annualPrepaymentLimit]) {
    if (limit < 0 || limit > 1e9) return "Dollar limits must be between zero and 1 billion.";
  }
  return null;
}

/** Effective annual total return with both components reinvested before tax. */
export function smithTotalReturn(x: Pick<SmithInputs, "growth" | "yield">): number {
  return 100 * Math.expm1(12 * Math.log1p((x.growth + x.yield) / 1200));
}

export function smithPriceGrowth(totalReturn: number, incomeYield: number): number {
  return 1200 * Math.expm1(Math.log1p(totalReturn / 100) / 12) - incomeYield;
}

/** Opening balances accrue returns and interest. Mortgage payments precede month-end draws. */
export function modelSmith(x: SmithInputs) {
  const error = validateSmith(x);
  if (error) throw new Error(error);
  const mr = x.semiannual ? Math.expm1(Math.log1p(x.mortgageRate / 200) / 6) : x.mortgageRate / 1200;
  const logMonthlyRate = Math.log1p(mr);
  const term = x.amortization * 12;
  const payment = mr === 0 ? x.mortgage / term : x.mortgage * (mr / -Math.expm1(-term * logMonthlyRate));
  let mortgage = x.mortgage, baselineMortgage = x.mortgage, heloc = 0, portfolio = 0, costBasis = 0;
  let mortgageReduction = 0;
  let paid = 0, baselinePaid = 0, cumulativeExtraCash = 0, mortgageInterestPaid = 0, baselineInterestPaid = 0;
  let yearEligibleInterest = 0, priorYearTaxSaving = 0, yearPrepayments = 0, refundsReceived = 0;
  let appraisedValue = x.homeValue, peakHeloc = 0, peakCombinedDebt = x.mortgage, peakCashGap = 0;
  let firstLimitedMonth: number | null = null;
  let cumulativeIncomeTax = 0, cumulativeHelocInterest = 0;
  let smithPayoff: number | null = x.mortgage === 0 ? 0 : null;
  const baselinePayoff = x.mortgage === 0 ? 0 : term;
  const months: SmithMonth[] = [];
  for (let month = 1; month <= 360; month++) {
    const taxMonth = (month - 1) % 12 + 1;
    if (taxMonth === 1) {
      priorYearTaxSaving = Math.min(yearEligibleInterest * x.marginalTax / 100, x.annualTaxSavingLimit);
      yearEligibleInterest = 0;
      yearPrepayments = 0;
    }
    const refund = taxMonth === x.refundMonth ? priorYearTaxSaving : 0;
    const grossIncome = portfolio * x.yield / 1200;
    const afterTaxIncome = grossIncome * (1 - x.incomeTax / 100);
    const incomeTaxPaid = grossIncome - afterTaxIncome;

    // Compute the scheduled balance directly so subtraction of nearly equal interest and
    // payment cannot accumulate into a balloon payment on a long, high-rate mortgage.
    const remaining = Math.max(0, term - month);
    const baselineInterest = baselineMortgage * mr;
    const baselinePrincipal = month <= term ? payment * Math.exp(-(remaining + 1) * logMonthlyRate) : 0;
    const baselinePayment = baselineInterest + baselinePrincipal;
    baselineMortgage = payment * (mr === 0 ? remaining : -Math.expm1(-remaining * logMonthlyRate) / mr);
    const interest = mortgage * mr;
    const principal = Math.min(mortgage, baselinePrincipal + mortgageReduction * mr);
    const scheduled = interest + principal;
    // Earlier prepayments lower this month's interest by mr times the opening balance difference.
    const scheduledReduction = Math.min(baselineMortgage, mortgageReduction * (1 + mr));
    const afterScheduled = baselineMortgage - scheduledReduction;
    const prepayment = Math.min(afterScheduled, Math.max(0, x.annualPrepaymentLimit - yearPrepayments),
      afterTaxIncome * x.prepayShare / 100 + refund);
    const mortgagePrincipalRepaid = principal + prepayment;
    mortgageReduction = scheduledReduction + prepayment;
    mortgage = afterScheduled - prepayment;
    yearPrepayments += prepayment;
    if (mortgage === 0) smithPayoff ??= month;

    const homeValue = x.homeValue * (1 + x.homeGrowth / 100) ** (month / 12);
    if (x.annualReappraisal && taxMonth === 12) appraisedValue = homeValue;
    const lendingValue = Math.min(homeValue, appraisedValue);
    const readvanceableLimit = lendingValue * READVANCE_LTV;
    const combinedDebtLimit = lendingValue * COMBINED_LTV;
    const helocLimit = Math.min(readvanceableLimit, x.lenderHelocLimit ?? readvanceableLimit);
    const capacity = Math.max(0, Math.min(helocLimit, readvanceableLimit - mortgage, combinedDebtLimit - mortgage) - heloc);

    const helocInterest = heloc * x.helocRate / 1200;
    const interestDrawRequested = x.capitalizeInterest ? helocInterest : 0;
    const helocInterestBorrowed = Math.min(interestDrawRequested, capacity);
    const helocInterestCash = helocInterest - helocInterestBorrowed;
    // Cash interest is allocated proportionally to the opening investment and interest-funded debt.
    const eligibleInterest = heloc > 0 ? helocInterestCash * (costBasis / heloc) : 0;
    const reborrowed = Math.min(mortgagePrincipalRepaid, capacity - helocInterestBorrowed);
    const blockedInvestment = mortgagePrincipalRepaid - reborrowed;
    const blockedInterest = interestDrawRequested - helocInterestBorrowed;
    if (blockedInvestment + blockedInterest >= 0.005) firstLimitedMonth ??= month;
    heloc += reborrowed + helocInterestBorrowed;
    portfolio = portfolio * (1 + x.growth / 1200) + reborrowed;
    costBasis += reborrowed;
    yearEligibleInterest += eligibleInterest;
    cumulativeHelocInterest += helocInterest;
    cumulativeIncomeTax += incomeTaxPaid;
    refundsReceived += refund;
    // Negative extra cash represents retained income/refunds, without further investment returns.
    const extraCash = prepayment + helocInterestCash - afterTaxIncome - refund;
    cumulativeExtraCash += extraCash;
    paid += scheduled;
    mortgageInterestPaid += interest;
    baselinePaid += baselinePayment;
    baselineInterestPaid += baselineInterest;
    const exitTax = Math.max(0, portfolio - costBasis) * x.inclusion / 100 * x.gainsTax / 100;
    const smithPosition = portfolio - exitTax - heloc - mortgage - cumulativeExtraCash - paid;
    const baselinePosition = -baselineMortgage - baselinePaid;
    peakHeloc = Math.max(peakHeloc, heloc);
    peakCombinedDebt = Math.max(peakCombinedDebt, heloc + mortgage);
    const cashGapVsBaseline = scheduled + extraCash - baselinePayment;
    peakCashGap = Math.max(peakCashGap, cashGapVsBaseline);
    months.push({ month, mortgage, baselineMortgage, heloc, portfolio, costBasis, exitTax,
      payment: scheduled, baselinePayment, prepayment, reborrowed, helocInterest, grossIncome, incomeTaxPaid, afterTaxIncome,
      cumulativeIncomeTax, cumulativeHelocInterest,
      refund, extraCash, cumulativeExtraCash, mortgageInterestPaid, baselineInterestPaid,
      refundsReceived, smithPosition, baselinePosition, advantage: smithPosition - baselinePosition,
      homeValue, appraisedValue, lendingValue, helocLimit, readvanceableLimit, combinedDebtLimit,
      availableCredit: capacity - helocInterestBorrowed - reborrowed, mortgagePrincipalRepaid, blockedInvestment,
      helocInterestBorrowed, blockedInterest, helocInterestCash, eligibleInterest, cashGapVsBaseline });
  }
  return { payment, months, years: months.filter(p => p.month % 12 === 0),
    headline: months[x.headlineYear * 12 - 1], smithPayoff, baselinePayoff, peakHeloc, peakCombinedDebt,
    firstLimitedMonth, peakCashGap };
}

export function smithCsv(x: SmithInputs, r = modelSmith(x)): string {
  const keys = Object.keys(r.months[0]) as (keyof SmithMonth)[];
  return ["Smith Manoeuvre · illustrative model,CAD", "Model version,2", "Assumption,Value",
    ...Object.entries(x).map(([k,v]) => `${k},${v ?? ""}`),
    `Effective annual total return before personal tax,${smithTotalReturn(x)}%`,
    "Method,360 months; opening-balance returns; month-end advances; prior-year interest refund",
    "Income tax,Monthly gross cash distributions times incomeTax; net distributions available for prepayment or retained cash",
    "Interest tax saving,Prior-year eligibleInterest times marginalTax up to annualTaxSavingLimit; eligibility is limited to cash-paid interest attributable to investment advances",
    "Capital gains tax,Hypothetical sale at each reporting date. Exit tax equals positive portfolio gain over invested principal times inclusion times gainsTax.",
    "Collateral,Lending value is the lower of projected market value and the last assumed appraisal. Appraisal resets at year-end only if annualReappraisal is enabled.",
    "Lending limits,New draws observe 65% revolving and combined readvance limits and an 80% combined ceiling plus any fixed lender HELOC limit.",
    "Draw order,After the mortgage payment and permitted prepayment the model funds optional interest advances first. Remaining room funds investment advances up to repaid mortgage principal.",
    "Cash flow,Unfunded interest is paid from cash. Existing debt remains outstanding if collateral falls. Prepayments have an annual dollar limit.",
    "Limitations,Constant rates and returns. Cash and freed payments earn zero. Excludes lender fees and penalties and tax credits for losses.",
    "Position,Portfolio less exit tax and all debt and cumulative external cash and scheduled payments. Common home value is excluded.",
    "", keys.join(","), ...r.months.map(p => keys.map(k => p[k]).join(","))].join("\n");
}
