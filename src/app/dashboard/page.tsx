import { Suspense } from "react";
import EconomyExperience, { EconomyView } from "@/components/dashboard/EconomyExperience";
import { ECONOMIC_INDICATORS, YIELD_CURVES } from "@/lib/site-data";
import { INTERNATIONAL_INDICATORS, INTERNATIONAL_UPDATED_LABEL } from "@/lib/international-economy";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Economy — Global Economic Dashboard",
  description:
    "Explore the US, Canada, euro area, UK, Japan, China, India, Australia, Germany, France and South Korea: sourced GDP, inflation, labour and business activity in one dashboard.",
  path: "/dashboard",
  keywords: [
    "global economy",
    "economic indicators",
    "GDP growth",
    "manufacturing PMI",
    "inflation rate",
    "unemployment rate",
    "macro dashboard",
  ],
});

export default function DashboardPage() {
  const indicators = [...ECONOMIC_INDICATORS, ...INTERNATIONAL_INDICATORS];
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Economy", path: "/dashboard" }]} />
      <Suspense fallback={<EconomyView indicators={indicators} curves={YIELD_CURVES} additionalUpdatedLabel={INTERNATIONAL_UPDATED_LABEL} />}>
        <EconomyExperience indicators={indicators} curves={YIELD_CURVES} additionalUpdatedLabel={INTERNATIONAL_UPDATED_LABEL} />
      </Suspense>
    </>
  );
}
