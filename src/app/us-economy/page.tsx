import CountryEconomy from "@/components/dashboard/CountryEconomy";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "US Economy",
  description:
    "United States economic indicators tracked weekly: GDP, CPI inflation, payrolls and unemployment, the Federal Reserve policy rate, Treasury yields, trade, retail sales and fiscal data.",
  path: "/us-economy",
  keywords: [
    "US economy",
    "US GDP growth",
    "US inflation",
    "CPI",
    "nonfarm payrolls",
    "Federal Reserve policy rate",
    "10-year Treasury yield",
  ],
});

export default function USEconomyPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "US Economy", path: "/us-economy" }]} />
      <CountryEconomy
        country="United States"
        eyebrow="United States"
        title="The US economy, one lens at a time."
        description="Growth, prices, jobs, policy rates, trade, fiscal flows, and business activity for the United States—each category read on its own terms, with consistent multi-year history."
        accent="emerald"
        counterpart={{ href: "/canada-economy", label: "Canada" }}
      />
    </>
  );
}
