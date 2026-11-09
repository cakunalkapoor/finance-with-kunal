import { EQUITY_INDICES, COMMODITIES } from "@/lib/site-data";
import { formatNumber, formatChange, FONT_MONO } from "@/lib/utils";

type TickerItem = { label: string; value: string; change: number };

const marketItems: TickerItem[] = [
  ...EQUITY_INDICES.map((i) => ({
    label: i.name,
    value: formatNumber(i.value, i.value > 10000 ? 0 : 2),
    change: i.dailyChange,
  })),
  ...COMMODITIES.map((c) => ({
    label: c.name,
    value: `$${formatNumber(c.value, c.symbol === "GC=F" ? 0 : 2)}`,
    change: c.dailyChange,
  })),
].sort((a, b) => a.label.localeCompare(b.label, "en"));

export default function MarketTicker({ items = marketItems, label }: {
  items?: readonly TickerItem[];
  label?: string;
}) {
  if (items.length === 0) return null;

  // Double for seamless loop
  const doubled = [...items, ...items];

  return (
    <section
      aria-label={label ?? "Market ticker"}
      className="flex items-center border-b border-space-border bg-space-black py-2"
    >
      {label && (
        <span className="shrink-0 whitespace-nowrap border-r border-space-border px-3 text-[10px] font-bold uppercase tracking-wide text-text-secondary sm:px-5">
          {label}
        </span>
      )}
      <div className="ticker-mask min-w-0 flex-1 overflow-hidden">
        <div className="ticker-track flex w-max" style={{ animationDuration: `${items.length * 2.5}s` }}>
          {doubled.map((item, i) => (
            <div
              key={i}
              aria-hidden={i >= items.length || undefined}
              className="flex shrink-0 items-center gap-2 whitespace-nowrap border-r border-space-border px-5 text-xs"
            >
              <span className="font-semibold text-text-secondary">{item.label}</span>
              <span className="font-bold text-text-primary" style={{ fontFamily: FONT_MONO }}>
                {item.value}
              </span>
              <span
                className={`font-bold ${item.change >= 0 ? "text-market-up" : "text-market-down"}`}
                style={{ fontFamily: FONT_MONO }}
              >
                {formatChange(item.change)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
