import type { EconomicIndicator } from "@/types";

/** Editorial review date; market observations keep DATA_UPDATED_AT and their own dates. */
export const COMMENTARY_REVIEWED_AT = "Oct 31, 2026";

/** Interpretation of the sourced observations shown beside each economic chart. */
export const ECONOMIC_CONTEXT: Record<string, string> = {
  "opec-basket": "The last supplied physical-crude basket assessment is dated October 22. The official refresh endpoint remained unavailable this weekend, so it is retained with its actual date rather than presented as an October 30 quote. Brent futures use a different pricing method and later observation date.",
  "us-gdp": "The advance Q3 estimate shows growth accelerating to a 3.4% annualised pace from 2.2% in Q2. Investment and consumer spending supported expansion. This first estimate can be revised and is not directly comparable with ordinary quarterly growth rates.",
  "ea-gdp": "The preliminary Q3 estimate shows slower expansion at 0.4% quarter over quarter, after 0.6% in Q2. France contracted while Germany grew modestly. The flash estimate is subject to revision and is not annualised.",
  "china-gdp": "Q3 annual growth strengthened modestly, but the later October manufacturing PMI fell below 50. The quarterly GDP and monthly survey cover different periods and measures, so the more recent survey is a separate signal rather than a revision to GDP.",
  "india-gdp": "The reported pace points to continued expansion. Comparisons across the base-year change need care, and this annual growth rate should not be ranked directly against annualised US quarterly GDP.",
  "us-jobless-claims": "Initial applications declined slightly to 194K after the prior week was revised to 195K. Low initial claims coexist with slow September payroll growth; the two releases measure different parts of the labour market and different periods.",
  "us-unemployment": "The increase, alongside slower payroll growth, suggests a softer labour-market balance. A single monthly rise cannot establish a recession or determine the next policy decision.",
  "china-mfg-pmi": "The October reading fell below 50, reversing September’s move into expansion. Production and new orders also fell below that threshold. This is a diffusion survey of manufacturing conditions, not a percentage change in national output.",
  "india-mfg-pmi": "The flash headline eased but stayed above 50, indicating slower improvement rather than contraction. Services strengthened in the same preliminary release; both October readings can change in the final survey.",
  "taiwan-mfg-pmi": "The stronger expansion reading is consistent with improving surveyed factory conditions. It covers manufacturing broadly; it cannot isolate the contribution of AI-related semiconductor demand.",
  "south-korea-mfg-pmi": "The rise above an already expansionary reading points to firmer factory conditions. Equity prices can still fall over a different window, so the survey and the KOSPI snapshot need not move together.",
  "india-services-pmi": "The flash survey signals faster expansion in services while manufacturing softened slightly. It measures the breadth of reported business change, not the percentage growth of services output; the final October estimate is still pending.",
  "us-cpi": "The higher annual reading keeps price pressure in focus even as employment growth softens. Keep the dashboard's adjusted-index calculation separate from the unadjusted headline when discussing inflation news.",
  "ea-hicp": "The increase signals renewed pressure on household purchasing power. This headline alone does not establish how persistent the increase is or which components account for it.",
  "us-ppi": "Stronger producer-price growth raises a question about businesses' ability to absorb or pass on costs. Pass-through to consumer prices depends on margins and demand and is not automatic.",
  "brent-oil": "Brent fell over the week but remains an elevated input cost for oil users. WTI oil and Henry Hub gas rose, showing that energy benchmarks can diverge. The price changes alone do not establish the size or timing of a pass-through to consumer inflation.",
  "natural-gas": "Henry Hub rebounded over the week after its previous sharp decline. This is a US natural-gas futures benchmark, not a global gas price or a household utility bill; compare it with other energy series on the same observation dates.",
  "us-payrolls": "Hiring remained positive but slowed sharply relative to August's revised gain. Together with higher unemployment, that is a softer employment signal than the low weekly claims figure alone suggests.",
  "ca-unemployment": "The rising jobless rate reinforces the weakness in September employment. Labour-market slack and higher headline inflation are pulling the economic assessment in different directions.",
  "ca-payrolls": "A second monthly employment decline makes the weakness more persistent than a single negative release. This Labour Force Survey measure covers employment across the economy; it is not the US payroll establishment survey.",
  "us-fed-funds": "The card shows September’s monthly average, while the Markets table separately shows the October 29 daily effective rate. The Fed held its 3.75–4.00% target range on October 28. A monthly average, daily effective rate and policy target range are distinct measures.",
  "ca-policy-rate": "The October 28 decision raised the overnight target by 25 basis points to 2.50%. The increase came despite weaker employment as inflation remained elevated. The policy target is an anchor for financing conditions, not the interest rate every household or firm pays.",
  "us-trade-balance": "The wider deficit describes the difference between nominal imports and exports. The headline alone cannot distinguish stronger domestic demand, price effects and changes in export competitiveness.",
  "ca-trade-balance": "The larger goods surplus improves the reported merchandise balance. It excludes services and should not be compared directly with the US goods-and-services deficit as if their coverage were identical.",
  "us-tax-receipts": "The higher annualised revenue pace is a fiscal inflow measure. A judgement about the deficit also requires expenditure data; this is neither one quarter's cash collected nor the budget balance.",
  "ca-tax-receipts": "The increase strengthens the reported federal revenue side. The series is total government revenue at an annualised pace, so it is broader than taxes alone and cannot establish an improvement in the budget balance.",
  "ca-gdp": "Quarterly growth accelerated, but the later monthly GDP and employment readings are less firm. The 0.82% figure is ordinary quarter-over-quarter growth and should not be compared directly with the annualised US rate.",
  "ca-gdp-monthly": "August output was essentially flat, with a small decline in the unrounded source calculation after July’s revised marginal gain. The latest monthly figures point to weaker momentum than Q2’s aggregate growth rate, without by themselves establishing a recession.",
  "ca-cpi": "Headline inflation accelerated while the latest employment picture weakened. That combination highlights the household squeeze without establishing that demand is strengthening across the economy.",
  "us-retail-sales": "Faster nominal sales growth supports the spending picture. Because these figures include price changes, the increase cannot be read as the same-sized gain in the volume of goods and services purchased.",
  "ca-retail-sales": "The August rebound improves the spending picture after July’s decline. The monthly volume increase adds evidence beyond nominal growth, but the card remains an annual nominal measure and September’s advance estimate is not a final result.",
  "us-mfg-pmi": "The flash index edged higher while services slowed, although both remained expansionary. Keep the manufacturing headline separate from its output sub-index and retain the preliminary label until the final October release.",
  "us-services-pmi": "A lower flash reading indicates slower expansion rather than contraction. The survey’s selling-price pressure matters alongside its activity signal, but it is not a direct measure of CPI inflation or service-sector GDP.",
  "ca-mfg-pmi": "Manufacturing remained above the expansion threshold, but the lower index points to slower improvement. This offers a more restrained signal than simply classifying the month as expansionary.",
  "ca-services-pmi": "The rise indicates a less severe contraction, not a return to expansion. That distinction matters when reading the survey alongside Canada's weaker September employment figures.",
};

export function economicCommentary(indicator: Pick<EconomicIndicator, "id" | "description">): string {
  return [indicator.description, ECONOMIC_CONTEXT[indicator.id]].filter(Boolean).join(" ");
}
