"use client";

import {
  useEffect,
  useRef,
  type AnchorHTMLAttributes,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from "react";

type RevealVariant = "up" | "down" | "left" | "right" | "scale" | "fade" | "none";

/** Anchor attributes cover the base HTML set plus href/target/rel, which is
 *  everything the call sites need to forward to the rendered element. */
interface RevealProps extends Omit<AnchorHTMLAttributes<HTMLElement>, "children" | "style"> {
  children: ReactNode;
  /** Direction the element travels *towards* as it lands — so "up" starts
   *  below and rises, "left" starts to the right and slides left. Defaults to
   *  a short rise. Use "none" to leave the element visible and treat this
   *  purely as an in-view trigger, letting descendants style off
   *  `.is-revealed` themselves. */
  variant?: RevealVariant;
  /** Stagger offset in ms — use `index * 60` or similar for lists. */
  delay?: number;
  /** Render as something other than a div (e.g. "section", "article", "a"). */
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
}

/**
 * Fades content in as it scrolls into view.
 *
 * The hidden state lives in CSS under `html.js [data-reveal]`, so this is a
 * progressive enhancement: without JS the class is never set and everything
 * renders visible. `prefers-reduced-motion` short-circuits it in globals.css.
 *
 * One shared IntersectionObserver serves every instance on the page — a per-
 * element observer costs noticeably more on the markets tables, which reveal
 * dozens of rows.
 */

let sharedObserver: IntersectionObserver | null = null;
let sweepTimer = 0;

function getObserver() {
  if (typeof IntersectionObserver === "undefined") return null;
  if (!sharedObserver) {
    sharedObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-revealed");
          // Reveal once, then stop paying for the observation.
          sharedObserver?.unobserve(entry.target);
        }
      },
      // Start slightly before the element clears the fold so the motion has
      // finished by the time it is properly in frame.
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 }
    );
  }
  return sharedObserver;
}

/**
 * Safety net for the one failure mode that actually hurts: the observer's first
 * callback reports "not intersecting" for everything — a zero-height viewport
 * during layout, a hidden tab, an embedded webview — and nothing ever scrolls
 * or resizes to make it re-evaluate, leaving content permanently invisible.
 *
 * Shortly after mount, reveal anything still hidden that is already inside the
 * viewport. Content below the fold is untouched, so it still animates on
 * scroll. Missing an animation is fine; invisible content is not.
 *
 * The timer handle is cleared when the sweep runs, so each fresh batch of
 * mounts re-arms it. That matters on client-side navigation: the elements are
 * new but the module state is not, and a one-shot flag would leave every page
 * after the first with no safety net at all.
 */
function scheduleSafetySweep() {
  if (sweepTimer) return;

  sweepTimer = window.setTimeout(() => {
    sweepTimer = 0;
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

    for (const node of document.querySelectorAll("[data-reveal]:not(.is-revealed)")) {
      const rect = node.getBoundingClientRect();
      // No usable viewport to measure against — show everything rather than
      // gamble on a later resize.
      const inView = viewportHeight === 0 || (rect.top < viewportHeight && rect.bottom > 0);
      if (inView) {
        node.classList.add("is-revealed");
        sharedObserver?.unobserve(node);
      }
    }
  }, 1200);
}

export default function Reveal({
  children,
  variant = "up",
  delay = 0,
  as: Tag = "div",
  className,
  style,
  ...rest
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = getObserver();
    if (!observer) {
      // No IntersectionObserver (very old browser) — show it immediately.
      node.classList.add("is-revealed");
      return;
    }

    observer.observe(node);
    scheduleSafetySweep();
    return () => observer.unobserve(node);
  }, []);

  return (
    <Tag
      {...rest}
      ref={ref}
      data-reveal={variant}
      className={className}
      style={delay ? ({ ...style, "--reveal-delay": `${delay}ms` } as CSSProperties) : style}
    >
      {children}
    </Tag>
  );
}
