import CountryEconomy from "@/components/dashboard/CountryEconomy";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Canada Economy",
  description:
    "Canadian economic indicators tracked weekly: GDP, CPI inflation, employment, the Bank of Canada policy rate, Government of Canada bond yields, trade, retail sales and fiscal data.",
  path: "/canada-economy",
  keywords: [
    "Canada economy",
    "Canadian GDP",
    "Canada inflation",
    "Bank of Canada policy rate",
    "Canada unemployment rate",
    "Government of Canada bond yields",
  ],
});

export default function CanadaEconomyPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Canada Economy", path: "/canada-economy" }]} />
      <CountryEconomy
        country="Canada"
        eyebrow="Canada"
        title="The Canadian economy, one lens at a time."
        description="Growth, prices, jobs, Bank of Canada policy, trade, fiscal flows, and business activity for Canada—each category read on its own terms, with consistent multi-year history."
        accent="indigo"
        counterpart={{ href: "/us-economy", label: "the US" }}
      />
    </>
  );
}
