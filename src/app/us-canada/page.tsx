import EconomicChart from "@/components/dashboard/EconomicChart";
import EconomicNotes from "@/components/dashboard/EconomicNotes";
import MarketTicker from "@/components/markets/MarketTicker";
import BriefingHero from "@/components/ui/BriefingHero";
import { FONT_MONO } from "@/lib/utils";
import { ECONOMIC_INDICATORS } from "@/lib/site-data";
import type { EconomicIndicator } from "@/types";

export const metadata = {
  title: "US & Canada Economy — Finance with Kunal",
  description:
    "Side-by-side US and Canada economic indicators: GDP, inflation, employment, central-bank rates, trade and fiscal data.",
};

// North America focus: only United States + Canada indicators.
const NA_COUNTRIES = new Set(["United States", "Canada"]);

const CATEGORIES: { id: EconomicIndicator["category"]; label: string; icon: string }[] = [
  { id: "growth", label: "Growth", icon: "📈" },
  { id: "inflation", label: "Inflation", icon: "💹" },
  { id: "consumption", label: "Consumption", icon: "🛒" },
  { id: "employment", label: "Employment", icon: "👷" },
  { id: "rates", label: "Rates & Yields", icon: "🏦" },
  { id: "trade", label: "Trade", icon: "🚢" },
  { id: "fiscal", label: "Fiscal", icon: "🏛️" },
  { id: "pmi", label: "PMI", icon: "🌐" },
];

// US cards first, then Canada — keeps each category visually grouped by country.
const countryRank = (c: string) => (c === "United States" ? 0 : 1);

export default function USCanadaPage() {
  const naIndicators = ECONOMIC_INDICATORS.filter((ind) => NA_COUNTRIES.has(ind.country));

  return (
    <>
      <MarketTicker />

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        <BriefingHero
          eyebrow="North America"
          title="Two economies. One comparative view."
          description="Compare the United States and Canada across growth, prices, jobs, rates, trade, fiscal flows, consumption, and business activity—with consistent charts and country-first ordering."
          accent="emerald"
          stats={[
            { label: "Economies", value: "2", detail: "US and Canada" },
            { label: "Lenses", value: "8", detail: "Economic themes" },
            { label: "Layout", value: "1:1", detail: "Side-by-side read" },
          ]}
        />

        {CATEGORIES.map(({ id, label, icon }) => {
          const indicators = naIndicators
            .filter((ind) => ind.category === id)
            .sort((a, b) => countryRank(a.country) - countryRank(b.country));
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
                <div className="flex-1 h-px" style={{ background: "var(--color-space-border)" }} />
              </div>

              <div
                className={`grid gap-4 ${
                  indicators.length === 1 ? "grid-cols-1 max-w-xl" : "grid-cols-1 lg:grid-cols-2"
                }`}
              >
                {indicators.map((ind) => (
                  <EconomicChart key={ind.id} indicator={ind} />
                ))}
              </div>
            </section>
          );
        })}

        <EconomicNotes
          filter={(ind) => NA_COUNTRIES.has(ind.country)}
          subtitle="Auto-generated US & Canada macro notes · Jul 2026"
        />
      </div>
    </>
  );
}
