import MarketTicker from "@/components/markets/MarketTicker";
import EquityMarketsTable from "@/components/markets/EquityMarketsTable";
import BondsTable from "@/components/markets/BondsTable";
import CommoditiesGrid from "@/components/markets/CommoditiesGrid";
import CryptoGrid from "@/components/markets/CryptoGrid";
import ForexGrid from "@/components/markets/ForexGrid";
import MarketHeatmap from "@/components/markets/MarketHeatmap";
import PageHeader from "@/components/ui/PageHeader";

export const metadata = {
  title: "Markets — Finance with Kunal",
  description: "Global equity indices, government bond yields, commodities, and S&P 500 sector heatmap.",
};

export default function MarketsPage() {
  return (
    <>
      <MarketTicker />

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <PageHeader
          label="Market"
          labelColor="var(--color-neon-cyan)"
          title="Global Markets Dashboard"
          lastUpdated="Jul 12, 2026"
          nextUpdate="Jul 19, 2026"
        />

        <MarketHeatmap />
        <EquityMarketsTable />

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <BondsTable />
          <CommoditiesGrid />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <ForexGrid />
          <CryptoGrid />
        </div>
      </div>
    </>
  );
}
