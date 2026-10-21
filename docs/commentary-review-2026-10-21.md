# Commentary review — October 21, 2026

Reviewed the homepage, global Economy, US, Canada and Vantage AI commentary. Market prices,
heatmaps and economic observation periods remain those in the verified October 20 refresh.
The commentary review date is displayed separately, without relabelling those observations as
October 21 prices or releases.

## Changes

- Rewrote all six homepage market sections with interpretation of sector leadership, equity
  breadth, crypto dispersion, bond levels, divergent energy prices and currency translation.
- Corrected the FX narrative to name currency pairs explicitly: a fall in USD/CAD, USD/INR or
  USD/JPY indicates a stronger counterpart currency against USD, not a weaker one.
- Added reviewed context for every economic indicator in `src/lib/commentary.ts`. Chart notes
  and commentary sections share the same function and retain the sourced description and period.
- Replaced generic economic “improved/softened” text and the public placeholder instruction
  about replacing generated text with reviewed commentary.
- Updated the AI revenue, capex/backlog/power, hardware, labour, private-capital and adoption
  narratives. Corrected the Q2/July hero to Q3/October, TSMC monthly commentary to Q3 results,
  and ASML's FX attribution from ECB to the actual Yahoo EUR/USD source. Adoption reference
  and release dates now come from the existing dataset constants.
- Clarified what the two long-maturity yield curves can establish without claiming that a
  spread alone identifies its drivers.

## Sources and new release

Underlying observations and source definitions are documented in
[`data-refresh-2026-10-20.md`](data-refresh-2026-10-20.md). Interpretation is explicitly separated
from proven causation; no fund-flow, recession, productivity or investment-return result is
inferred solely from the displayed price or survey changes.

Rechecked the [BLS September CPI release](https://www.bls.gov/news.release/archives/cpi_10142026.htm),
[BLS September PPI release](https://www.bls.gov/news.release/archives/ppi_10152026.htm),
[State Council / NBS Q3 GDP release](https://english.www.gov.cn/archive/statistics/202610/19/content_WS6ad5a59bc6d00ca5f9a0dc86.html),
[TSMC Q3 results](https://investor.tsmc.com/english/quarterly-results/2026/q3),
[ASML Q3 results](https://www.investor.asml.com/news-releases/news-release-details/asml-reports-eu11.7-billion-total-net-sales-and-eu5.0-billion-net-income-q3-2026),
[Challenger September cuts](https://www.challengergray.com/blog/job-cuts-fall-in-september-hiring-plans-up-3-over-2025-on-weak-early-seasonal-hiring/)
and [Crunchbase Q3 funding](https://news.crunchbase.com/venture/q3-2026-global-startup-funding-ai-billion-dollar-rounds-exits-data/).
Statistics Canada's September CPI PDF was temporarily unavailable on this review; retained
the previously verified October 19 release rather than substituting new figures.

Added the [Bank Indonesia October 21 decision](https://www.bi.go.id/en/publikasi/ruang-media/news-release/Pages/sp_2823326.aspx):
BI-Rate unchanged at 5.75%, lending facility unchanged at 6.50%, deposit facility raised to 5.00%.
Updated the Indonesia policy-rate decision date and added the linked headline and bond commentary.
Sovereign yields retain their original observation dates.

## Validation

- All 35 economic indicators have reviewed context; the chart and commentary section use the
  same formatter.
- Compared market and economic datasets with the deployed October 20 commit: prices, returns,
  histories, indicator values and observation dates are unchanged. The Indonesia decision date
  and linked news item are the only new policy-release updates.
- Checked the nine declining equity indices and the direction of the three USD currency pairs
  against the actual snapshot before describing breadth and currency strength.
- TypeScript, all 71 tests, sovereign-bond validation and the production export passed.
- Inspected exported HTML on the homepage, Economy, US, Canada and AI routes for the revised
  commentary, review date and corrected labels; removed placeholder text is absent.
