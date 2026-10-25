"use client";

// Client component because it hands AssetTable a price formatter, and a
// function cannot cross the server/client boundary.
import { COMMODITIES } from "@/lib/site-data";
import opecData from "@/lib/opec-data.json";
import { opecSnapshot } from "@/lib/opec-history.mjs";
import { INVESTING_COMMODITY_URL } from "@/lib/external-links";
import { formatNumber } from "@/lib/utils";
import AssetTable, { type AssetRow } from "@/components/markets/AssetTable";

export default function CommoditiesTable() {
  const rows: AssetRow[] = [...COMMODITIES].sort((a, b) => a.name.localeCompare(b.name, "en")).map((c) => ({
    key: c.symbol,
    icon: c.icon,
    name: c.name,
    sub: c.unit,
    value: c.value,
    range52w: c,
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
  const history = opecData.dailyObservations;
  const latest = opecSnapshot(history);
  rows.push({
    key: "opec-basket",
    icon: "🛢️",
    name: "OPEC Reference Basket",
    value: latest.value,
    range52w: { high52w: latest.high52w, low52w: latest.low52w, range52wAsOf: latest.asOf,
      range52wBasis: "daily-assessments", range52wSource: opecData.sourceLabel, range52wSourceUrl: opecData.sourceUrl },
    sub: `USD/bbl · ${latest.asOf} · daily history`,
    price: `$${formatNumber(latest.value)}`,
    dailyChange: latest.dailyChange,
    weekChange: latest.weekChange,
    monthChange: latest.monthChange,
    ytdChange: latest.ytdChange,
    sparkline: history.map((point) => point.value),
    datedHistory: history,
    href: "https://www.opec.org/opec-basket-price.html",
    hrefTitle: `${opecData.sourceLabel}; published daily basket assessments through ${latest.asOf}`,
  });
  rows.sort((a, b) => a.name.localeCompare(b.name, "en"));

  return (
    <AssetTable
      title="Commodities"
      subtitle="Futures and physical basket prices · OPEC uses published daily basket assessments · each quote retains its own observation date"
      rangeNote={`52W bars cover 52 calendar weeks. Futures: Yahoo Finance daily closes. OPEC: daily basket-price assessments from the site owner’s supplied export, through ${latest.asOf}, in USD/bbl.`}
      rows={rows}
      formatTooltip={(n) => (n >= 1000 ? formatNumber(n, 0) : formatNumber(n))}
    />
  );
}
