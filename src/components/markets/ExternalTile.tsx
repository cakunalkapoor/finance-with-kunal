import type { CSSProperties, ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";

/* Shared tile shell for the Commodities / Crypto / Currencies grids. The whole
   tile is the click target when we have an Investing.com page for the
   instrument, and a plain div when we don't — so an instrument added to
   site-data.ts without a link entry still renders, just without the link. */

const TILE_STYLE: CSSProperties = {
  background: "rgba(124,58,237,0.025)",
  border: "1px solid var(--color-space-border)",
};

export default function ExternalTile({
  href,
  label,
  className = "",
  children,
}: {
  href?: string;
  /** Instrument name, used for the link tooltip. */
  label: string;
  className?: string;
  children: ReactNode;
}) {
  const classes = `group rounded-lg flex flex-col transition-all duration-200 hover:scale-[1.02] ${className}`;

  if (!href) {
    return (
      <div className={classes} style={TILE_STYLE}>
        {children}
      </div>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={`${label} on Investing.com`}
      className={classes}
      style={TILE_STYLE}
    >
      {children}
    </a>
  );
}

/** Instrument name inside a tile. Grows the outbound arrow on tile hover, so
    the affordance matches the equity and bond tables. */
export function TileName({ children, linked }: { children: ReactNode; linked: boolean }) {
  return (
    <div
      className="flex items-center gap-1 font-semibold text-sm transition-colors"
      style={{ color: "var(--color-text-secondary)" }}
    >
      <span className={linked ? "underline-offset-2 group-hover:underline" : undefined}>
        {children}
      </span>
      {linked && (
        <ArrowUpRight
          size={11}
          strokeWidth={2.5}
          className="opacity-35 transition-opacity group-hover:opacity-100"
          aria-hidden
        />
      )}
    </div>
  );
}
