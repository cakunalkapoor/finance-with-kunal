"use client";

import { useEffect, useRef } from "react";

/**
 * A soft wash that tracks the cursor across whatever surface contains it.
 *
 * It attaches to its own parent rather than taking children, so any positioned
 * container opts in by adding `.spotlight-host` and dropping this in as a
 * child — no wrapper element, no change to the host's layout. Position is
 * written straight to CSS custom properties and rAF-throttled, so pointer
 * movement never triggers a React render.
 *
 * Tune per host with `--spotlight-tint` and `--spotlight-size`. The styles are
 * behind a fine-pointer media query: there is no cursor to follow on touch.
 */
export default function PointerSpotlight() {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = ref.current;
    const host = node?.parentElement;
    if (!node || !host) return;

    let frame = 0;
    let x = 0;
    let y = 0;

    function apply() {
      frame = 0;
      node?.style.setProperty("--mx", `${x}px`);
      node?.style.setProperty("--my", `${y}px`);
    }

    function onMove(event: PointerEvent) {
      const rect = host!.getBoundingClientRect();
      x = event.clientX - rect.left;
      y = event.clientY - rect.top;
      if (!frame) frame = requestAnimationFrame(apply);
    }

    // `pointerenter` seeds the position so the wash doesn't fade in at a stale
    // spot from the last time the cursor was here.
    host.addEventListener("pointerenter", onMove);
    host.addEventListener("pointermove", onMove);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      host.removeEventListener("pointerenter", onMove);
      host.removeEventListener("pointermove", onMove);
    };
  }, []);

  return <span ref={ref} className="pointer-spotlight" aria-hidden="true" />;
}
