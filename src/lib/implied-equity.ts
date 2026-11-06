export interface EquityInputs {
  price: number;
  eps: number;
  dps: number;
  growth: number;
  years: number;
  terminalGrowth: number;
  linkGrowth: boolean;
  terminalRoe: number;
  linkRoe: boolean;
  riskFree: number;
  beta: number | null;
}

// Reference assumptions from the supplied brief, not verified security data.
export const DEFAULT_EQUITY: EquityInputs = {
  price: 760, eps: 49.5, dps: 13, growth: 12, years: 5,
  terminalGrowth: 7.12, linkGrowth: true, terminalRoe: 13.5,
  linkRoe: true, riskFree: 7.12, beta: null,
};

export const terminalGrowth = (x: EquityInputs) => (x.linkGrowth ? x.riskFree : x.terminalGrowth) / 100;

export function validateEquity(x: EquityInputs): string | null {
  if (Object.entries(x).some(([k,v]) => k !== "beta" && !(k === "terminalRoe" && x.linkRoe) && !(k === "terminalGrowth" && x.linkGrowth) && typeof v === "number" && !Number.isFinite(v))) return "Complete every numeric assumption.";
  if (!(x.price > 0) || !(x.eps > 0) || x.price > 1e9 || x.eps > 1e9) return "Share price and EPS must be positive and no greater than 1 billion. This model does not support loss-making companies.";
  if (x.dps < 0 || x.dps > x.eps) return "Use annual dividends between zero and EPS, so the explicit payout ratio stays between 0% and 100%.";
  if (!Number.isInteger(x.years) || x.years < 1 || x.years > 20) return "The explicit forecast must cover 1 to 20 whole years.";
  if (x.growth < -99 || x.growth > 100 || (!x.linkGrowth && (x.terminalGrowth < -99 || x.terminalGrowth > 100))) return "Growth assumptions must be between −99% and 100%.";
  if (x.riskFree < 0 || x.riskFree > 100) return "Use a risk-free rate between 0% and 100%.";
  if (!x.linkRoe && (!(x.terminalRoe > 0) || x.terminalRoe > 150 || terminalGrowth(x) > x.terminalRoe / 100)) return "Terminal ROE must be positive, at most 150%, and at least perpetual growth to avoid a negative terminal payout.";
  if (x.beta !== null && (!Number.isFinite(x.beta) || x.beta <= 0 || x.beta > 10)) return "Leave beta blank, or enter a positive beta up to 10.";
  return null;
}

/** Rates are decimal fractions here; UI assumptions are percentages. */
export function equityValue(x: EquityInputs, rate: number) {
  const g = terminalGrowth(x);
  if (!(rate > Math.max(g, 0))) throw new Error("The discount rate must exceed zero and perpetual growth.");
  let eps = x.eps, explicitValue = 0;
  const payout = x.dps / x.eps;
  const cashflows = [];
  for (let year = 1; year <= x.years; year++) {
    eps *= 1 + x.growth / 100;
    const dividend = eps * payout;
    const presentValue = dividend / (1 + rate) ** year;
    explicitValue += presentValue;
    cashflows.push({ year, eps, dividend, presentValue });
  }
  const terminalPayout = 1 - g / (x.linkRoe ? rate : x.terminalRoe / 100);
  const nextEps = eps * (1 + g);
  // Algebraic cancellation avoids numerical instability when ROE equals r.
  const terminalValue = x.linkRoe ? nextEps / rate : nextEps * terminalPayout / (rate - g);
  const terminalPresentValue = terminalValue / (1 + rate) ** x.years;
  return { total: explicitValue + terminalPresentValue, explicitValue, terminalPresentValue, terminalValue, terminalPayout, cashflows };
}

export function solveEquity(x: EquityInputs): number | null {
  if (validateEquity(x)) return null;
  let lo = Math.max(terminalGrowth(x) + 0.000001, 0.0001), hi = 1.5;
  if (lo >= hi || equityValue(x, lo).total < x.price || equityValue(x, hi).total > x.price) return null;
  for (let i = 0; i < 160; i++) {
    const mid = (lo + hi) / 2;
    if (equityValue(x, mid).total > x.price) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

export function equitySensitivity(x: EquityInputs) {
  const growthRates = [-4, -2, 0, 2, 4].map(d => x.growth + d);
  const terminalRates = [-2, -1, 0, 1, 2].map(d => terminalGrowth(x) * 100 + d);
  return { growthRates, terminalRates, rates: growthRates.map(growth => terminalRates.map(g => solveEquity({ ...x, growth, terminalGrowth: g, linkGrowth: false }))) };
}

export function equityCsv(x: EquityInputs, currency: string): string {
  const rate = solveEquity(x);
  const lines = ["Implied cost of equity · illustrative model", `Currency,${currency}`, "Assumption,Value",
    ...Object.entries(x).map(([k,v]) => `${k},${v ?? ""}`), `Effective perpetual growth (%),${terminalGrowth(x) * 100}`,
    "Method,Constant explicit payout; constant EPS growth; terminal reinvestment; bisection up to 150%",
    "Limitations,User assumptions are not verified market data or forecasts; no capital retention model; terminal value can dominate; implied return is conditional",
    `Implied annual rate,${rate ?? "No solution in search range"}`];
  if (rate !== null) {
    const v = equityValue(x, rate);
    lines.push(`Equity premium,${rate - x.riskFree / 100}`, `PV explicit dividends,${v.explicitValue}`, `PV terminal value,${v.terminalPresentValue}`,
      "", "Year,EPS,Dividend,Present value of dividend", ...v.cashflows.map(p => [p.year,p.eps,p.dividend,p.presentValue].join(",")));
  }
  const s = equitySensitivity(x);
  lines.push("", "Implied annual rate sensitivity (decimal); blanks mean no valid solution", ["EPS growth (%) / terminal growth (%)",...s.terminalRates].join(","),
    ...s.rates.map((row,i) => [s.growthRates[i],...row.map(r => r ?? "")].join(",")));
  return lines.join("\n");
}
