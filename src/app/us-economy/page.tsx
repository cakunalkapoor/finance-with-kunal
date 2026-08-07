import CountryEconomy from "@/components/dashboard/CountryEconomy";

export const metadata = {
  title: "US Economy — Finance with Kunal",
  description:
    "United States economic indicators: GDP, inflation, employment, Fed policy, yields, trade, retail sales and fiscal data.",
};

export default function USEconomyPage() {
  return (
    <CountryEconomy
      country="United States"
      eyebrow="United States"
      title="The US economy, one lens at a time."
      description="Growth, prices, jobs, policy rates, trade, fiscal flows, and business activity for the United States—each category read on its own terms, with consistent multi-year history."
      accent="emerald"
      counterpart={{ href: "/canada-economy", label: "Canada" }}
    />
  );
}
