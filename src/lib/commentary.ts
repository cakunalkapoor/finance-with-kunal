import type { EconomicIndicator } from "@/types";

/** Editorial review date; market observations keep DATA_UPDATED_AT and their own dates. */
export const COMMENTARY_REVIEWED_AT = "Oct 21, 2026";

/** Interpretation of the sourced observations shown beside each economic chart. */
export const ECONOMIC_CONTEXT: Record<string, string> = {
  "opec-basket": "The retained physical-crude quote provides historical context. It cannot establish whether the basket followed the latest rise in Brent futures.",
  "us-gdp": "The economy continued to expand, but at a slower annualised pace. This quarterly result predates the September inflation and employment releases, so it cannot settle the current growth outlook.",
  "ea-gdp": "The return to quarterly expansion is encouraging for activity. September's higher inflation reading adds a separate price-pressure concern; quarterly growth and annual inflation are different measures.",
  "china-gdp": "The modest acceleration improves the growth picture relative to Q2. It does not by itself explain the weaker Shanghai and Hong Kong equity returns in the site's earlier market snapshot.",
  "india-gdp": "The reported pace points to continued expansion. Comparisons across the base-year change need care, and this annual growth rate should not be ranked directly against annualised US quarterly GDP.",
  "us-jobless-claims": "The small weekly increase offers limited evidence of a change in layoffs. Read it alongside September's slower payroll hiring: claims track new benefit applications, while payrolls track the net change in jobs.",
  "us-unemployment": "The increase, alongside slower payroll growth, suggests a softer labour-market balance. A single monthly rise cannot establish a recession or determine the next policy decision.",
  "china-mfg-pmi": "Crossing 50 indicates a return to expansion in the survey. The narrow margin above that threshold suggests a more tentative manufacturing signal than the GDP headline alone might imply.",
  "india-mfg-pmi": "A higher reading above 50 signals faster expansion in surveyed manufacturing conditions. PMI measures the breadth of reported change rather than the percentage growth of industrial output.",
  "taiwan-mfg-pmi": "The stronger expansion reading is consistent with improving surveyed factory conditions. It covers manufacturing broadly; it cannot isolate the contribution of AI-related semiconductor demand.",
  "south-korea-mfg-pmi": "The rise above an already expansionary reading points to firmer factory conditions. Equity prices can still fall over a different window, so the survey and the KOSPI snapshot need not move together.",
  "india-services-pmi": "Services remained expansionary after the final release revised down the flash estimate. Use the final figure when comparing sectors rather than mixing preliminary and final survey vintages.",
  "us-cpi": "The higher annual reading keeps price pressure in focus even as employment growth softens. Keep the dashboard's adjusted-index calculation separate from the unadjusted headline when discussing inflation news.",
  "ea-hicp": "The increase signals renewed pressure on household purchasing power. This headline alone does not establish how persistent the increase is or which components account for it.",
  "us-ppi": "Stronger producer-price growth raises a question about businesses' ability to absorb or pass on costs. Pass-through to consumer prices depends on margins and demand and is not automatic.",
  "brent-oil": "The weekly rise adds to the cost backdrop for transport and other oil users. This futures snapshot does not establish the cause of the move or imply that every energy product rose with it.",
  "natural-gas": "The decline runs against the rise in crude oil, showing why energy markets need to be assessed separately. Henry Hub futures are a US gas benchmark, not a global household energy bill.",
  "us-payrolls": "Hiring remained positive but slowed sharply relative to August's revised gain. Together with higher unemployment, that is a softer employment signal than the low weekly claims figure alone suggests.",
  "ca-unemployment": "The rising jobless rate reinforces the weakness in September employment. Labour-market slack and higher headline inflation are pulling the economic assessment in different directions.",
  "ca-payrolls": "A second monthly employment decline makes the weakness more persistent than a single negative release. This Labour Force Survey measure covers employment across the economy; it is not the US payroll establishment survey.",
  "us-fed-funds": "The monthly average describes the rate already experienced during September. A later daily observation and the central bank's next decision answer different questions and should retain their own dates.",
  "ca-policy-rate": "The overnight target is the policy anchor for financing conditions. Weaker employment and higher headline inflation create a policy trade-off; this observation is not a forecast of the next decision.",
  "us-trade-balance": "The wider deficit describes the difference between nominal imports and exports. The headline alone cannot distinguish stronger domestic demand, price effects and changes in export competitiveness.",
  "ca-trade-balance": "The larger goods surplus improves the reported merchandise balance. It excludes services and should not be compared directly with the US goods-and-services deficit as if their coverage were identical.",
  "us-tax-receipts": "The higher annualised revenue pace is a fiscal inflow measure. A judgement about the deficit also requires expenditure data; this is neither one quarter's cash collected nor the budget balance.",
  "ca-tax-receipts": "The increase strengthens the reported federal revenue side. The series is total government revenue at an annualised pace, so it is broader than taxes alone and cannot establish an improvement in the budget balance.",
  "ca-gdp": "Quarterly growth accelerated, but the later monthly GDP and employment readings are less firm. The 0.82% figure is ordinary quarter-over-quarter growth and should not be compared directly with the annualised US rate.",
  "ca-gdp-monthly": "Flat July output points to a pause after June's increase. The monthly series provides a later view than Q2 GDP, but its July period still predates September's employment declines.",
  "ca-cpi": "Headline inflation accelerated while the latest employment picture weakened. That combination highlights the household squeeze without establishing that demand is strengthening across the economy.",
  "us-retail-sales": "Faster nominal sales growth supports the spending picture. Because these figures include price changes, the increase cannot be read as the same-sized gain in the volume of goods and services purchased.",
  "ca-retail-sales": "Annual nominal sales growth eased slightly. July's reading predates the latest employment and inflation releases and does not settle how household spending performed in September.",
  "us-mfg-pmi": "Manufacturing conditions improved on this survey even as payroll growth softened. The divergence argues for assessing production, employment and prices together rather than treating one survey as the whole economy.",
  "us-services-pmi": "The final services reading points to a broad improvement in surveyed activity. It measures the prevalence of expansion among respondents, not the percentage growth of service-sector GDP.",
  "ca-mfg-pmi": "Manufacturing remained above the expansion threshold, but the lower index points to slower improvement. This offers a more restrained signal than simply classifying the month as expansionary.",
  "ca-services-pmi": "The rise indicates a less severe contraction, not a return to expansion. That distinction matters when reading the survey alongside Canada's weaker September employment figures.",
};

export function economicCommentary(indicator: Pick<EconomicIndicator, "id" | "description">): string {
  return [indicator.description, ECONOMIC_CONTEXT[indicator.id]].filter(Boolean).join(" ");
}
