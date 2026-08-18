"use client";

// Client component because it hands AssetTable a price formatter, and a
// function cannot cross the server/client boundary.
import { FOREX_RATES } from "@/lib/site-data";
import { INVESTING_FOREX_URL } from "@/lib/external-links";
import AssetTable, { type AssetRow } from "@/components/markets/AssetTable";

/** DXY is an index level; JPY and INR run to three figures; the rest are ~1.x. */
function formatRate(value: number, pair: string): string {
  if (pair === "DXY" || value >= 10) return value.toFixed(2);
  return value.toFixed(4);
}

export default function ForexTable() {
  const rows: AssetRow[] = FOREX_RATES.map((fx) => ({
    key: fx.symbol,
    icon: fx.icon,
    name: fx.name,
    sub: fx.pair,
    price: formatRate(fx.value, fx.pair),
    dailyChange: fx.dailyChange,
    weekChange: fx.weekChange,
    monthChange: fx.monthChange,
    ytdChange: fx.ytdChange,
    sparkline: fx.sparkline,
    daily: fx.daily,
    dailyDates: fx.dailyDates,
    href: INVESTING_FOREX_URL[fx.symbol],
    hrefTitle: `${fx.name} on Investing.com`,
  }));

  return (
    <AssetTable
      title="Currencies"
      subtitle="Spot rates vs USD · hover a chart for the value at that point · click a name for full detail on Investing.com"
      rows={rows}
      formatTooltip={(n) => (n >= 10 ? n.toFixed(2) : n.toFixed(4))}
    />
  );
}
