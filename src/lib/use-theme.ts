"use client";

import { useSyncExternalStore } from "react";

export type Theme = "light" | "dark";

/**
 * The active theme, read from the `dark` class on <html>.
 *
 * The class itself is applied by an inline script in the root layout *before*
 * paint (no flash) and flipped by ThemeToggle; this hook just subscribes to it
 * so components that can't read CSS variables — ECharts, mainly — restyle when
 * the user toggles.
 */
function subscribe(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}

function getSnapshot(): Theme {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function getServerSnapshot(): Theme {
  return "light";
}

export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** `#rrggbb` → `rgba(r, g, b, alpha)`, for ECharts gradient stops. */
export function withAlpha(hex: string, alpha: number): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return hex;
  const n = parseInt(m[1], 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

/**
 * Chart colours per theme. ECharts renders to SVG/canvas and can't resolve
 * `var(--color-*)`, so these mirror the tokens in globals.css by hand — keep
 * them in sync when the palette changes.
 */
export const CHART_COLORS = {
  light: {
    grid: "rgba(216, 215, 205, 0.55)",
    axisLine: "#d8d7cd",
    axisLabel: "#878b7f",
    up: "#147d4f",
    down: "#c43d4d",
    // Categorical series slots, for charts plotting two comparable lines.
    // Deliberately not up/down: those are semantic, and reusing a good/bad
    // colour for "series 2" would imply a judgement the data doesn't make.
    // Blue/orange, validated against this mode's card surface — adjacent-pair
    // CVD ΔE 24.7 protan (≥8 target), normal-vision 33.6 (≥15 floor).
    series1: "#2a78d6",
    series2: "#eb6834",
    tooltipBg: "rgba(250, 249, 244, 0.98)",
    tooltipBorder: "#d8d7cd",
    tooltipText: "#171914",
    tooltipMuted: "#55594e",
    tooltipShadow: "0 8px 24px rgba(23, 25, 20, 0.10)",
  },
  dark: {
    grid: "rgba(69, 77, 61, 0.38)",
    axisLine: "#2b3126",
    axisLabel: "#747b6d",
    up: "#72d6a1",
    down: "#ff7a89",
    // Same two hues re-stepped for the dark surface, not an automatic flip.
    // Adjacent-pair CVD ΔE 26.8 protan, normal-vision 31.8.
    series1: "#3987e5",
    series2: "#d95926",
    tooltipBg: "rgba(19, 23, 16, 0.98)",
    tooltipBorder: "#454d3d",
    tooltipText: "#f3f4ec",
    tooltipMuted: "#aeb4a5",
    tooltipShadow: "0 8px 24px rgba(0, 0, 0, 0.45)",
  },
} as const;
