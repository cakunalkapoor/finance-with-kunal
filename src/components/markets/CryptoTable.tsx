"use client";

// Client component because it hands AssetTable a price formatter, and a
// function cannot cross the server/client boundary.
import { CRYPTO } from "@/lib/site-data";
import { INVESTING_CRYPTO_URL } from "@/lib/external-links";
import AssetTable, { type AssetRow } from "@/components/markets/AssetTable";

function formatPrice(value: number): string {
  if (value >= 10000) return value.toLocaleString("en-US", { maximumFractionDigits: 0 });
  if (value >= 100)
    return value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return value.toFixed(4);
}

export default function CryptoTable() {
  const rows: AssetRow[] = CRYPTO.map((c) => ({
    key: c.symbol,
    icon: c.icon,
    name: c.name,
    sub: c.symbol,
    price: `$${formatPrice(c.value)}`,
    dailyChange: c.dailyChange,
    weekChange: c.weekChange,
    monthChange: c.monthChange,
    ytdChange: c.ytdChange,
    sparkline: c.sparkline,
    daily: c.daily,
    dailyDates: c.dailyDates,
    href: INVESTING_CRYPTO_URL[c.symbol],
    hrefTitle: `${c.name} on Investing.com`,
  }));

  return (
    <AssetTable
      title="Crypto"
      subtitle="Spot prices · USD · hover a chart for the value at that point · click a name for full detail on Investing.com"
      rows={rows}
      formatTooltip={formatPrice}
    />
  );
}
