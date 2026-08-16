import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { FONT_MONO } from "@/lib/utils";
import SciFiCard, { CardHeader } from "@/components/ui/SciFiCard";
import type { AIFigure } from "@/types";

/*
 * The workhorse of the /ai page: a curated figure rendered together with where
 * it came from and when.
 *
 * Every other dataset on this site arrives from a fetcher on a known cadence,
 * so "Last updated" in the page header covers it. Nothing on this page works
 * that way — a Microsoft AI run rate is true as of one earnings call, a
 * Challenger layoff count as of one monthly release. Attribution is therefore
 * part of the datum, not a footnote: source and date sit inside the tile, and
 * the whole tile is the link. A figure that can't fill those fields doesn't get
 * added to ai-data.ts in the first place.
 */

/** "2026-07-30" → "Jul 30, 2026". Fixed UTC so SSR and client agree. */
function formatAsOf(iso: string): string {
  const parsed = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return iso;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(parsed);
}

export default function AIFigureGrid({
  figures,
  columns = 3,
}: {
  figures: AIFigure[];
  /** Max columns at the widest breakpoint; always 1 on mobile, 2 at sm. */
  columns?: 2 | 3 | 4;
}) {
  const wide = { 2: "lg:grid-cols-2", 3: "lg:grid-cols-3", 4: "lg:grid-cols-4" }[columns];

  return (
    <div className={`grid grid-cols-1 gap-3 px-4 pb-4 sm:grid-cols-2 ${wide}`}>
      {figures.map((figure) => (
        <a
          key={figure.id}
          href={figure.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group hover-lift flex flex-col rounded-lg p-4 transition-colors"
          style={{
            background: "color-mix(in srgb, var(--color-space-card) 86%, transparent)",
            border: "1px solid var(--color-space-border)",
          }}
        >
          <p
            className="text-[10px] font-bold uppercase"
            style={{
              color: "var(--color-text-muted)",
              fontFamily: FONT_MONO,
              letterSpacing: "0.1em",
            }}
          >
            {figure.label}
          </p>

          <p
            className="mt-2 text-2xl font-bold"
            style={{
              color: "var(--color-neon-cyan)",
              fontFamily: FONT_MONO,
              letterSpacing: "-0.03em",
            }}
          >
            {figure.value}
          </p>

          <p
            className="mt-2 grow text-[11px] leading-5"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {figure.detail}
          </p>

          <div
            className="mt-3 flex items-center gap-1 border-t pt-2 text-[10px]"
            style={{
              borderColor: "var(--color-space-border)",
              color: "var(--color-text-muted)",
              fontFamily: FONT_MONO,
            }}
          >
            <span className="truncate underline-offset-2 group-hover:underline">
              {figure.source}
            </span>
            <ArrowUpRight
              size={10}
              strokeWidth={2.5}
              className="shrink-0 opacity-40 transition-opacity group-hover:opacity-100"
              aria-hidden
            />
            <span className="ml-auto shrink-0 whitespace-nowrap">{formatAsOf(figure.asOf)}</span>
          </div>
        </a>
      ))}
    </div>
  );
}

/** SciFiCard + header + grid + footnote — the shape four /ai sections share. */
export function AIFigureSection({
  title,
  subtitle,
  figures,
  columns,
  glow = "cyan",
  children,
}: {
  title: string;
  subtitle: string;
  figures: AIFigure[];
  columns?: 2 | 3 | 4;
  glow?: "cyan" | "purple";
  /** Footnote — the caveat that belongs with this particular dataset. */
  children?: ReactNode;
}) {
  return (
    <SciFiCard glow={glow}>
      <CardHeader title={title} subtitle={subtitle} />
      <AIFigureGrid figures={figures} columns={columns} />
      {children && (
        <p
          className="border-t px-4 py-3 leading-5"
          style={{
            color: "var(--color-text-muted)",
            fontSize: "11px",
            borderColor: "var(--color-space-border)",
          }}
        >
          {children}
        </p>
      )}
    </SciFiCard>
  );
}
