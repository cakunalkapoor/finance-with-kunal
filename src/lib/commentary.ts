import type { EconomicIndicator } from "@/types";

/** Editorial review date; market observations keep DATA_UPDATED_AT and their own dates. */
export const COMMENTARY_REVIEWED_AT = "Nov 5, 2026";

/** Interpretation of the sourced observations shown beside each economic chart. */
export const ECONOMIC_CONTEXT: Record<string, string> = {
  "opec-basket": "The last supplied physical-crude basket assessment is dated October 22. The official endpoint returned HTTP 403 during the November 5 refresh. Brent futures have a different pricing method and observation date.",
  "us-gdp": "The advance Q3 estimate shows growth accelerating to a 3.4% annualised pace from 2.2% in Q2. Investment and consumer spending supported expansion. This first estimate can be revised and is not directly comparable with ordinary quarterly growth rates.",
  "ea-gdp": "The preliminary Q3 estimate shows slower expansion at 0.4% quarter over quarter, after 0.6% in Q2. France contracted while Germany grew modestly. The flash estimate is subject to revision and is not annualised.",
  "china-gdp": "Q3 annual growth strengthened modestly, but the later October manufacturing PMI fell below 50. The quarterly GDP and monthly survey cover different periods and measures, so the more recent survey is a separate signal rather than a revision to GDP.",
  "india-gdp": "The reported pace points to continued expansion. Comparisons across the base-year change need care, and this annual growth rate should not be ranked directly against annualised US quarterly GDP.",
  "us-jobless-claims": "Initial claims fell to 189K for the week ending October 31, from a revised 195K. This weekly benefit measure does not replace the September payroll report or establish the result of the next monthly release.",
  "us-unemployment": "The increase, alongside slower payroll growth, suggests a softer labour-market balance. A single monthly rise cannot establish a recession or determine the next policy decision.",
  "china-mfg-pmi": "The October reading fell below 50, reversing September’s move into expansion. Production and new orders also fell below that threshold. This is a diffusion survey of manufacturing conditions, not a percentage change in national output.",
  "india-mfg-pmi": "The final October manufacturing PMI was revised slightly below the flash estimate. It remained expansionary but slowed from September; the index measures the breadth of business change.",
  "taiwan-mfg-pmi": "The S&P Global October manufacturing PMI softened from September but stayed above 50. It differs from Taiwan’s separate CIER survey and cannot isolate AI-related semiconductor demand.",
  "south-korea-mfg-pmi": "The October survey softened substantially from September while remaining above 50. It points to slower improvement in factory conditions, alongside a separate equity-market performance window.",
  "india-services-pmi": "The final October services PMI was revised below the flash estimate but rose from September. It indicates faster expansion, not the percentage growth of service-sector output.",
  "us-cpi": "The higher annual reading keeps price pressure in focus even as employment growth softens. Keep the dashboard's adjusted-index calculation separate from the unadjusted headline when discussing inflation news.",
  "ea-hicp": "The increase signals renewed pressure on household purchasing power. This headline alone does not establish how persistent the increase is or which components account for it.",
  "us-ppi": "Stronger producer-price growth raises a question about businesses' ability to absorb or pass on costs. Pass-through to consumer prices depends on margins and demand and is not automatic.",
  "brent-oil": "Brent and WTI both declined sharply over the rolling weekly window through November 5, while Henry Hub gas edged higher. Futures returns alone do not establish how quickly lower input prices will reach households.",
  "natural-gas": "Henry Hub edged up over the rolling weekly window through November 5. It is a US natural-gas futures benchmark and differs from global gas prices and household utility bills.",
  "us-payrolls": "Hiring remained positive but slowed sharply relative to August's revised gain. Together with higher unemployment, that is a softer employment signal than the low weekly claims figure alone suggests.",
  "ca-unemployment": "The rising jobless rate reinforces the weakness in September employment. Labour-market slack and higher headline inflation are pulling the economic assessment in different directions.",
  "ca-payrolls": "A second monthly employment decline makes the weakness more persistent than a single negative release. This Labour Force Survey measure covers employment across the economy; it is not the US payroll establishment survey.",
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
