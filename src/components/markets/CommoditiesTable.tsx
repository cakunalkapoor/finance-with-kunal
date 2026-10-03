"use client";

// Client component because it hands AssetTable a price formatter, and a
// function cannot cross the server/client boundary.
import { COMMODITIES } from "@/lib/site-data";
import opecData from "@/lib/opec-data.json";
import { INVESTING_COMMODITY_URL } from "@/lib/external-links";
import { formatNumber } from "@/lib/utils";
import AssetTable, { type AssetRow } from "@/components/markets/AssetTable";

export default function CommoditiesTable() {
  const rows: AssetRow[] = [...COMMODITIES].sort((a, b) => a.name.localeCompare(b.name, "en")).map((c) => ({
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
    daily: c.daily,
    dailyDates: c.dailyDates,
    href: INVESTING_COMMODITY_URL[c.symbol],
    hrefTitle: `${c.name} on Investing.com`,
  }));
  const history = opecData.timeSeries;
  const latest = history.at(-1)!;
  const priorMonth = history.at(-2)!;
  const yearStart = history.findLast((point) => point.date < `${latest.date.slice(0, 4)}-01-01`)!;
  rows.push({
    key: "opec-basket",
    icon: "🛢️",
    name: "OPEC Reference Basket",
    sub: `USD/bbl · ${latest.date} · monthly history`,
    price: `$${formatNumber(latest.value)}`,
    dailyChange: null,
    weekChange: null,
    monthChange: (latest.value / priorMonth.value - 1) * 100,
    ytdChange: (latest.value / yearStart.value - 1) * 100,
    sparkline: history.map((point) => point.value),
    datedHistory: history,
    href: "https://www.opec.org/opec-basket-price.html",
    hrefTitle: "OPEC Reference Basket official source; monthly snapshots, not averages",
  });
  rows.sort((a, b) => a.name.localeCompare(b.name, "en"));

  return (
    <AssetTable
      title="Commodities"
      subtitle="Futures and physical basket prices · OPEC uses monthly snapshots; daily and weekly moves unavailable · click a name for source detail"
      rows={rows}
      formatTooltip={(n) => (n >= 1000 ? formatNumber(n, 0) : formatNumber(n))}
    />
  );
}
