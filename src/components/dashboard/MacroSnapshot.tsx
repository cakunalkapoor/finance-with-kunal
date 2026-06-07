import { MACRO_SNAPSHOT } from "@/lib/site-data";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { FONT_MONO } from "@/lib/utils";

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
    label: "Global PMI",
    displayValue: `${MACRO_SNAPSHOT.pmi.value}`,
    context: "Composite",
    icon: "🌐",
  },
  {
    key: "inflation" as const,
    label: "Inflation",
    displayValue: `${MACRO_SNAPSHOT.inflation.value}%`,
    context: "US CPI YoY",
    icon: "💹",
  },
  {
    key: "jobs" as const,
    label: "Unemployment",
    displayValue: `${MACRO_SNAPSHOT.jobs.value}%`,
    context: "US Rate",
    icon: "💼",
  },
  {
    key: "claims" as const,
    label: "Initial Claims",
    displayValue: `${MACRO_SNAPSHOT.claims.value}K`,
    context: "US Weekly",
    icon: "📋",
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
    return <TrendingUp size={14} style={{ color: "#34d399" }} />;
  if (trend === "down")
    return <TrendingDown size={14} style={{ color: "#fb7185" }} />;
  return <Minus size={14} style={{ color: "#f59e0b" }} />;
}

export default function MacroSnapshot({
  showHeader = true,
}: {
  showHeader?: boolean;
} = {}) {
  return (
    <div
      className="rounded-xl p-4 sm:p-6"
      style={{
        background: "linear-gradient(135deg, rgba(167,139,250,0.05) 0%, rgba(129,140,248,0.03) 100%)",
        border: "1px solid var(--color-space-border)",
      }}
    >
      {showHeader && (
        <div className="flex items-center gap-3 mb-6">
          <div
            className="h-5 w-1 rounded"
            style={{ background: "linear-gradient(to bottom, var(--color-neon-cyan), var(--color-neon-purple))" }}
          />
          <h2
            className="text-sm font-bold tracking-widest uppercase"
            style={{
              color: "var(--color-neon-cyan)",
              fontFamily: FONT_MONO,
              letterSpacing: "0.15em",
            }}
          >
            Global Macro Snapshot
          </h2>
          <div
            className="ml-auto text-xs px-2 py-0.5 rounded"
            style={{
              fontFamily: FONT_MONO,
              color: "var(--color-text-muted)",
              border: "1px solid var(--color-space-border)",
              letterSpacing: "0.08em",
            }}
          >
            JUN 2026
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {METRICS.map(({ key, label, displayValue, context, icon }) => {
          const trend = MACRO_SNAPSHOT[key].trend;
          return (
            <div
              key={key}
              className="rounded-lg p-3 flex flex-col gap-2 transition-all duration-200 hover:border-opacity-100"
              style={{
                background: "rgba(124,58,237,0.025)",
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
                  fontFamily: FONT_MONO,
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
                    fontFamily: FONT_MONO,
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
