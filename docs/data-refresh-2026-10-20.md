# Data refresh — October 20, 2026

Reviewed in America/Vancouver time. The shared update label is October 20; observation dates remain attached to the underlying data. Market snapshots use the latest available provider observations through October 20, with some exchanges and series ending October 19 or earlier. Monthly and quarterly observations are not relabelled as October results.

## Automated updates

- Yahoo Finance: 13 equity indices, 16 ETFs, nine commodity futures, four cryptocurrencies and six currency series. Refreshed prices, returns, ranges and chart histories through the existing fetch and patch pipeline.
- AI quotes: 28 stocks and 12 comparison indices, converted to USD and aligned to the common daily/weekly grids; applied the separate `patch:ai` step.
- Heatmaps: 1,618 constituents across 11 indices, with 1,611 available quotes. Seven unavailable quotes remain null and are excluded from calculated sector returns.
- FRED: nine bond histories and 11 economic records, including September inflation and retail sales and claims for the week ending October 10.
- Bank of Canada: policy rate, September CPI, and both legs of the Canadian yield curve.
- Statistics Canada: seven configured economic series; retained each latest available reporting period.
- Eurostat: Q2 GDP and September HICP. Dataset update dates were October 19 and October 16, respectively.
- Bond feeds: all nine configured markets returned observations. Published closes supplement lagging feeds; all 13 displayed sovereign yields pass `validate-bonds.mjs`.

Initial sandbox fetches could not resolve provider hosts. Successful network-enabled fetches replaced their failed caches before patching; cache counts were checked before application.

## Reviewed content

- [China Q3 GDP, State Council / NBS](https://english.www.gov.cn/archive/statistics/202610/19/content_WS6ad5a59bc6d00ca5f9a0dc86.html): 4.5% YoY after 4.3% in Q2, released October 19. Added the Q3 history point.
- [Canadian September CPI](https://www150.statcan.gc.ca/n1/daily-quotidien/261019/dq261019a-eng.pdf), October 19: headline 3.1% after 3.0%. The dashboard retains its existing calculation from the Bank of Canada CPI index, 3.09% after 3.03%, and explains the rounding difference.
- [US September CPI](https://www.bls.gov/news.release/archives/cpi_10142026.htm), October 14: unadjusted annual headline 3.7%. **Correction, October 29:** the earlier 4.02% CPIAUCSL calculation was wrong. Filtering out the missing October 2025 observation shifted the positional twelve-row comparison. Matching the same calendar month gives 3.72% for September and 3.35% for August. Seasonal adjustment did not explain the earlier discrepancy.
- [US September PPI](https://www.bls.gov/news.release/archives/ppi_10152026.htm), October 15: unadjusted annual headline 6.3%. The dashboard's seasonally adjusted PPIFIS calculation is 6.35%; August was revised to 5.58%.
- [US September retail sales](https://www.census.gov/retail/marts/www/marts_current.pdf), October 15: $745.0B, +0.8% MoM and +6.3% YoY rounded. The existing FRED calculation is 6.29% YoY, with August revised to 5.56%.
- [TSMC Q3 results](https://investor.tsmc.com/english/quarterly-results/2026/q3), October 15: company-wide revenue US$46.72B, +41.2% YoY and +16.2% QoQ; Q4 revenue guidance US$52.3–54.3B. Replaced the monthly chip-demand tile with this newer quarterly release. The separately dated FY2025 AI-accelerator revenue-share card remains a different measure.
- [ASML Q3 results](https://www.investor.asml.com/news-releases/news-release-details/asml-reports-eu11.7-billion-total-net-sales-and-eu5.0-billion-net-income-q3-2026), October 14: net sales €11.662B and full-year guidance €44–45B. USD displays use Yahoo's October 14 EUR/USD daily close of 1.1204, labelled in the FX provenance.
- Homepage headlines and rolling weekly commentary were refreshed to match these releases and the new market/sector observations.

## Bond verification and comparisons

`bonds-manual.json` records completed October 19 Investing.com sessions and fresh independent Trading Economics cross-checks, with URLs and dates. Cross-checks can be from October 20 and are not used as historical anchors. Taiwan's Investing.com history became accessible again; its current period changes use only that source's observations.

Same-source closes for every new month/year anniversary could not be verified. Unsupported comparisons remain null rather than reusing an older anniversary. Historical chart points retain their calendar months. The dated India October 12 regression remains pinned to its original observations; the rolling dataset check verifies prior-session coverage, provenance, unique dates and absence of future closes without requiring unavailable anniversary data.

## Retained periods and source limit

September PMI, India GDP, hyperscaler earnings/capex plans, private-company revenue reports, Challenger layoffs, venture-funding snapshots and the October 8 Census AI-adoption release retain their source dates. No October PMI, October labour totals or unpublished quarterly earnings were inferred from today's date.

OPEC's official JSON and XML archive endpoints returned HTTP 403. The last verified basket quote remains September 29 ($109.53/bbl), with the failed October 20 refresh stated in the indicator description. Its successful fetch path clears this notice on a later refresh.

## Validation

- TypeScript type check.
- All 71 existing tests, including calendar-aligned bond history and the financial calculators.
- Sovereign bond source, freshness, history and policy-rate coverage checks.
- Production static-export build and Open Graph image generation succeeded.
