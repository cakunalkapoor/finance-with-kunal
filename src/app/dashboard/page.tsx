import EconomyHeader from "@/components/dashboard/EconomyHeader";
import EconomyDashboard from "@/components/dashboard/EconomyDashboard";
import { ECONOMIC_INDICATORS } from "@/lib/site-data";
import { economyIndicators } from "@/lib/economy-view";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Global Economy",
  description:
    "Global economic indicators updated weekly: GDP growth, PMI, inflation, employment and energy, with multi-year history and plain-English notes.",
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
      <BreadcrumbJsonLd items={[{ name: "Global Economy", path: "/dashboard" }]} />
      <div className="mx-auto max-w-screen-2xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <EconomyHeader scope="global" eyebrow="Global economy" title="The economy, at a glance."
          description="Business activity, growth, labour, inflation and energy — with the context behind each release." />
        <EconomyDashboard key="global" scope="global" indicators={economyIndicators(ECONOMIC_INDICATORS, "global")} />
      </div>
    </>
  );
}
