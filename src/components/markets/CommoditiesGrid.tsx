import { COMMODITIES } from "@/lib/site-data";
import { INVESTING_COMMODITY_URL } from "@/lib/external-links";
import { formatNumber, formatChange, getChangeColor, FONT_MONO } from "@/lib/utils";
import SciFiCard, { CardHeader } from "@/components/ui/SciFiCard";
import ExternalTile, { TileName } from "@/components/markets/ExternalTile";

export default function CommoditiesGrid() {
  return (
    <SciFiCard>
      <CardHeader title="Commodities" subtitle="Spot Prices" />
      <div className="p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 xl:grid-cols-3 gap-3">
        {COMMODITIES.map((c) => {
          const pos = c.dailyChange >= 0;
          const href = INVESTING_COMMODITY_URL[c.symbol];
          return (
            <ExternalTile key={c.symbol} href={href} label={c.name} className="p-3 gap-1">
              <div className="flex items-center justify-between">
                <span className="text-xl">{c.icon}</span>
                <span
                  className={`text-xs px-1.5 py-0.5 rounded font-semibold ${getChangeColor(c.dailyChange)}`}
                  style={{
                    background: pos
                      ? "rgba(52,211,153,0.11)"
                      : "rgba(251,113,133,0.11)",
                    fontFamily: FONT_MONO,
                  }}
                >
                  {formatChange(c.dailyChange)}
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
                {c.value >= 1000
                  ? `$${formatNumber(c.value, 0)}`
                  : `$${formatNumber(c.value)}`}
              </div>

              <TileName linked={Boolean(href)}>{c.name}</TileName>

              <div
                className="text-xs"
                style={{
                  color: "var(--color-text-muted)",
                  fontFamily: FONT_MONO,
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
                      style={{ fontFamily: FONT_MONO, fontSize: "10px" }}
                    >
                      {formatChange(val)}
                    </div>
                  </div>
                ))}
              </div>
            </ExternalTile>
          );
        })}
      </div>
    </SciFiCard>
  );
}
