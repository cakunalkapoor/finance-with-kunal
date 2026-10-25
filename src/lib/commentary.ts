import type { EconomicIndicator } from "@/types";

/** Editorial review date; market observations keep DATA_UPDATED_AT and their own dates. */
export const COMMENTARY_REVIEWED_AT = "Oct 24, 2026";

/** Interpretation of the sourced observations shown beside each economic chart. */
export const ECONOMIC_CONTEXT: Record<string, string> = {
  "opec-basket": "The latest supplied physical-crude basket price is above September’s last published quote. Its October 22 assessment predates the October 23 Brent futures close, so the two observations should be compared with their dates and different pricing methods in view.",
  "us-gdp": "The economy continued to expand, but at a slower annualised pace. This quarterly result predates the September inflation and employment releases, so it cannot settle the current growth outlook.",
  "ea-gdp": "The return to quarterly expansion is encouraging for activity. September's higher inflation reading adds a separate price-pressure concern; quarterly growth and annual inflation are different measures.",
  "china-gdp": "The modest acceleration improves the growth picture relative to Q2. It does not by itself explain the weaker Shanghai and Hong Kong equity returns in the site's earlier market snapshot.",
  "india-gdp": "The reported pace points to continued expansion. Comparisons across the base-year change need care, and this annual growth rate should not be ranked directly against annualised US quarterly GDP.",
  "us-jobless-claims": "Fewer initial applications are consistent with limited new layoffs, while September payroll hiring remained slow. Initial claims, continuing claims and payrolls measure different parts of the labour market and use different periods.",
  "us-unemployment": "The increase, alongside slower payroll growth, suggests a softer labour-market balance. A single monthly rise cannot establish a recession or determine the next policy decision.",
  "china-mfg-pmi": "Crossing 50 indicates a return to expansion in the survey. The narrow margin above that threshold suggests a more tentative manufacturing signal than the GDP headline alone might imply.",
  "india-mfg-pmi": "The flash headline eased but stayed above 50, indicating slower improvement rather than contraction. Services strengthened in the same preliminary release; both October readings can change in the final survey.",
  "taiwan-mfg-pmi": "The stronger expansion reading is consistent with improving surveyed factory conditions. It covers manufacturing broadly; it cannot isolate the contribution of AI-related semiconductor demand.",
  "south-korea-mfg-pmi": "The rise above an already expansionary reading points to firmer factory conditions. Equity prices can still fall over a different window, so the survey and the KOSPI snapshot need not move together.",
  "india-services-pmi": "The flash survey signals faster expansion in services while manufacturing softened slightly. It measures the breadth of reported business change, not the percentage growth of services output; the final October estimate is still pending.",
  "us-cpi": "The higher annual reading keeps price pressure in focus even as employment growth softens. Keep the dashboard's adjusted-index calculation separate from the unadjusted headline when discussing inflation news.",
  "ea-hicp": "The increase signals renewed pressure on household purchasing power. This headline alone does not establish how persistent the increase is or which components account for it.",
  "us-ppi": "Stronger producer-price growth raises a question about businesses' ability to absorb or pass on costs. Pass-through to consumer prices depends on margins and demand and is not automatic.",
  "brent-oil": "The rise in crude adds to the cost backdrop for transport and oil users while Henry Hub gas fell sharply. The divergence argues for examining each energy benchmark rather than treating energy as one price.",
  "natural-gas": "Henry Hub fell sharply while crude oil rose. Its US futures price is distinct from global gas prices and household utility bills, so a lower quote cannot establish that all energy costs eased.",
  "us-payrolls": "Hiring remained positive but slowed sharply relative to August's revised gain. Together with higher unemployment, that is a softer employment signal than the low weekly claims figure alone suggests.",
  "ca-unemployment": "The rising jobless rate reinforces the weakness in September employment. Labour-market slack and higher headline inflation are pulling the economic assessment in different directions.",
  "ca-payrolls": "A second monthly employment decline makes the weakness more persistent than a single negative release. This Labour Force Survey measure covers employment across the economy; it is not the US payroll establishment survey.",
  "us-fed-funds": "The monthly average describes the rate experienced during September. The Markets policy table separately shows the October 22 daily effective rate; neither observation is a forecast of the next policy decision.",
  "ca-policy-rate": "The overnight target is the policy anchor for financing conditions. Weaker employment and higher headline inflation create a policy trade-off; this observation is not a forecast of the next decision.",
  "us-trade-balance": "The wider deficit describes the difference between nominal imports and exports. The headline alone cannot distinguish stronger domestic demand, price effects and changes in export competitiveness.",
  "ca-trade-balance": "The larger goods surplus improves the reported merchandise balance. It excludes services and should not be compared directly with the US goods-and-services deficit as if their coverage were identical.",
  "us-tax-receipts": "The higher annualised revenue pace is a fiscal inflow measure. A judgement about the deficit also requires expenditure data; this is neither one quarter's cash collected nor the budget balance.",
  "ca-tax-receipts": "The increase strengthens the reported federal revenue side. The series is total government revenue at an annualised pace, so it is broader than taxes alone and cannot establish an improvement in the budget balance.",
  "ca-gdp": "Quarterly growth accelerated, but the later monthly GDP and employment readings are less firm. The 0.82% figure is ordinary quarter-over-quarter growth and should not be compared directly with the annualised US rate.",
  "ca-gdp-monthly": "Flat July output points to a pause after June's increase. The monthly series provides a later view than Q2 GDP, but its July period still predates September's employment declines.",
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
