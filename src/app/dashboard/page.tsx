import MacroSnapshot from "@/components/dashboard/MacroSnapshot";
import EconomicChart from "@/components/dashboard/EconomicChart";
import EconomicNotes from "@/components/dashboard/EconomicNotes";
import MarketTicker from "@/components/markets/MarketTicker";
import PageHeader from "@/components/ui/PageHeader";
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

export default function DashboardPage() {
  return (
    <>
      <MarketTicker />

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        <PageHeader
          label="Global Economy"
          labelColor="var(--color-neon-purple)"
          title="Global Economic Dashboard"
          lastUpdated="Jun 13, 2026"
          nextUpdate="Jun 21, 2026"
        />

        <MacroSnapshot />

        {CATEGORIES.map(({ id, label, icon }) => {
          const indicators = ECONOMIC_INDICATORS.filter((ind) => ind.category === id);
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

        <EconomicNotes />
      </div>
    </>
  );
}
