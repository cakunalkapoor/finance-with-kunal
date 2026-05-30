import { EQUITY_INDICES, COMMODITIES } from "@/lib/mock-data";
import { formatNumber, formatChange } from "@/lib/utils";

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
      className="border-y overflow-hidden py-1.5"
      style={{
        background: "rgba(5,8,16,0.9)",
        borderColor: "var(--color-space-border)",
      }}
    >
      <div className="ticker-track flex gap-0">
        {doubled.map((item, i) => {
          const pos = item.change >= 0;
          return (
            <div
              key={i}
              className="flex items-center gap-2 px-4 flex-shrink-0 border-r"
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
                  fontFamily: "var(--font-space-mono), monospace",
                  color: "var(--color-text-primary)",
                  whiteSpace: "nowrap",
                }}
              >
                {item.value}
              </span>
              <span
                className="text-xs font-bold"
                style={{
                  fontFamily: "var(--font-space-mono), monospace",
                  color: pos ? "#10d98e" : "#f43f5e",
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
