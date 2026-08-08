"use client";

import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import Reveal from "@/components/ui/Reveal";
import PointerSpotlight from "@/components/ui/PointerSpotlight";
import { formatChange, formatNumber, FONT_MONO } from "@/lib/utils";
import type { IndexQuote } from "@/types";

/** Only the fields the board renders — keeps the 52-point sparklines on every
 *  quote out of the payload sent across the server/client boundary. */
export type SnapshotItem = Pick<
  IndexQuote,
  "symbol" | "name" | "flag" | "value" | "dailyChange" | "weekChange" | "monthChange" | "ytdChange"
>;

const HORIZONS = [
  { id: "daily", label: "Day", caption: "1-day change", key: "dailyChange" },
  { id: "week", label: "Week", caption: "1-week change", key: "weekChange" },
  { id: "month", label: "Month", caption: "1-month change", key: "monthChange" },
  { id: "ytd", label: "YTD", caption: "Year to date", key: "ytdChange" },
] as const;

type HorizonId = (typeof HORIZONS)[number]["id"];

export default function MarketSnapshotBoard({ items }: { items: SnapshotItem[] }) {
  const [horizon, setHorizon] = useState<HorizonId>("daily");
  // Collected from each tile's ref callback. `Reveal` assigns its own ref after
  // spreading props, so a ref handed to it would be dropped — and the tiles are
  // what this needs to measure anyway.
  const tiles = useRef(new Map<string, HTMLElement>());
  const previousRects = useRef(new Map<string, DOMRect>());

  const activeIndex = HORIZONS.findIndex((h) => h.id === horizon);
  const active = HORIZONS[activeIndex];

  // Best performer first. The symbol tiebreak keeps the order deterministic so
  // the server and client render the same list.
  const ranked = [...items].sort(
    (a, b) => b[active.key] - a[active.key] || a.symbol.localeCompare(b.symbol)
  );

  /**
   * FLIP: the tiles are already in their new positions by the time this runs,
   * so translate each one back to where it was, then release it on the next
   * frame and let CSS carry it home. Animating the real layout (rather than
   * cross-fading two states) is what makes the re-rank read as physical.
   */
  useLayoutEffect(() => {
    const nextRects = new Map<string, DOMRect>();
    for (const [symbol, tile] of tiles.current) {
      nextRects.set(symbol, tile.getBoundingClientRect());
    }

    const firstRects = previousRects.current;
    previousRects.current = nextRects;

    // Nothing to compare against on the first pass, and honouring a reduced
    // motion preference means letting the tiles simply appear in place.
    if (!firstRects.size) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const moved: HTMLElement[] = [];
    for (const [symbol, tile] of tiles.current) {
      const first = firstRects.get(symbol);
      const last = nextRects.get(symbol);
      if (!first || !last) continue;

      const dx = first.left - last.left;
      const dy = first.top - last.top;
      if (!dx && !dy) continue;

      tile.style.transition = "none";
      tile.style.transform = `translate(${dx}px, ${dy}px)`;
      moved.push(tile);
    }
    if (!moved.length) return;

    // Two frames: the first commits the inverted position, the second releases
    // it. Collapsing this into one frame lets the browser coalesce both writes
    // and skip the animation entirely.
    let second = 0;
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => {
        for (const tile of moved) {
          tile.style.transition = "";
          tile.style.transform = "";
        }
      });
    });

    return () => {
      cancelAnimationFrame(first);
      if (second) cancelAnimationFrame(second);
      for (const tile of moved) {
        tile.style.transition = "";
        tile.style.transform = "";
      }
    };
  }, [horizon]);

  return (
    <>
      <div className="mb-4 flex justify-start sm:justify-end">
        <div
          className="horizon-control"
          role="group"
          aria-label="Performance horizon"
          style={{ "--active": activeIndex } as CSSProperties}
        >
          <span className="horizon-indicator" aria-hidden="true" />
          {HORIZONS.map((option) => (
            <button
              key={option.id}
              type="button"
              className="horizon-option"
              aria-pressed={option.id === horizon}
              onClick={() => setHorizon(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* `variant="none"` makes this a pure in-view trigger: the grid itself
          never fades, it just carries `.is-revealed` so the hairlines and the
          tile contents can stage themselves off it. Because that class lands on
          the container and not the tiles, re-ranking never replays the draw-in. */}
      <Reveal variant="none" className="rule-grid grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
        <span className="rule-frame" aria-hidden="true" />
        {ranked.map((item, index) => {
          const change = item[active.key];
          const positive = change >= 0;
          return (
            <div
              key={item.symbol}
              ref={(node) => {
                if (node) tiles.current.set(item.symbol, node);
                else tiles.current.delete(item.symbol);
              }}
              className="rule-cell spotlight-host group hover-accent p-4 sm:p-5"
              style={{ background: "var(--color-space-card)", "--rule-delay": `${index * 70}ms` } as CSSProperties}
            >
              <span className="rule-cell-lines" aria-hidden="true" />
              <PointerSpotlight />
              <div className="rule-cell-body">
                <div className="mb-8 flex items-center justify-between">
                  <span aria-hidden="true">{item.flag}</span>
                  {/* Keyed on the horizon so the figure re-mounts and fades
                      rather than snapping to a different number in place. */}
                  <span
                    key={horizon}
                    className="animate-value-swap rounded-full px-2 py-1 text-[10px] font-bold"
                    style={{
                      color: positive ? "var(--color-market-up)" : "var(--color-market-down)",
                      background: positive ? "var(--color-market-up-dim)" : "var(--color-market-down-dim)",
                      fontFamily: FONT_MONO,
                    }}
                  >
                    {formatChange(change)}
                  </span>
                </div>
                <div className="text-lg font-bold" style={{ color: "var(--color-text-primary)", fontFamily: FONT_MONO, letterSpacing: "-0.04em" }}>
                  {formatNumber(item.value, item.value > 10000 ? 0 : 2)}
                </div>
                <div className="mt-2 text-xs font-bold" style={{ color: "var(--color-text-secondary)" }}>{item.name}</div>
                <div
                  key={horizon}
                  className="animate-value-swap mt-1 text-[10px] uppercase"
                  style={{ color: "var(--color-text-muted)", fontFamily: FONT_MONO, letterSpacing: "0.08em" }}
                >
                  {active.caption}
                </div>
              </div>
            </div>
          );
        })}
      </Reveal>
    </>
  );
}
