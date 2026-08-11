"use client";

// Client component because it hands AssetTable a price formatter, and a
// function cannot cross the server/client boundary.
import { COMMODITIES } from "@/lib/site-data";
import { INVESTING_COMMODITY_URL } from "@/lib/external-links";
import { formatNumber } from "@/lib/utils";
import AssetTable, { type AssetRow } from "@/components/markets/AssetTable";

export default function CommoditiesTable() {
  const rows: AssetRow[] = COMMODITIES.map((c) => ({
    key: c.symbol,
    icon: c.icon,
    name: c.name,
    sub: c.unit,
    // Gold and iron ore run to four figures; soybeans and copper don't.
    price: c.value >= 1000 ? `$${formatNumber(c.value, 0)}` : `$${formatNumber(c.value)}`,
    dailyChange: c.dailyChange,
    weekChange: c.weekChange,
    monthChange: c.monthChange,
    ytdChange: c.ytdChange,
    sparkline: c.sparkline,
    href: INVESTING_COMMODITY_URL[c.symbol],
    hrefTitle: `${c.name} on Investing.com`,
  }));

  return (
    <AssetTable
      title="Commodities"
      subtitle="Spot prices · hover a chart for the value at that point · click a name for full detail on Investing.com"
      rows={rows}
      formatTooltip={(n) => (n >= 1000 ? formatNumber(n, 0) : formatNumber(n))}
    />
  );
}
