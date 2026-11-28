import type { EconomicIndicator } from "@/types";

/** Editorial review date; market observations keep DATA_UPDATED_AT and their own dates. */
export const COMMENTARY_REVIEWED_AT = "Nov 27, 2026";

/** Interpretation of the sourced observations shown beside each economic chart. */
export const ECONOMIC_CONTEXT: Record<string, string> = {
  "opec-basket": "The official feed and archive returned HTTP 403 on November 27. The latest verified physical-crude assessment is dated October 22.",
  "us-gdp": "The second estimate raised Q3 growth to a 4.3% annualized pace from an initial 3.4%, mainly because investment and consumer spending were revised higher. Real GDP grew at a 2.2% annualized pace in Q2.",
  "ea-gdp": "Eurostat’s November 13 estimate kept Q3 growth at 0.4% quarter over quarter, after 0.6% in Q2. France contracted while Germany grew modestly. The flash estimate remains subject to revision.",
  "china-gdp": "Q3 annual growth strengthened modestly, but the later October manufacturing PMI fell below 50. The quarterly GDP and monthly survey cover different periods and measures, so the more recent survey is a separate signal rather than a revision to GDP.",
  "india-gdp": "The reported pace points to continued expansion. Comparisons across the base-year change need care, and this annual growth rate should not be ranked directly against annualised US quarterly GDP.",
  "us-jobless-claims": "Initial claims fell to 189,000 from a revised 202,000. The four-week average fell by 1,500 to 196,000. Initial claims measure new applications for unemployment benefits.",
  "us-unemployment": "Unemployment edged down to 4.1% in October while labour-force participation rose to 61.9%. Both rates come from the household survey.",
  "china-mfg-pmi": "The October reading fell below 50, reversing September’s move into expansion. Production and new orders also fell below that threshold. This is a diffusion survey of manufacturing conditions, not a percentage change in national output.",
  "india-mfg-pmi": "The final October manufacturing PMI was revised slightly below the flash estimate. It remained expansionary but slowed from September; the index measures the breadth of business change.",
  "taiwan-mfg-pmi": "The S&P Global October manufacturing PMI softened from September but stayed above 50. It differs from Taiwan’s separate CIER survey and cannot isolate AI-related semiconductor demand.",
  "south-korea-mfg-pmi": "The October survey softened substantially from September while remaining above 50. It points to slower improvement in factory conditions, alongside a separate equity-market performance window.",
  "india-services-pmi": "The final October services PMI was revised below the flash estimate but rose from September. It indicates faster expansion, not the percentage growth of service-sector output.",
  "us-cpi": "The November 10 release reports a 0.4% monthly CPI rise in October. Its annual comparison is unavailable because October 2025 data were not collected. This annual-rate chart retains September’s adjusted-index calculation and does not estimate a missing October rate.",
  "ea-hicp": "Energy contributed 1.89 percentage points to October’s annual rate, followed by services at 1.55 points.",
  "us-ppi": "October producer prices rose 0.3% month over month and 6.5% over 12 months in the BLS headline. This chart separately calculates 6.52% annual growth in the seasonally adjusted index. Price increases at producers do not automatically pass through to consumers.",
  "brent-oil": "Brent ended the week higher while WTI fell. Household fuel prices also depend on local costs and margins.",
  "natural-gas": "Henry Hub futures ended the week at $3.491 per MMBtu, up 2.35%.",
  "us-payrolls": "Payroll growth picked up to 165K in October from a revised 60K in September. The August gain was revised up to 186K.",
  "ca-unemployment": "Unemployment rose for a second consecutive month. Statistics Canada reported that 33,000 more people were looking for work in October.",
  "ca-payrolls": "Employment was broadly flat in October after falling in August and September. The employment rate fell for a third straight month, to 60.5%.",
  "us-fed-funds": "The card shows October’s 3.88% monthly average; Markets separately dates its daily effective rate. The Fed held its 3.75–4.00% target range on October 28. Monthly averages, daily effective rates and policy target ranges are distinct measures.",
  "ca-policy-rate": "The October 28 decision raised the overnight target by 25 basis points to 2.50%. The increase came despite weaker employment as inflation remained elevated. The policy target is an anchor for financing conditions, not the interest rate every household or firm pays.",
  "us-trade-balance": "The September goods-and-services deficit narrowed from the revised August figure. Nominal trade balances combine price and volume effects; a narrower deficit alone cannot establish stronger domestic demand.",
  "ca-trade-balance": "September’s merchandise surplus increased from the revised August reading. This goods-only measure excludes services and differs in coverage from the US goods-and-services balance.",
  "us-tax-receipts": "The higher annualised revenue pace is a fiscal inflow measure. A judgement about the deficit also requires expenditure data; this is neither one quarter's cash collected nor the budget balance.",
  "ca-tax-receipts": "The increase strengthens the reported federal revenue side. The series is total government revenue at an annualised pace, so it is broader than taxes alone and cannot establish an improvement in the budget balance.",
  "ca-gdp": "Quarterly growth accelerated, but the later monthly GDP and employment readings are less firm. The 0.82% figure is ordinary quarter-over-quarter growth and should not be compared directly with the annualised US rate.",
  "ca-gdp-monthly": "August output was essentially flat, with a small decline in the unrounded source calculation after July’s revised marginal gain. The latest monthly figures point to weaker momentum than Q2’s aggregate growth rate, without by themselves establishing a recession.",
  "ca-cpi": "Headline inflation held steady in October. Gasoline prices rose 30.9% from a year earlier, partly because of the low comparison base in October 2025.",
  "us-retail-sales": "Faster nominal sales growth supports the spending picture. Because these figures include price changes, the increase cannot be read as the same-sized gain in the volume of goods and services purchased.",
  "ca-retail-sales": "Gasoline stations and fuel vendors led September’s nominal increase. Statistics Canada’s separate October advance estimate points to a 1.5% monthly decline and is subject to revision.",
  "us-mfg-pmi": "The final October PMI was revised below the flash estimate and fell from September, while staying above 50. The survey indicates slower improvement in manufacturing conditions, not a percentage change in output.",
  "us-services-pmi": "The final October survey was revised down from its flash estimate and softened from September. Above 50 still indicates expansion; this survey does not directly measure service-sector GDP growth.",
  "ca-mfg-pmi": "October’s final manufacturing PMI fell below 50 after September’s expansion reading. The survey now signals deterioration in operating conditions rather than slower expansion.",
  "ca-services-pmi": "October’s services PMI edged lower and remained below 50. It indicates continued contraction in surveyed activity, separate from the later official GDP estimate.",
};

export function economicCommentary(indicator: Pick<EconomicIndicator, "id" | "description">): string {
  return [indicator.description, ECONOMIC_CONTEXT[indicator.id]].filter(Boolean).join(" ");
}
