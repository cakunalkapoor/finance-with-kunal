import { CalendarCheck, CalendarClock } from "lucide-react";
import { FONT_MONO } from "@/lib/utils";

interface PageHeaderProps {
  label: string;
  labelColor?: string;
  title: string;
  lastUpdated: string;
  nextUpdate: string;
}

export default function PageHeader({
  label,
  labelColor = "var(--color-neon-cyan)",
  title,
  lastUpdated,
  nextUpdate,
}: PageHeaderProps) {
  return (
    <div className="mb-2">
      {/* Last / Next update row */}
      <div className="flex flex-wrap items-center gap-4 mb-3">
        <div className="flex items-center gap-1.5">
          <CalendarCheck size={12} style={{ color: "var(--color-market-up)" }} />
          <span
            className="text-xs"
            style={{
              fontFamily: FONT_MONO,
              color: "var(--color-text-muted)",
              letterSpacing: "0.06em",
            }}
          >
            Last Updated
          </span>
          <span
            className="text-xs font-semibold"
            style={{
              fontFamily: FONT_MONO,
              color: "var(--color-text-secondary)",
            }}
          >
            {lastUpdated}
          </span>
        </div>

        <div
          className="w-px h-3 hidden sm:block"
          style={{ background: "var(--color-space-border)" }}
        />

        <div className="flex items-center gap-1.5">
          <CalendarClock size={12} style={{ color: "var(--color-neon-cyan)" }} />
          <span
            className="text-xs"
            style={{
              fontFamily: FONT_MONO,
              color: "var(--color-text-muted)",
              letterSpacing: "0.06em",
            }}
          >
            Next Update
          </span>
          <span
            className="text-xs font-semibold"
            style={{
              fontFamily: FONT_MONO,
              color: "var(--color-text-secondary)",
            }}
          >
            {nextUpdate}
          </span>
        </div>
      </div>

      {/* Label + Title */}
      <div className="flex items-center gap-2 mb-1">
        <div
          className="h-4 w-0.5 rounded"
          style={{ background: labelColor }}
        />
        <span
          className="text-xs font-bold tracking-widest uppercase"
          style={{
            fontFamily: FONT_MONO,
            color: labelColor,
            letterSpacing: "0.14em",
          }}
        >
          {label}
        </span>
      </div>
      <h1
        className="text-2xl sm:text-3xl font-bold"
        style={{ color: "var(--color-text-primary)", letterSpacing: "-0.02em" }}
      >
        {title}
      </h1>
    </div>
  );
}
