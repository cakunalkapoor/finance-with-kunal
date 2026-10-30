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

## Economy source audit — October 29, 2026

The 17 added international series were independently fetched again and matched across every retained point. The original FRED, BoC and Eurostat series were reconciled against their dated source responses. Canadian monthly GDP's WDS endpoint returned “product is not released yet”; its retained history instead matched changes calculated from the [official July release's chart table](https://www150.statcan.gc.ca/n1/daily-quotidien/260929/cg-a001-png-eng.htm). Canadian retail growth is correctly 5.4%: the unrounded August calculation is 5.350300011%, so it must be rounded once.

Corrections:

- US CPI was wrong from November 2025 onward because a missing October release shifted an array-offset YoY calculation. September is **3.72%**, August **3.35%**, from the seasonally adjusted CPIAUCSL index. The published unadjusted headline remains **3.7%**. The prior seasonal-adjustment explanation was incorrect. All monthly and quarterly derivations now require exact calendar anchors and never fill a missing release.
- October 17 US initial claims are now the source's revised **195K**, with the original **194K** release distinguished in the description.
- China's full retained GDP history now uses [NBS Table 2, October 21](https://www.stats.gov.cn/english/PressRelease/202610/t20261021_1965671.html). India's full retained GDP history now uses Figure 1 of [MoSPI's August 31 release](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2304949&lang=1&reg=48), including revised January–March growth of **8.6%**, followed by April–June **7.8%**. The earlier mix of vintages was removed.
- US yield charts and Brent/Henry Hub charts contained actual sampled prices assigned to approximate monthly/weekly dates. They were rebuilt from dated provider observations. Future fetches retain original observation dates; the patcher refuses undated caches and pairs both bond tenors on the same source date. Both curves retain their October 22 headline observations, rather than silently advancing the snapshot.

PMI is manually curated **reported survey data**, not a live licensed S&P feed. Retained finals were cross-checked against the country histories/release tables on Trendonify (India June manufacturing uses the final release's 54.2, not the 54.5 flash reading in its historical table). Taiwan May is also supported by [Trading Economics' June 1 report](https://tradingeconomics.com/taiwan/manufacturing-pmi/news/555117). India's October flash pair is supported by [Reuters' October 23 report](https://www.marketscreener.com/news/india-october-business-growth-hits-4-month-high-hiring-stalls-pmi-shows-ce785cded189fe23). Flash observations remain explicitly labelled and subject to revision. OPEC remains the owner's supplied daily export; independent archive access is blocked, and the panel explicitly identifies that provenance.

Every indicator now has a visible source link. This is an audit and correction of the dated Economy snapshot, not a claim that each series is real-time or has been refreshed through October 29. Markets and Vantage AI were not re-audited in this pass. Regression coverage includes missing calendar anchors, rounding, real bond dates and weekly-price dates around holidays and partial weeks.
