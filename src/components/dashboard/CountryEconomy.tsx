import EconomyHeader from "@/components/dashboard/EconomyHeader";
import EconomyDashboard from "@/components/dashboard/EconomyDashboard";
import { ECONOMIC_INDICATORS, YIELD_CURVES } from "@/lib/site-data";
import { economyIndicators } from "@/lib/economy-view";

export default function CountryEconomy({ country, eyebrow, title, description }: {
  country: "United States" | "Canada"; eyebrow: string; title: string; description: string;
}) {
  const scope = country === "United States" ? "us" : "canada";
  return (
    <div className="mx-auto max-w-screen-2xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <EconomyHeader scope={scope} eyebrow={eyebrow} title={title} description={description} />
      <EconomyDashboard key={scope} scope={scope} indicators={economyIndicators(ECONOMIC_INDICATORS, scope)} curve={YIELD_CURVES.find(c => c.country === country)} />
    </div>
  );
}
