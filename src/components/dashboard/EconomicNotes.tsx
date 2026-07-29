import { ECONOMIC_INDICATORS } from "@/lib/site-data";
import SciFiCard, { CardHeader } from "@/components/ui/SciFiCard";
import { formatEconomicValue, FONT_MONO } from "@/lib/utils";

function generateNote(ind: (typeof ECONOMIC_INDICATORS)[0]): string {
  const { name, value, previousValue, direction, unit, period, isPositiveGood } = ind;
  const display = (number: number) => formatEconomicValue(number, ind.category, unit);
  const delta = display(Math.abs(value - previousValue));

  if (direction === "up") {
    if (isPositiveGood) {
      return `${name} rose to ${display(value)} ${unit} in ${period}, up from ${display(previousValue)} — signalling continued expansion.`;
    } else {
      return `${name} climbed to ${display(value)} ${unit} in ${period}, up ${delta} from ${display(previousValue)} — a headwind to watch.`;
    }
  } else if (direction === "down") {
    if (!isPositiveGood) {
      return `${name} declined to ${display(value)} ${unit} in ${period}, easing from ${display(previousValue)} — a positive macro development.`;
    } else {
      return `${name} softened to ${display(value)} ${unit} in ${period}, retreating from ${display(previousValue)} — momentum warranted monitoring.`;
    }
  }
  return `${name} held steady at ${display(value)} ${unit} in ${period}.`;
}

export default function EconomicNotes({
  filter,
  subtitle = "Auto-generated macro notes · Jul 2026",
}: {
  filter?: (ind: (typeof ECONOMIC_INDICATORS)[0]) => boolean;
  subtitle?: string;
} = {}) {
  const notes = ECONOMIC_INDICATORS.filter(filter ?? (() => true)).map((ind) => ({
    id: ind.id,
    name: ind.name,
    flag: ind.flag,
    category: ind.category,
    note: generateNote(ind),
    direction: ind.direction,
    isPositiveGood: ind.isPositiveGood,
  }));

  return (
    <SciFiCard glow="purple">
      <CardHeader
        title="Economic Commentary"
        subtitle={subtitle}
        action={
          <span
            className="text-xs px-2 py-0.5 rounded"
            style={{
              fontFamily: FONT_MONO,
              color: "var(--color-neon-purple)",
              border: "1px solid rgba(129,140,248,0.28)",
              background: "rgba(129,140,248,0.08)",
              letterSpacing: "0.06em",
            }}
          >
            AUTO
          </span>
        }
      />
      <div className="p-4 space-y-2">
        {notes.map(({ id, flag, note, direction, isPositiveGood }) => {
          const positive = isPositiveGood ? direction === "up" : direction === "down";
          const dotColor = positive ? "#34d399" : direction === "neutral" ? "#fbbf24" : "#fb7185";
          return (
            <div
              key={id}
              className="flex items-start gap-3 p-3 rounded-lg"
              style={{ background: "rgba(124,58,237,0.025)", border: "1px solid var(--color-space-border)" }}
            >
              <div
                className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: dotColor, boxShadow: `0 0 4px ${dotColor}` }}
              />
              <div className="flex items-start gap-2 text-xs leading-relaxed">
                <span className="flex-shrink-0 text-sm">{flag}</span>
                <p style={{ color: "var(--color-text-secondary)" }}>{note}</p>
              </div>
            </div>
          );
        })}
        <p
          className="text-xs pt-1"
          style={{
            color: "var(--color-text-muted)",
            fontFamily: FONT_MONO,
            letterSpacing: "0.04em",
          }}
        >
          Commentary is auto-generated from data. Replace with your own analysis in the Blog section.
        </p>
      </div>
    </SciFiCard>
  );
}
