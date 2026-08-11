import MarketTicker from "@/components/markets/MarketTicker";
import EquityMarketsTable from "@/components/markets/EquityMarketsTable";
import BondsTable from "@/components/markets/BondsTable";
import CommoditiesGrid from "@/components/markets/CommoditiesGrid";
import CryptoGrid from "@/components/markets/CryptoGrid";
import ForexGrid from "@/components/markets/ForexGrid";
import MarketHeatmap from "@/components/markets/MarketHeatmap";
import BriefingHero from "@/components/ui/BriefingHero";
import Reveal from "@/components/ui/Reveal";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Markets",
  description:
    "Weekly cross-asset snapshot: global equity indices, government bond yields, commodities, forex and crypto, plus S&P 500, TSX and NIFTY sector heatmaps.",
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

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
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
        <Reveal>
          <EquityMarketsTable />
        </Reveal>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <Reveal>
            <BondsTable />
          </Reveal>
          <Reveal delay={100}>
            <CommoditiesGrid />
          </Reveal>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <Reveal>
            <ForexGrid />
          </Reveal>
          <Reveal delay={100}>
            <CryptoGrid />
          </Reveal>
        </div>
      </div>
    </>
  );
}
