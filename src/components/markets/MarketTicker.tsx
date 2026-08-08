import { EQUITY_INDICES, COMMODITIES } from "@/lib/site-data";
import { formatNumber, formatChange, FONT_MONO } from "@/lib/utils";

export default function MarketTicker() {
  const items = [
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
  ];

  // Double for seamless loop
  const doubled = [...items, ...items];

  return (
    <div
      className="ticker-mask overflow-hidden border-b py-2"
      style={{
        background: "var(--color-space-black)",
        borderColor: "var(--color-space-border)",
      }}
    >
      <div className="ticker-track flex gap-0">
        {doubled.map((item, i) => {
          const pos = item.change >= 0;
          return (
            <div
              key={i}
                className="flex flex-shrink-0 items-center gap-2 border-r px-5"
              style={{ borderColor: "var(--color-space-border)" }}
            >
              <span
                className="text-xs font-semibold"
                  style={{ color: "var(--color-text-secondary)", whiteSpace: "nowrap" }}
              >
                {item.label}
              </span>
              <span
                className="text-xs font-bold"
                style={{
                  fontFamily: FONT_MONO,
                  color: "var(--color-text-primary)",
                  whiteSpace: "nowrap",
                }}
              >
                {item.value}
              </span>
              <span
                className="text-xs font-bold"
                style={{
                  fontFamily: FONT_MONO,
                  color: pos ? "var(--color-market-up)" : "var(--color-market-down)",
                  whiteSpace: "nowrap",
                }}
              >
                {formatChange(item.change)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
