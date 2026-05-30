import { COMMODITIES } from "@/lib/mock-data";
import { formatNumber, formatChange, getChangeColor } from "@/lib/utils";
import SciFiCard, { CardHeader } from "@/components/ui/SciFiCard";

export default function CommoditiesGrid() {
  return (
    <SciFiCard>
      <CardHeader title="Commodities" subtitle="Spot Prices" />
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {COMMODITIES.map((c) => {
          const pos = c.dailyChange >= 0;
          return (
            <div
              key={c.symbol}
              className="rounded-lg p-3 flex flex-col gap-1 transition-all duration-200 hover:scale-[1.02]"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid var(--color-space-border)",
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xl">{c.icon}</span>
                <span
                  className={`text-xs px-1.5 py-0.5 rounded font-semibold ${getChangeColor(c.dailyChange)}`}
                  style={{
                    background: pos
                      ? "rgba(16,217,142,0.12)"
                      : "rgba(244,63,94,0.12)",
                    fontFamily: "var(--font-space-mono), monospace",
                  }}
                >
                  {formatChange(c.dailyChange)}
                </span>
              </div>

              <div
                className="font-bold text-lg"
                style={{
                  fontFamily: "var(--font-space-mono), monospace",
                  color: "var(--color-text-primary)",
                  letterSpacing: "-0.03em",
                }}
              >
                {c.symbol === "GC=F"
                  ? `$${formatNumber(c.value, 0)}`
                  : `$${formatNumber(c.value)}`}
              </div>

              <div
                className="font-semibold text-sm"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {c.name}
              </div>

              <div
                className="text-xs"
                style={{
                  color: "var(--color-text-muted)",
                  fontFamily: "var(--font-space-mono), monospace",
                }}
              >
                {c.unit}
              </div>

              <div
                className="mt-2 pt-2 grid grid-cols-3 gap-1 text-center"
                style={{ borderTop: "1px solid var(--color-space-border)" }}
              >
                {[
                  { label: "1W", val: c.weekChange },
                  { label: "1M", val: c.monthChange },
                  { label: "YTD", val: c.ytdChange },
                ].map(({ label, val }) => (
                  <div key={label}>
                    <div
                      className="text-xs"
                      style={{ color: "var(--color-text-muted)", fontSize: "9px" }}
                    >
                      {label}
                    </div>
                    <div
                      className={`text-xs font-semibold ${getChangeColor(val)}`}
                      style={{ fontFamily: "var(--font-space-mono), monospace", fontSize: "10px" }}
                    >
                      {formatChange(val)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </SciFiCard>
  );
}
