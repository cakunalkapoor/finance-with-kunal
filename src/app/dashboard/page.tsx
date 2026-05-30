import MacroSnapshot from "@/components/dashboard/MacroSnapshot";
import EconomicChart from "@/components/dashboard/EconomicChart";
import EconomicNotes from "@/components/dashboard/EconomicNotes";
import MarketTicker from "@/components/markets/MarketTicker";
import { ECONOMIC_INDICATORS } from "@/lib/mock-data";
import type { EconomicIndicator } from "@/types";

export const metadata = {
  title: "Economic Dashboard — Finance with Kunal",
  description: "Global economic indicators: GDP, PMI, inflation, trade, shipping, and energy.",
};

const CATEGORIES: { id: EconomicIndicator["category"]; label: string; icon: string }[] = [
  { id: "growth", label: "Growth", icon: "📈" },
  { id: "employment", label: "Employment", icon: "👷" },
  { id: "manufacturing", label: "Manufacturing", icon: "🏭" },
  { id: "services", label: "Services", icon: "🏦" },
  { id: "inflation", label: "Inflation", icon: "💹" },
  { id: "trade", label: "Global Trade", icon: "🌍" },
  { id: "energy", label: "Energy", icon: "⚡" },
  { id: "shipping", label: "Shipping", icon: "🚢" },
];

export default function DashboardPage() {
  return (
    <>
      <MarketTicker />

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div
              className="h-4 w-0.5 rounded"
              style={{ background: "var(--color-neon-purple)" }}
            />
            <span
              className="text-xs font-bold tracking-widest uppercase"
              style={{
                fontFamily: "var(--font-space-mono), monospace",
                color: "var(--color-neon-purple)",
                letterSpacing: "0.14em",
              }}
            >
              Economic Intelligence
            </span>
          </div>
          <h1
            className="text-2xl sm:text-3xl font-bold"
            style={{ color: "var(--color-text-primary)", letterSpacing: "-0.02em" }}
          >
            Global Economic Dashboard
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
            Key leading indicators tracking the pulse of the global economy
          </p>
        </div>

        {/* Macro snapshot — top */}
        <MacroSnapshot />

        {/* Indicators by category */}
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
                    fontFamily: "var(--font-space-mono), monospace",
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

        {/* Auto-generated notes */}
        <EconomicNotes />
      </div>
    </>
  );
}
