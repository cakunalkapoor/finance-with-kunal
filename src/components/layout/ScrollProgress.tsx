"use client";

import { useEffect, useRef } from "react";

/**
 * Hairline reading-progress bar pinned above the navbar.
 *
 * Progress is written straight to a CSS custom property and animated with
 * `transform: scaleX()` — no React state, so scrolling never triggers a
 * re-render and the bar stays on the compositor.
 */
export default function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    let frame = 0;

    function update() {
      frame = 0;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
      node?.style.setProperty("--progress", String(Math.min(1, Math.max(0, progress))));
    }

    function onScroll() {
      if (frame) return;
      frame = requestAnimationFrame(update);
    }

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[2px]"
    >
      <div ref={ref} className="scroll-progress h-full w-full" />
    </div>
  );
}
