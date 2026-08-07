import Link from "next/link";
import { ArrowRight } from "lucide-react";
import EconomicChart from "@/components/dashboard/EconomicChart";
import EconomicNotes from "@/components/dashboard/EconomicNotes";
import MarketTicker from "@/components/markets/MarketTicker";
import BriefingHero from "@/components/ui/BriefingHero";
import { FONT_MONO } from "@/lib/utils";
import { ECONOMIC_INDICATORS } from "@/lib/site-data";
import type { EconomicIndicator } from "@/types";

// Shared by /us-economy and /canada-economy — one country per page so each
// category reads as a single narrative instead of a two-country comparison.
const CATEGORIES: { id: EconomicIndicator["category"]; label: string; icon: string }[] = [
  { id: "growth", label: "Growth", icon: "📈" },
  { id: "inflation", label: "Inflation", icon: "💹" },
  { id: "employment", label: "Employment", icon: "👷" },
  { id: "consumption", label: "Consumption", icon: "🛒" },
  { id: "rates", label: "Rates & Yields", icon: "🏦" },
  { id: "trade", label: "Trade", icon: "🚢" },
  { id: "fiscal", label: "Fiscal", icon: "🏛️" },
  { id: "pmi", label: "PMI", icon: "🌐" },
];

const CATEGORY_IDS = new Set(CATEGORIES.map((c) => c.id));

interface CountryEconomyProps {
  country: string;
  /** Short label used in the hero eyebrow and the notes subtitle. */
  eyebrow: string;
  title: string;
  description: string;
  accent: "violet" | "indigo" | "emerald";
  /** Link to the other country's page so the pair stays one click apart. */
  counterpart: { href: string; label: string };
}

export default function CountryEconomy({
  country,
  eyebrow,
  title,
  description,
  accent,
  counterpart,
}: CountryEconomyProps) {
  // Notes and charts share one predicate so the page never annotates an
  // indicator it did not plot.
  const onPage = (ind: EconomicIndicator) =>
    ind.country === country && CATEGORY_IDS.has(ind.category);
  const indicators = ECONOMIC_INDICATORS.filter(onPage);
  const categoriesShown = CATEGORIES.filter(({ id }) =>
    indicators.some((ind) => ind.category === id)
  );

  return (
    <>
      <MarketTicker />

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        <BriefingHero
          eyebrow={eyebrow}
          title={title}
          description={description}
          accent={accent}
          stats={[
            { label: "Indicators", value: String(indicators.length), detail: "Charted series" },
            { label: "Lenses", value: String(categoriesShown.length), detail: "Economic themes" },
            { label: "History", value: "2–3Y", detail: "Per-series context" },
          ]}
        />

        <Link
          href={counterpart.href}
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-bold uppercase"
          style={{
            fontFamily: FONT_MONO,
            letterSpacing: "0.1em",
            color: "var(--color-text-secondary)",
            border: "1px solid var(--color-space-border)",
            background: "var(--color-space-card)",
          }}
        >
          Compare with {counterpart.label}
          <ArrowRight size={13} />
        </Link>

        {categoriesShown.map(({ id, label, icon }) => {
          const inCategory = indicators.filter((ind) => ind.category === id);
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
                  inCategory.length === 1 ? "grid-cols-1 max-w-xl" : "grid-cols-1 lg:grid-cols-2"
                }`}
              >
                {inCategory.map((ind) => (
                  <EconomicChart key={ind.id} indicator={ind} />
                ))}
              </div>
            </section>
          );
        })}

        <EconomicNotes
          filter={onPage}
          subtitle={`Auto-generated ${eyebrow} macro notes · Jul 2026`}
        />
      </div>
    </>
  );
}
