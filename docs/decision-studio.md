# Decision Studio

Route: `/decisions/`. User approved publication to `kunalkapoor.fyi` on October 7, 2026. Navigation, page metadata and sitemap use Decision Studio as the public page name.

## Simple buy-versus-rent calculator

`/decisions/buy-vs-rent/` now answers three plain-language questions: monthly bills, cash needed upfront, and wealth after investing the difference. The public page uses `SimpleHousingInputs` and `modelSimpleHousing` from `housing-model.ts`; the full engine remains available for existing model checks. A visible annual rent increase controls rent inflation; the public page has no rate-path editor, break-even searches, property-type switches, inclusion toggles, repeated moves or inflation of other expenses.

The six basic inputs are home price, comparable monthly rent, down payment, constant mortgage rate, full mortgage amortization (1–40 years), and comparison duration (1–100 years). All 40 currency labels remain available, without conversion. Canadian semiannual or monthly nominal mortgage compounding is selected in an optional disclosure.

Annual rent increase appears directly below those basic inputs and defaults/resets to 0%. Rent compounds once per anniversary: year 1 uses entered monthly rent, year 2 multiplies by `1 + rentInflation/100`, and year 3 multiplies again. A visible summary previews rent in the selected final year. The monthly bills card is labelled year 1. Total rental costs sum each year's actual rent, and both paths' monthly investment savings reflect every rent increase. Insurance and other bills remain flat. The annual table and CSV include rent for each year. With 1,000 monthly rent and a 10% increase, the three annual rents are 12,000, 13,200 and 14,520.

Recurring insurance, property tax, strata/HOA fees and maintenance are entered as **monthly cash amounts**. Annual quotes must be divided by 12. Rent is monthly too. The monthly table includes the full mortgage payment, with first-year average interest and principal shown separately. Property tax and strata fees can both apply; users exclude amounts already included in another fee. Utilities are assumed equal and excluded. There is no automatic suppression of condo costs or regional preset.

Upfront cash for buying = down payment + closing fees + moving; renting = initial moving costs. Only one move at the start is included. Closing fees cover legal, inspection, transfer-tax and other cash-paid buying fees. Optional selling fees are paid at the comparison end. All optional cash amounts and both growth rates start at zero and reset to zero.

Costs over the selected stay are shown separately from the monthly cash budget. Renting costs = rent + insurance + initial move. Buying costs = actual amortized mortgage interest + insurance + property tax + strata/HOA fees + maintenance + closing/moving/selling fees. Down payment and principal are excluded from this expense total because they build equity. Average monthly costs divide these totals, including one-time fees, by the full comparison months.

Both paths begin with the same cash, the larger upfront requirement. After paying upfront costs, each invests unused cash. They use the same monthly budget: the cheaper path invests its actual monthly saving after existing investments compound. The mortgage payment, including principal, is used when computing these cash savings. Payments stop at payoff, and freed savings are invested thereafter. Investment return is an effective annual after-fee/after-tax assumption converted to its monthly equivalent. Home value grows at the separately entered annual rate. Renting ends with market investments; buying ends with home value minus mortgage and selling fees plus buyer investments. Negative equity is preserved. At zero market return and flat home prices, the final wealth advantage exactly equals the opposite cost difference.

The page explains renter starting capital, later contributions and market gain/loss; it also reconciles buyer home equity and investments. A single optional yearly wealth chart, annual table and CSV provide detail. CSV includes monthly input units, rent-increase assumptions and annual rent, cost totals and yearly investment contribution/gain reconciliation. Inflation of other bills, renewal changes, repeated moves, refundable deposits, financed mortgage insurance, mortgage tax deductions and home-sale taxes are excluded. Assumptions are never saved or transmitted.

Validation: `node --test tests/housing-model.test.mjs`, targeted ESLint, TypeScript and production export. Browser checks cover monthly units, principal-versus-interest explanations, upfront costs, zero and negative returns, payoff, cash purchase, invalid inputs, currency labels, disclosures, charts/export and phone-width overflow.

## Comparison landing page and car calculator

The home calculator lives at `/decisions/buy-vs-rent/`; `/decisions/buy-vs-lease/` compares buying and selling one car against leasing and returning it **over exactly one lease term**. Both pages link back to Decision Studio.

The lease term is the sole comparison horizon (1–120 whole months). There is no independent driving duration or repeated-lease control. A 24-month lease produces exactly 24 monthly model rows and lease payments, one upfront charge, and one final mileage/return fee. Changing the loan term affects the payment and remaining loan, but never the comparison end date. The obsolete `months` field is absent from the typed interface and is omitted from CSV assumptions even if present on a legacy caller object.

Purchase costs use tax-inclusive quotes and monthly amortization over the independently entered loan repayment term. Buying cost = down payment + loan payments made through lease end + running costs + remaining loan balance − net sale proceeds at lease end. Future loan payments and interest are excluded because the balance is settled from the sale. Payments stop sooner if the loan is repaid before lease end. Negative equity remains negative.

