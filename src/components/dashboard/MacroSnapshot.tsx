import { MACRO_SNAPSHOT } from "@/lib/mock-data";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

const METRICS = [
  {
    key: "gdp" as const,
    label: "GDP",
    displayValue: `${MACRO_SNAPSHOT.gdp.value}%`,
    context: "US QoQ",
    icon: "📈",
  },
  {
    key: "pmi" as const,
    label: "PMI",
    displayValue: `${MACRO_SNAPSHOT.pmi.value}`,
    context: "China Mfg",
    icon: "🏭",
  },
  {
    key: "inflation" as const,
    label: "Inflation",
    displayValue: `${MACRO_SNAPSHOT.inflation.value}%`,
    context: "US CPI YoY",
    icon: "💹",
  },
  {
    key: "exports" as const,
    label: "Exports",
    displayValue: `+${MACRO_SNAPSHOT.exports.value}%`,
    context: "China YoY",
    icon: "🚢",
  },
  {
    key: "shipping" as const,
    label: "Shipping",
    displayValue: MACRO_SNAPSHOT.shipping.value.toLocaleString(),
    context: "Baltic Dry",
    icon: "⚓",
  },
  {
    key: "oil" as const,
    label: "Oil",
    displayValue: `$${MACRO_SNAPSHOT.oil.value}`,
    context: "Brent $/bbl",
    icon: "🛢️",
  },
];

function TrendIcon({ trend }: { trend: "up" | "down" | "neutral" }) {
  if (trend === "up")
    return <TrendingUp size={14} style={{ color: "#10d98e" }} />;
  if (trend === "down")
    return <TrendingDown size={14} style={{ color: "#f43f5e" }} />;
  return <Minus size={14} style={{ color: "#f59e0b" }} />;
}

export default function MacroSnapshot() {
  return (
    <div
      className="rounded-xl p-4 sm:p-6"
      style={{
        background: "linear-gradient(135deg, rgba(0,212,255,0.04) 0%, rgba(168,85,247,0.04) 100%)",
        border: "1px solid var(--color-space-border)",
      }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div
          className="h-5 w-1 rounded"
          style={{ background: "linear-gradient(to bottom, var(--color-neon-cyan), var(--color-neon-purple))" }}
        />
        <h2
          className="text-sm font-bold tracking-widest uppercase"
          style={{
            color: "var(--color-neon-cyan)",
            fontFamily: "var(--font-space-mono), monospace",
            letterSpacing: "0.15em",
          }}
        >
          Global Macro Snapshot
        </h2>
        <div
          className="ml-auto text-xs px-2 py-0.5 rounded"
          style={{
            fontFamily: "var(--font-space-mono), monospace",
            color: "var(--color-text-muted)",
            border: "1px solid var(--color-space-border)",
            letterSpacing: "0.08em",
          }}
        >
          MAY 2026
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {METRICS.map(({ key, label, displayValue, context, icon }) => {
          const trend = MACRO_SNAPSHOT[key].trend;
          return (
            <div
              key={key}
              className="rounded-lg p-3 flex flex-col gap-2 transition-all duration-200 hover:border-opacity-100"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid var(--color-space-border)",
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-lg">{icon}</span>
                <TrendIcon trend={trend} />
              </div>
              <div
                className="font-bold text-xl leading-none"
                style={{
                  fontFamily: "var(--font-space-mono), monospace",
                  color: "var(--color-text-primary)",
                  letterSpacing: "-0.03em",
                }}
              >
                {displayValue}
              </div>
              <div>
                <div
                  className="font-semibold text-sm"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {label}
                </div>
                <div
                  className="text-xs"
                  style={{
                    color: "var(--color-text-muted)",
                    fontFamily: "var(--font-space-mono), monospace",
                  }}
                >
                  {context}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
