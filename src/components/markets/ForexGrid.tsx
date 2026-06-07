import { FOREX_RATES } from "@/lib/site-data";
import { formatChange, getChangeColor, FONT_MONO } from "@/lib/utils";
import SciFiCard, { CardHeader } from "@/components/ui/SciFiCard";

function formatRate(value: number, pair: string): string {
  if (pair === "DXY")     return value.toFixed(2);
  if (value >= 10)        return value.toFixed(2);
  return value.toFixed(4);
}

export default function ForexGrid() {
  return (
    <SciFiCard>
      <CardHeader title="Currencies" subtitle="Spot Rates vs USD" />
      <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
        {FOREX_RATES.map((fx) => {
          const pos = fx.dailyChange >= 0;
          return (
            <div
              key={fx.symbol}
              className="rounded-lg p-4 flex flex-col gap-1.5 transition-all duration-200 hover:scale-[1.02]"
              style={{
                background: "rgba(124,58,237,0.025)",
                border: "1px solid var(--color-space-border)",
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-lg">{fx.icon}</span>
                <span
                  className={`text-xs px-1.5 py-0.5 rounded font-semibold ${getChangeColor(fx.dailyChange)}`}
                  style={{
                    background: pos
                      ? "rgba(52,211,153,0.11)"
                      : "rgba(251,113,133,0.11)",
                    fontFamily: FONT_MONO,
                  }}
                >
                  {formatChange(fx.dailyChange)}
                </span>
              </div>

              <div
                className="font-bold text-lg"
                style={{
                  fontFamily: FONT_MONO,
                  color: "var(--color-text-primary)",
                  letterSpacing: "-0.03em",
                }}
              >
                {formatRate(fx.value, fx.pair)}
              </div>

              <div
                className="font-semibold text-sm"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {fx.name}
              </div>

              <div
                className="text-xs"
                style={{
                  color: "var(--color-text-muted)",
                  fontFamily: FONT_MONO,
                }}
              >
                {fx.pair}
              </div>

              <div
                className="mt-2 pt-2 grid grid-cols-3 gap-1 text-center"
                style={{ borderTop: "1px solid var(--color-space-border)" }}
              >
                {[
                  { label: "1W", val: fx.weekChange },
                  { label: "1M", val: fx.monthChange },
                  { label: "YTD", val: fx.ytdChange },
                ].map(({ label, val }) => (
                  <div key={label}>
                    <div
                      style={{ color: "var(--color-text-muted)", fontSize: "9px" }}
                    >
                      {label}
                    </div>
                    <div
                      className={`text-xs font-semibold ${getChangeColor(val)}`}
                      style={{ fontFamily: FONT_MONO, fontSize: "10px" }}
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
