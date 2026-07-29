import MacroSnapshot from "@/components/dashboard/MacroSnapshot";
import EconomicChart from "@/components/dashboard/EconomicChart";
import EconomicNotes from "@/components/dashboard/EconomicNotes";
import MarketTicker from "@/components/markets/MarketTicker";
import BriefingHero from "@/components/ui/BriefingHero";
import { FONT_MONO } from "@/lib/utils";
import { ECONOMIC_INDICATORS } from "@/lib/site-data";
import type { EconomicIndicator } from "@/types";

export const metadata = {
  title: "Global Economy — Finance with Kunal",
  description: "Global economic indicators: GDP, PMI, inflation, employment, and energy.",
};

const CATEGORIES: { id: EconomicIndicator["category"]; label: string; icon: string }[] = [
  { id: "pmi", label: "PMI", icon: "🌐" },
  { id: "growth", label: "Growth", icon: "📈" },
  { id: "employment", label: "Employment", icon: "👷" },
  { id: "inflation", label: "Inflation", icon: "💹" },
  { id: "energy", label: "Energy", icon: "⚡" },
];

// These indicators are dedicated to the /us-canada page; keep the global Economy
// dashboard focused on its original curated (US + Asia) set.
const US_CANADA_ONLY = new Set([
  "us-payrolls", "us-fed-funds", "us-10y", "us-trade-balance", "us-tax-receipts",
  "us-mfg-pmi", "us-services-pmi",
  "ca-gdp", "ca-cpi", "ca-unemployment", "ca-payrolls",
  "ca-policy-rate", "ca-10y", "ca-trade-balance", "ca-tax-receipts",
  "ca-mfg-pmi", "ca-services-pmi", "us-retail-sales", "ca-retail-sales",
]);

export default function DashboardPage() {
  return (
    <>
      <MarketTicker />

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        <BriefingHero
          eyebrow="Global economy"
          title="The macro story, organized."
          description="Growth, inflation, employment, business activity, and energy indicators in one evidence-led view—so you can separate the current signal from the prevailing narrative."
          accent="indigo"
          stats={[
            { label: "Pillars", value: "5", detail: "Macro categories" },
            { label: "Format", value: "2–3Y", detail: "Historical context" },
            { label: "Read", value: "Fast", detail: "Notes included" },
          ]}
        />

        <MacroSnapshot />

        {CATEGORIES.map(({ id, label, icon }) => {
          const indicators = ECONOMIC_INDICATORS.filter(
            (ind) => ind.category === id && !US_CANADA_ONLY.has(ind.id)
          );
          if (indicators.length === 0) return null;
          return (
            <section key={id}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-lg">{icon}</span>
                <h2
                  className="font-bold text-sm tracking-widest uppercase"
                  style={{
                    fontFamily: FONT_MONO,
                    color: "var(--color-text-secondary)",
                    letterSpacing: "0.12em",
                  }}
                >
                  {label}
                </h2>
                <div
                  className="flex-1 h-px"
                  style={{ background: "var(--color-space-border)" }}
                />
              </div>

              <div
                className={`grid gap-4 ${
                  indicators.length === 1
                    ? "grid-cols-1 max-w-xl"
                    : "grid-cols-1 lg:grid-cols-2"
                }`}
              >
                {indicators.map((ind) => (
                  <EconomicChart key={ind.id} indicator={ind} />
                ))}
              </div>
            </section>
          );
        })}

        <EconomicNotes filter={(ind) => !US_CANADA_ONLY.has(ind.id)} />
      </div>
    </>
  );
}