Lease cost = additional upfront fees + quoted monthly payment × lease months + running costs + prorated mileage overage + return fees. The first lease payment is part of the monthly payment count and must not be entered again as an additional upfront fee. Running costs and fees start at zero; other defaults are labelled examples. Refundable deposits, early termination, buyout, replacement contracts and business tax deductions are excluded. Annual kilometres and allowances affect only lease penalties. Users supply purchase resale and running-cost estimates reflecting actual use. Currency changes labels only.

The purchase resale input explicitly names the lease-end month. Users must revise their estimate when the lease term changes; the calculator does not invent an automatic depreciation forecast. Intermediate car values follow an illustrative straight line to that estimate and do not represent early-exit proceeds or recoverable purchase taxes.

## Car wealth analysis

Both paths start with equal cash, the larger upfront requirement, and invest unused starting funds. Each month they have the same budget: whichever path spends less invests the difference at month-end after existing investments compound at the effective monthly equivalent of the entered after-fee/after-tax annual return. Final lease mileage and return fees enter the last month's costs and savings. Buy wealth = sale proceeds − remaining loan + buyer investments. Lease wealth = invested savings after returning the car, with no car asset. At zero investment return, the wealth advantage equals lease cost minus buy cost.

Annual running-cost inflation applies at each anniversary; payments and quoted fees stay fixed. Investment return and inflation default to zero. Charts and annual periods stop at the lease expiry date, with a shorter final period when needed. Cash charts exclude investment transfers, sale proceeds and final loan settlement. CSV exports the effective comparison period, one-lease method and the same monthly rows as the model. Break-even payment and resale values use the same lease horizon. FCAC's official car financing guide informs the contract explanation.

The 24-month worked reference with existing example inputs (40,000 price, 5,000 down, 6% loan over 60 months, 26,000 resale, 500/month lease and 2,000 additional upfront) gives 676.65/month loan payments, 22,242.11 remaining loan, 17,481.66 buying cost, 14,000 lease cost and a 3,481.66 leasing advantage at zero investment return. Tests in `tests/car-model.test.mjs` cover that reference, one-time charges, early payoff, independent loan terms, investment reconciliation, thresholds and CSV stopping at month 24.

## Additional comparisons

Two financial simulations also extend the landing page to six tools:
- `/decisions/smith-manoeuvre/` runs a 360-month mortgage, HELOC and investment comparison. The selected result year is independent of the full-model payoff, interest, tax savings and peak borrowing metrics. The annual table and monthly CSV reconcile cash, debt and portfolio positions.
- `/decisions/implied-cost-of-equity/`: constant-payout reverse equity valuation with 1–20 explicit years, terminal reinvestment, linked or fixed terminal ROE, optional beta, growth sensitivity and CSV. Example inputs from the supplied brief are labelled unverified, without a current stock-data claim. Default linked ROE solves 8.87%; fixed 13.5% terminal ROE solves 10.92%. Bisection requires a valid rate above perpetual growth and zero, up to 150%; unsupported assumptions and missing brackets are explicit. Terminal growth may track the risk-free input or be entered separately. Sensitivity cells apply both growth assumptions and unlink perpetual growth. No market data, consensus forecasts, residual-income valuation or CAPM estimate is supplied. Tests: `tests/financial-simulations.test.mjs`.

Two independent routes extend the landing page to four comparisons:
- `/decisions/gas-hybrid-electric/`: cash-purchase costs for gas, conventional non-plug-in hybrid and electric cars. Same duration and distance; tax-inclusive prices, confirmed rebates, energy consumption, weighted home/public electricity prices, optional charging setup, maintenance, insurance and net resale. No financing, opportunity-cost investments or inflation. Intermediate car values are explicitly illustrative straight-line estimates.
- `/decisions/debt-vs-invest/`: fixed regular payment plus monthly surplus; apply surplus to principal or investments. Both invest freed budgets after payoff. Nominal debt rate compounds monthly; effective after-tax investment returns compound at the equivalent monthly rate. Reject non-amortizing regular payments.

All expose yearly results, methods, editable currency labels and CSV containing assumptions and model data. Optional numeric costs and investment return start at zero. Example prices and energy rates are hypothetical. Tests in `tests/expansion-models.test.mjs` cover budgets, payoff, compounding, units and charging shares.

## Vehicle insurance, maintenance presets and battery/range inputs

The public vehicle route uses `VehicleDecision`, with a single comparison table for purchase minus resale, fuel/electricity, routine maintenance, insurance, total ownership cost and its monthly average. The headline ranks ownership cost. A separate part of the same table shows optional battery savings and the combined planning budget; the page explicitly identifies a different planning-budget winner when applicable. The monthly average is after resale, not a loan payment. Insurance is visible with each car's quotes, and the table names cars whose insurance is still zero. Duration-dependent resale labels require users to update their estimates when changing the horizon.

