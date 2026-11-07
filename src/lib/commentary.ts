import type { EconomicIndicator } from "@/types";

/** Editorial review date; market observations keep DATA_UPDATED_AT and their own dates. */
export const COMMENTARY_REVIEWED_AT = "Nov 6, 2026";

/** Interpretation of the sourced observations shown beside each economic chart. */
export const ECONOMIC_CONTEXT: Record<string, string> = {
  "opec-basket": "The official feed returned HTTP 403 on November 6. The latest supplied physical-crude assessment is dated October 22.",
  "us-gdp": "The advance Q3 estimate shows growth accelerating to a 3.4% annualised pace from 2.2% in Q2. Investment and consumer spending supported expansion. This first estimate can be revised and is not directly comparable with ordinary quarterly growth rates.",
  "ea-gdp": "The preliminary Q3 estimate shows slower expansion at 0.4% quarter over quarter, after 0.6% in Q2. France contracted while Germany grew modestly. The flash estimate is subject to revision and is not annualised.",
  "china-gdp": "Q3 annual growth strengthened modestly, but the later October manufacturing PMI fell below 50. The quarterly GDP and monthly survey cover different periods and measures, so the more recent survey is a separate signal rather than a revision to GDP.",
  "india-gdp": "The reported pace points to continued expansion. Comparisons across the base-year change need care, and this annual growth rate should not be ranked directly against annualised US quarterly GDP.",
  "us-jobless-claims": "Initial claims fell to 189K for the week ending October 31, from a revised 195K. Claims track new benefit applications, while the October payroll report measures employment at establishments.",
  "us-unemployment": "Unemployment edged down to 4.1% in October while labour-force participation rose to 61.9%. Both rates come from the household survey.",
  "china-mfg-pmi": "The October reading fell below 50, reversing September’s move into expansion. Production and new orders also fell below that threshold. This is a diffusion survey of manufacturing conditions, not a percentage change in national output.",
  "india-mfg-pmi": "The final October manufacturing PMI was revised slightly below the flash estimate. It remained expansionary but slowed from September; the index measures the breadth of business change.",
  "taiwan-mfg-pmi": "The S&P Global October manufacturing PMI softened from September but stayed above 50. It differs from Taiwan’s separate CIER survey and cannot isolate AI-related semiconductor demand.",
  "south-korea-mfg-pmi": "The October survey softened substantially from September while remaining above 50. It points to slower improvement in factory conditions, alongside a separate equity-market performance window.",
  "india-services-pmi": "The final October services PMI was revised below the flash estimate but rose from September. It indicates faster expansion, not the percentage growth of service-sector output.",
  "us-cpi": "The higher annual reading keeps price pressure in focus even as employment growth softens. Keep the dashboard's adjusted-index calculation separate from the unadjusted headline when discussing inflation news.",
  "ea-hicp": "The increase signals renewed pressure on household purchasing power. This headline alone does not establish how persistent the increase is or which components account for it.",
  "us-ppi": "Stronger producer-price growth raises a question about businesses' ability to absorb or pass on costs. Pass-through to consumer prices depends on margins and demand and is not automatic.",
  "brent-oil": "Brent and WTI fell over the week ending November 6 while Henry Hub gas rose. Households face different prices depending on the fuel they buy and where they live.",
  "natural-gas": "Henry Hub gained 3.45% in the week ending November 6. The benchmark reflects US natural gas futures prices.",
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
  "ca-cpi": "Headline inflation accelerated while the latest employment picture weakened. That combination highlights the household squeeze without establishing that demand is strengthening across the economy.",
  "us-retail-sales": "Faster nominal sales growth supports the spending picture. Because these figures include price changes, the increase cannot be read as the same-sized gain in the volume of goods and services purchased.",
  "ca-retail-sales": "The August rebound improves the spending picture after July’s decline. The monthly volume increase adds evidence beyond nominal growth, but the card remains an annual nominal measure and September’s advance estimate is not a final result.",
  "us-mfg-pmi": "The final October PMI was revised below the flash estimate and fell from September, while staying above 50. The survey indicates slower improvement in manufacturing conditions, not a percentage change in output.",
  "us-services-pmi": "The final October survey was revised down from its flash estimate and softened from September. Above 50 still indicates expansion; this survey does not directly measure service-sector GDP growth.",
  "ca-mfg-pmi": "October’s final manufacturing PMI fell below 50 after September’s expansion reading. The survey now signals deterioration in operating conditions rather than slower expansion.",
  "ca-services-pmi": "October’s services PMI edged lower and remained below 50. It indicates continued contraction in surveyed activity, separate from the later official GDP estimate.",
};

export function economicCommentary(indicator: Pick<EconomicIndicator, "id" | "description">): string {
  return [indicator.description, ECONOMIC_CONTEXT[indicator.id]].filter(Boolean).join(" ");
}
