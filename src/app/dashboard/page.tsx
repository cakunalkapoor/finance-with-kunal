import { Suspense } from "react";
import EconomyExperience, { EconomyView } from "@/components/dashboard/EconomyExperience";
import { ECONOMIC_INDICATORS, YIELD_CURVES } from "@/lib/site-data";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Economy — Global, US & Canada",
  description:
    "Global, US and Canadian economic indicators in one dashboard: GDP, PMI, inflation, employment, policy rates, yield curves and energy, with sourced history and commentary.",
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
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Economy", path: "/dashboard" }]} />
      <Suspense fallback={<EconomyView indicators={ECONOMIC_INDICATORS} curves={YIELD_CURVES} />}>
        <EconomyExperience indicators={ECONOMIC_INDICATORS} curves={YIELD_CURVES} />
      </Suspense>
    </>
  );
}
