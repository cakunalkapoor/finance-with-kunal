# Data refresh — October 3, 2026

Refresh performed in America/Vancouver time. Market prices use the latest available observations through October 3; exchange-traded instruments generally end October 2, while mainland Chinese markets end September 30 due to holidays. Monthly and quarterly series retain their published observation periods.

## Automated sources

- Yahoo Finance via the existing yfinance fetcher: 13 equity indices, 9 commodities, 4 cryptocurrencies, 6 currency series, 16 ETFs, 28 AI stocks, 12 USD-normalized comparison indices.
- Yahoo constituent quotes: 1,618 heatmap constituents across 11 markets; 1,616 quotes available, two unavailable.
- FRED: US GDP, unemployment, payrolls, claims, CPI, PPI, effective federal funds, trade, tax receipts, retail sales, and bond history.
- Bank of Canada, Statistics Canada, and Eurostat: existing configured economic series and bond observations.

## Reviewed updates

- [BLS September employment report](https://www.bls.gov/news.release/empsit.nr0.htm), October 2: unemployment 4.2%, payroll increase 29K; revised August payroll increase 133K from FRED.
- [BEA Q2 third estimate and annual update](https://www.bea.gov/news/2026/gdp-third-estimate-industries-corporate-profits-state-gdp-and-state-personal-income-2nd), September 30: GDP growth 2.2% annualised; Q1 2.5%.
- [ISM September report](https://www.ismworld.org/supply-management-news-and-reports/reports/ism-pmi-reports/pmi/september/): 54.5; used in news, separate from S&P Global PMI.
- [US S&P Global final manufacturing PMI](https://finance.yahoo.com/markets/stocks/articles/p-global-us-final-manufacturing-135359863.html): 55.9; replaces 57.0 flash.
- Final September manufacturing PMI: [Canada](https://tradingeconomics.com/canada/manufacturing-pmi) 51.5, [India](https://tradingeconomics.com/india/manufacturing-pmi) 55.1, [Taiwan](https://tradingeconomics.com/taiwan/manufacturing-pmi) 56.7, [South Korea](https://tradingeconomics.com/south-korea/manufacturing-pmi) 53.9.
- [China NBS September manufacturing PMI](https://www.stats.gov.cn/zwfwck/sjfb/202609/t20260930_1965449.html): 50.1, unchanged from the existing supplied value; verified against the published release.
- [Challenger September report](https://www.challengergray.com/blog/job-cuts-fall-in-september-hiring-plans-up-3-over-2025-on-weak-early-seasonal-hiring/), October 1: 43,281 total cuts, 3,961 AI-attributed cuts (about 9%), AI fifth among monthly reasons, 120,136 AI-attributed YTD cuts, 165,925 technology cuts across all reasons.
- [Reuters OpenAI revenue reporting](https://uk.marketscreener.com/news/openai-s-annualized-recurring-revenue-nears-70-billion-source-says-ce785addd18df525), September 29: annualized recurring revenue approaching $70B; a reported private-company run rate, not full-year revenue.
- [EliseAI company announcement](https://www.globenewswire.com/news-release/2026/09/29/3370681/0/en/eliseai-raises-350-million-at-4-billion-valuation-to-bring-ai-deeper-into-housing-and-healthcare-operations.html), September 29: $350M funding, $4B valuation, led by a16z and Bessemer.
- Government bond published closes and independent cross-checks: per-country URLs and observation dates recorded in `src/lib/bonds-manual.json`. Taiwan source changed to Trading Economics because the prior Investing.com historical page was unavailable; previous-provider history is not used for its period moves.

## Reporting periods retained

Quarterly company earnings, capex plans, AI funding snapshots, Census AI-adoption survey, policy-decision effective dates, and monthly statistics with no verified successor remain dated to their actual releases. US and India September services PMI remain marked flash; Canadian services PMI remains August. No October monthly or Q3 economic result is inferred from the refresh date. The existing Census release is September 24; [TSMC September monthly sales](https://investor.tsmc.com/english/financial-calendar) are scheduled October 8.

Homepage macro tiles, weekly commentary, economic descriptions, AI jobs prose, and news were updated to match the refreshed underlying records.
