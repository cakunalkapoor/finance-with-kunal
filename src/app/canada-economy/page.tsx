import CountryEconomy from "@/components/dashboard/CountryEconomy";

export const metadata = {
  title: "Canada Economy — Finance with Kunal",
  description:
    "Canadian economic indicators: GDP, CPI, employment, Bank of Canada policy rate, yields, trade, retail sales and fiscal data.",
};

export default function CanadaEconomyPage() {
  return (
    <CountryEconomy
      country="Canada"
      eyebrow="Canada"
      title="The Canadian economy, one lens at a time."
      description="Growth, prices, jobs, Bank of Canada policy, trade, fiscal flows, and business activity for Canada—each category read on its own terms, with consistent multi-year history."
      accent="indigo"
      counterpart={{ href: "/us-economy", label: "the US" }}
    />
  );
}
