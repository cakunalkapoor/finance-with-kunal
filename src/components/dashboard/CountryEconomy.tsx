import Link from "next/link";
import { ArrowRight } from "lucide-react";
import EconomicChart from "@/components/dashboard/EconomicChart";
import EconomicNotes from "@/components/dashboard/EconomicNotes";
import YieldCurveChart from "@/components/dashboard/YieldCurveChart";
import MarketTicker from "@/components/markets/MarketTicker";
import BriefingHero from "@/components/ui/BriefingHero";
import Reveal from "@/components/ui/Reveal";
import { FONT_MONO } from "@/lib/utils";
import { ECONOMIC_INDICATORS, YIELD_CURVES } from "@/lib/site-data";
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
  // The curve card lives in Rates & Yields, so that section can appear on the
  // strength of the curve alone even if no rate indicator matched.
  const curve = YIELD_CURVES.find((yc) => yc.country === country);
  const categoriesShown = CATEGORIES.filter(({ id }) =>
    indicators.some((ind) => ind.category === id) || (id === "rates" && curve)
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
          // CPI, GDP, unemployment: monthly/quarterly, not weekly.
          status="updated"
          stats={[
            // The curve is a charted card too, so it counts here — otherwise the
            // hero undercounts what the reader can actually see on the page.
            { label: "Indicators", value: String(indicators.length + (curve ? 1 : 0)), detail: "Charted series" },
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
          const curveHere = id === "rates" ? curve : undefined;
          // The curve occupies a grid cell, so it counts toward the one-vs-many
          // decision that picks the single-column layout.
          const cellCount = inCategory.length + (curveHere ? 1 : 0);
          return (
            <section key={id}>
              <Reveal className="flex items-center gap-3 mb-4">
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
              </Reveal>

              <div
                className={`grid gap-4 ${
                  cellCount === 1 ? "grid-cols-1 max-w-xl" : "grid-cols-1 lg:grid-cols-2"
                }`}
              >
                {curveHere && (
                  <Reveal>
                    <YieldCurveChart curve={curveHere} />
                  </Reveal>
                )}
                {inCategory.map((ind, index) => (
                  <Reveal key={ind.id} delay={((index + (curveHere ? 1 : 0)) % 2) * 100}>
                    <EconomicChart indicator={ind} />
                  </Reveal>
                ))}
              </div>
            </section>
          );
        })}

        <Reveal>
          <EconomicNotes
            filter={onPage}
            subtitle={`Auto-generated ${eyebrow} macro notes · Jul 2026`}
          />
        </Reveal>
      </div>
    </>
  );
}
