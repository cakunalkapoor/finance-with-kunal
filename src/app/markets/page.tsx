import MarketTicker from "@/components/markets/MarketTicker";
import EquityMarketsTable from "@/components/markets/EquityMarketsTable";
import BondsTable from "@/components/markets/BondsTable";
import CommoditiesGrid from "@/components/markets/CommoditiesGrid";
import MarketHeatmap from "@/components/markets/MarketHeatmap";

export const metadata = {
  title: "Markets — Finance with Kunal",
  description: "Global equity indices, government bond yields, commodities, and S&P 500 sector heatmap.",
};

export default function MarketsPage() {
  return (
    <>
      <MarketTicker />

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Page header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div
              className="h-4 w-0.5 rounded"
              style={{ background: "var(--color-neon-cyan)" }}
            />
            <span
              className="text-xs font-bold tracking-widest uppercase"
              style={{
                fontFamily: "var(--font-space-mono), monospace",
                color: "var(--color-neon-cyan)",
                letterSpacing: "0.14em",
              }}
            >
              Live Markets
            </span>
          </div>
          <h1
            className="text-2xl sm:text-3xl font-bold"
            style={{ color: "var(--color-text-primary)", letterSpacing: "-0.02em" }}
          >
            Global Markets Dashboard
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-secondary)" }}>
            Top equity indices, government bonds, commodities, and sector performance
          </p>
        </div>

        {/* Heatmap — centerpiece */}
        <MarketHeatmap />

        {/* Equity indices table */}
        <EquityMarketsTable />

        {/* Two columns: bonds + commodities */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <BondsTable />
          <CommoditiesGrid />
        </div>
      </div>
    </>
  );
}
