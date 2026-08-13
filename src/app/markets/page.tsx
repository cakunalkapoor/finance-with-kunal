import MarketTicker from "@/components/markets/MarketTicker";
import EquityMarketsTable from "@/components/markets/EquityMarketsTable";
import BondsTable from "@/components/markets/BondsTable";
import CommoditiesTable from "@/components/markets/CommoditiesTable";
import CryptoTable from "@/components/markets/CryptoTable";
import ForexTable from "@/components/markets/ForexTable";
import ETFTable from "@/components/markets/ETFTable";
import MarketHeatmap from "@/components/markets/MarketHeatmap";
import BriefingHero from "@/components/ui/BriefingHero";
import Reveal from "@/components/ui/Reveal";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Markets",
  description:
    "Weekly cross-asset snapshot: global equity indices, government bond yields, commodities, forex and crypto, plus constituent-level sector heatmaps for 11 indices from the S&P 500 to the Hang Seng.",
  path: "/markets",
  keywords: [
    "global equity indices",
    "government bond yields",
    "commodity prices",
    "S&P 500 sector heatmap",
    "TSX",
    "NIFTY 50",
    "forex rates",
  ],
});

export default function MarketsPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Markets", path: "/markets" }]} />
      <MarketTicker />

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-5">
        <BriefingHero
          eyebrow="Markets briefing"
          title="See the market before chasing the move."
          description="A cross-asset view of equities, rates, commodities, currencies, crypto, and sector leadership—organized to surface direction, breadth, and risk appetite quickly."
          accent="violet"
          stats={[
            { label: "Coverage", value: "6", detail: "Cross-asset views" },
            { label: "Cadence", value: "7D", detail: "Weekly refresh" },
            { label: "Focus", value: "360°", detail: "Global context" },
          ]}
        />

        <Reveal>
          <MarketHeatmap />
        </Reveal>
        {/* Two independently-packing columns rather than three two-up rows.
            In a row grid every row is as tall as its taller card, so the
            shorter one leaves dead space beneath it — ETFs (1612px) next to
            Commodities (827px) left ~780px empty. Here each column stacks
            flush and the split is chosen so both finish within ~100px of each
            other: 2843px left vs 2744px right.

            `items-start` is what stops the grid stretching a column to match
            its neighbour. Below xl the two columns stack, giving the reading
            order equities → ETFs → rates → commodities → FX → crypto.

            Re-balance if a table's row count changes materially. */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 items-start">
          <div className="space-y-5">
            <Reveal>
              <EquityMarketsTable />
            </Reveal>
            <Reveal>
              <ETFTable />
            </Reveal>
          </div>

          <div className="space-y-5">
            <Reveal delay={100}>
              <BondsTable />
            </Reveal>
            <Reveal delay={100}>
              <CommoditiesTable />
            </Reveal>
            <Reveal>
              <ForexTable />
            </Reveal>
            <Reveal>
              <CryptoTable />
            </Reveal>
          </div>
        </div>
      </div>
    </>
  );
}
