export type Assumptions = Record<string, number>;
export type Projection = { year: number; values: number[]; debts?: number[]; investments?: number[]; interest?: number[] };
export type Analysis = { labels: string[]; points: Projection[]; payoff?: (number | null)[]; interest?: number[]; notes: string[]; energy?: number[]; maintenance?: number[]; reserves?: number[] };
export function validateExpansion(x: Assumptions, kind: string): string | null {
  if (Object.values(x).some(v => !Number.isFinite(v))) return "Complete all numeric assumptions.";
  if (!Number.isInteger(x.years) || x.years < 1 || x.years > 40) return "Choose a whole duration from 1 to 40 years.";
  if (Object.entries(x).some(([k,v]) => k !== "return" && (v < 0 || v > 100000000))) return "Amounts must be between zero and 100 million.";
  if (kind === "vehicle") { if (x.evRange <= 0 || x.evBattery <= 0) return "EV range and usable battery capacity must be above zero."; if (x.chargingEfficiency <= 0 || x.chargingEfficiency > 100) return "Charging efficiency must be above 0% and at most 100%."; if (x.hybridReserveYears <= 0 || x.evReserveYears <= 0) return "Battery reserve funding periods must be above zero."; if (x.homeShare > 100) return "Home charging share must be between 0% and 100%."; return null; }
  if (x.rate > 100 || x.return < -20 || x.return > 30) return "Use a debt rate from 0–100% and investment return from −20–30%.";
  if (x.balance <= 0) return "Debt balance must be above zero.";
  if (x.extraMode !== undefined && x.extraMode !== 0 && x.extraMode !== 1) return "Choose a valid extra-payment schedule.";
  if (x.extraMode === 1 && (!Number.isInteger(x.extraMonth) || x.extraMonth < 1 || x.extraMonth > 12 || x.extraEmis < 0 || x.extraEmis > 12)) return "Use a payment month from 1 to 12 and extra EMIs from 0 to 12.";
  if (x.payment <= x.balance * x.rate / 1200) return "The regular monthly payment must exceed the first month's interest.";
  return null;
}
export function modelDebt(x: Assumptions): Analysis {
  const error = validateExpansion(x,"debt"); if (error) throw new Error(error);
  const r = x.rate/1200;
  const payment = x.payment;
  const annual = x.extraMode === 1;
  const growth = (1+x.return/100)**(1/12);
  const debts = [x.balance,x.balance];
  const investments = [0,0];
  const interest = [0,0], payoff: (number|null)[] = [debts[0] === 0 ? 0 : null,null];
  const points: Projection[] = [];
  for (let month=1;month<=x.years*12;month++) {
    const extra = annual ? ((month-1)%12+1 === x.extraMonth ? payment*x.extraEmis : 0) : x.extra;
    const budget = payment + extra;
    for (let i=0;i<2;i++) {
      const charge = debts[i] > 0.000001 ? debts[i]*r : 0;
      const intended = i === 0 ? budget : payment;
      const paid = debts[i] > 0.000001 ? Math.min(intended,debts[i]+charge) : 0;
      debts[i] = Math.max(0,debts[i]+charge-paid);
      interest[i] += charge;
      investments[i] = investments[i]*growth+budget-paid;
      if (debts[i] < 0.000001) { debts[i]=0; if (payoff[i] === null) payoff[i]=month; }
    }
    if (month%12 === 0) points.push({year:month/12,values:debts.map((d,i)=>investments[i]-d),debts:[...debts],investments:[...investments],interest:[...interest]});
  }
  return { labels:[annual ? "Extra EMI to debt" : "Pay debt faster","Invest instead"],points,payoff,interest,
    notes:[annual ? `Both paths budget ${payment.toFixed(2)} each month plus ${x.extraEmis} extra EMI(s), totaling ${(payment*x.extraEmis).toFixed(2)}, in month ${x.extraMonth} of each comparison year. Month 1 is the first month of the projection, not a calendar month. The invest path invests the same extra amount at the same time.` : `Both paths use the same monthly budget of ${(payment+x.extra).toFixed(2)}.`,"Extra payments reduce principal after that month's interest and regular EMI. Any amount beyond the final debt payment is invested. After payoff, both paths continue investing the scheduled budget, including annual extra amounts. Interest compounds monthly.","Investments compound monthly at your effective after-fee, after-tax annual return, before month-end contributions. Net worth here is investments minus remaining debt; common assets are excluded.","Rates stay constant. Returns are assumptions, not guarantees. Debt interest is assumed non-deductible. Prepayment penalties, emergency funds, market volatility, taxes beyond the entered net return and changes in payment requirements are outside this model. Interest savings shown cover only the selected comparison period."] };
}
// Historical US scheduled-maintenance benchmark (Argonne ANL/ESD-21/4, 2021).
// The editable multiplier is a planning conversion, not a live exchange rate or inflation index.
export function vehicleMaintenancePresets(km: number, usdMultiplier: number) {
  const annual = (perMile: number) => Math.round(km / 1.609344 * perMile * usdMultiplier * 100) / 100;
  return { gasMaintenance: annual(0.101),
    hybridMaintenance: annual(0.094),
    evMaintenance: annual(0.061) };
}
export function modelVehicles(x: Assumptions): Analysis {
  const error=validateExpansion(x,"vehicle"); if(error) throw new Error(error);
  const labels=["Gas","Hybrid","Electric"], keys=["gas","hybrid","ev"];
  const electricity=x.homeShare/100*x.homeElectricity+(1-x.homeShare/100)*x.publicElectricity;
  const energy=[x.km/100*x.gasEfficiency*x.fuel,x.km/100*x.hybridEfficiency*x.fuel,x.km/x.evRange*x.evBattery/(x.chargingEfficiency/100)*electricity];
  const reserves=[0,x.hybridBatteryCost/x.hybridReserveYears,x.evBatteryCost/x.evReserveYears];
  const maintenance=keys.map((key,i)=>x[`${key}Maintenance`]+reserves[i]);
  const points:Projection[]=[];
  for(let year=1;year<=x.years;year++) {
    const values=keys.map((key,i)=> {
      const upfront=x[`${key}Price`]-x[`${key}Rebate`]+(key === "ev" ? x.charger : 0);
      const illustratedValue=x[`${key}Price`]+(x[`${key}Resale`]-x[`${key}Price`])*year/x.years;
      return upfront+(energy[i]+maintenance[i]+x[`${key}Insurance`])*year-illustratedValue;
    });
    points.push({year,values});
  }
  return {labels,points,energy,maintenance,reserves,notes:["Total planning cost = tax-inclusive cash purchase price minus confirmed rebates + charging setup + energy + scheduled maintenance + battery reserve + insurance − net resale proceeds.","Hybrid means a conventional, non-plug-in hybrid. Electricity per kilometre = usable battery kWh / range per full charge / charging efficiency. Enter usable capacity (not gross advertised capacity); range and capacity must describe the same car and conditions. Charging efficiency adds wall-to-battery losses once. Home/public charging shares produce a weighted electricity price.","All cars cover the same annual kilometres, with no mileage cap. Intermediate resale values follow an illustrative straight line to your end-of-duration estimate; they are not market forecasts.","This is a cash-purchase cost comparison. Financing, invested savings, inflation, unscheduled repairs beyond entered maintenance, emissions and charging convenience are excluded. Energy prices and annual costs stay constant. Enter confirmed incentives only. Battery reserve = replacement cost / funding years, added each year as a conservative planning allowance, not an actual repair charge or failure probability. Set battery cost to zero to exclude it. Warranty-covered replacements should not be budgeted as out-of-pocket costs. Routine maintenance must exclude these separately entered high-voltage battery reserves. Historical maintenance presets are US benchmarks, not current local quotes; amounts stay fixed until edited or reloaded."]};
}