Distance, fuel consumption, fuel/electricity prices and home/public charging mix remain visible. EV battery capacity, range and charging efficiency move into an optional disclosure; the basic quote section shows derived wall electricity use in kWh/100 km. Routine maintenance, optional battery savings, rebates/setup and historical preset conversion are editable in disclosures. Routine scheduled maintenance defaults from Argonne ANL/ESD-21/4 (2021), Figure 3.28: US$0.101/mile ICE, $0.094 conventional HEV, $0.061 BEV. For 15,000 km, convert distance by 1.609344 km/mile and use an explicitly illustrative selected-currency/USD multiplier of 1.35. No inflation adjustment or live FX claim. Reload recalculates routine amounts at current mileage/multiplier; edits remain until reset/reload. Mileage changes do not automatically overwrite entered maintenance budgets.

Hybrid/EV battery reserves are separate to avoid counting replacement in scheduled servicing. Initial replacement budgets are selected planning examples: US$3,500 hybrid (4,725 at the illustrative multiplier) and US$10,500 EV (14,175), the midpoint of Recurrent's December 2024 US$5,000–16,000 range. Fifteen-year reserve funding is an editable planning horizon, not observed life or failure probability. Annual cost = budget/funding years, included as a planning allowance; set budget to zero to exclude. This allowance is not actual cash repair spending. Warranty coverage should reduce out-of-pocket budgeting. Historical estimates are not generic fleet forecasts. Sources are linked in the method disclosure.

EV energy uses usable battery kWh, range per full charge, and wall-to-battery charging efficiency. Wall kWh/km = usable kWh / range / efficiency fraction. Gas and non-plug-in hybrids retain L/100 km. `modelVehicles().vehicleCosts` reconciles each component to ownership cost, then adds the battery allowance to planning cost. Existing model yearly points retain the planning allowance; the optional public chart/table subtract annual allowances to display ownership spending. CSV includes all assumptions, component totals, yearly ownership costs and yearly planning budgets. Charts, yearly data and export are collapsed by default. Sources and method remain available separately.

With the unchanged eight-year examples, ownership costs before insurance are 50,526.88 gas, 47,062.24 hybrid and 40,340.40 electric. Additional battery allowances are 0, 2,520 and 7,560, giving unchanged planning totals of 50,526.88, 49,582.24 and 47,900.40. Tests reconcile component totals, separate savings from spending, apply rebates/charger setup once, and preserve fixed annual cost assumptions.

## Smith Manoeuvre lending and tax assumptions

Mortgage payments and permitted prepayments reduce principal before HELOC draws. New draws
are limited by the 65% combined readvance threshold, the 80% overall ceiling and an optional
fixed lender limit. Eligible draws can resume when principal falls enough. Falling collateral
can block new credit while existing balances remain due. Projected appreciation increases the
lending value only at an assumed annual reappraisal. [OSFI combined-loan guidance](https://www.osfi-bsif.gc.ca/en/guidance/guidance-library/clarification-treatment-innovative-real-estate-secured-lending-products-under-guideline-b-20)

HELOC interest is paid in cash by default. The optional financing mode allocates available
credit to interest first and uses the rest for investment draws up to repaid mortgage principal.
The refund estimate applies the user's savings rate and annual dollar cap to prior-year
cash-paid interest attributable to investment advances. It excludes financed interest and
interest on the balance borrowed to cover interest. [CRA interest deductibility folio](https://www.canada.ca/en/revenue-agency/services/tax/technical-information/income-tax/income-tax-folios-index/series-3-property-investments-savings-plans/series-3-property-investments-savings-plan-folio-6-interest/income-tax-folio-s3-f6-c1-interest-deductibility.html)

The default assumes a 7% HELOC rate, 6.59% effective annual total return before personal tax,
25% tax rates, 50% capital-gains inclusion and a $5,000 annual tax-saving ceiling. A separate
$50,000 annual prepayment privilege is an editable contract assumption. The year-15 default
advantage is about $33,010. The scenarios show 6% and 7% returns, higher borrowing costs and
zero deduction benefit. Loan renewals, lender fees, cash reinvestment and individual tax
brackets are outside the model.

CSV version 2 retains the original monthly columns and appends collateral, limits, funded and
blocked draws, interest paid in cash, eligible interest and the monthly cash difference versus
the baseline. Exit tax is calculated independently at every reporting date as an illustrative
sale. The regression tests include all 360 months of the reviewed scenario, the appraisal and
credit boundaries, cash-funded interest and the annual tax and prepayment limits.

## Extra EMI schedule

Debt vs invest defaults to one extra EMI per comparison year, paid in month 12. Users can edit the EMI count and month (relative to projection start), or switch to a monthly surplus. Extra EMI amount tracks the regular payment. Both paths have identical cash budgets and timing; the invest path invests the extra at month-end, and all unused payments are invested after payoff. Annual budgets continue after payoff. Prepayment penalties are excluded. Interest savings and payoff comparisons appear in results, with savings limited to the selected horizon.
