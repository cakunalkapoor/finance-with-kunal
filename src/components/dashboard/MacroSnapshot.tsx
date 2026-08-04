import { MACRO_SNAPSHOT } from "@/lib/site-data";
import {
  Activity,
  BadgeDollarSign,
  BriefcaseBusiness,
  ClipboardList,
  Droplets,
  Factory,
  TrendingDown,
  TrendingUp,
  Minus,
} from "lucide-react";
import { FONT_MONO } from "@/lib/utils";

const METRICS = [
  {
    key: "gdp" as const,
    label: "GDP",
    displayValue: `${MACRO_SNAPSHOT.gdp.value}%`,
    context: "US QoQ",
    icon: Activity,
  },
  {
    key: "pmi" as const,
    label: "Global PMI",
    displayValue: `${MACRO_SNAPSHOT.pmi.value}`,
    context: "Composite",
    icon: Factory,
  },
  {
    key: "inflation" as const,
    label: "Inflation",
    displayValue: `${MACRO_SNAPSHOT.inflation.value}%`,
    context: "US CPI YoY",
    icon: BadgeDollarSign,
  },
  {
    key: "jobs" as const,
    label: "Unemployment",
    displayValue: `${MACRO_SNAPSHOT.jobs.value}%`,
    context: "US Rate",
    icon: BriefcaseBusiness,
  },
  {
    key: "claims" as const,
    label: "Initial Claims",
    displayValue: `${MACRO_SNAPSHOT.claims.value}K`,
    context: "US Weekly",
    icon: ClipboardList,
  },
  {
    key: "oil" as const,
    label: "Oil",
    displayValue: `$${MACRO_SNAPSHOT.oil.value}`,
    context: "Brent $/bbl",
    icon: Droplets,
  },
];

function TrendIcon({ trend }: { trend: "up" | "down" | "neutral" }) {
  if (trend === "up")
    return <TrendingUp size={14} style={{ color: "var(--color-market-up)" }} />;
  if (trend === "down")
    return <TrendingDown size={14} style={{ color: "var(--color-market-down)" }} />;
  return <Minus size={14} style={{ color: "var(--color-market-neutral)" }} />;
}

export default function MacroSnapshot({
  showHeader = true,
}: {
  showHeader?: boolean;
} = {}) {
  return (
    <div>
      {showHeader && (
        <div className="flex items-center gap-3 mb-6">
          <div className="h-px w-7" style={{ background: "var(--color-neon-cyan)" }} />
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
            LATEST AVAILABLE
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 border-l border-t sm:grid-cols-3 lg:grid-cols-6" style={{ borderColor: "var(--color-space-border)" }}>
        {METRICS.map(({ key, label, displayValue, context, icon: Icon }) => {
          const trend = MACRO_SNAPSHOT[key].trend;
          return (
            <div
              key={key}
              className="group flex min-h-40 flex-col justify-between border-b border-r p-4 transition-colors sm:p-5"
              style={{
                background: "var(--color-space-card)",
                borderColor: "var(--color-space-border)",
              }}
            >
              <div className="flex items-center justify-between">
                <Icon size={17} style={{ color: "var(--color-neon-cyan)" }} />
                <TrendIcon trend={trend} />
              </div>
              <div
                className="text-2xl font-bold leading-none sm:text-3xl"
                style={{
                  fontFamily: FONT_MONO,
                  color: "var(--color-text-primary)",
                  letterSpacing: "-0.06em",
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
