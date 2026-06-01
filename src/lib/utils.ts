import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Mono font stack for tickers, numbers, and labels — single source for the
 *  repeated inline `fontFamily`. Uses the self-hosted next/font variable. */
export const FONT_MONO = "var(--font-space-mono), monospace";

export function formatNumber(value: number, decimals = 2): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatLargeNumber(value: number): string {
  if (Math.abs(value) >= 1_000_000_000_000) {
    return `${(value / 1_000_000_000_000).toFixed(2)}T`;
  }
  if (Math.abs(value) >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(2)}B`;
  }
  if (Math.abs(value) >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)}M`;
  }
  return formatNumber(value);
}

export function formatChange(value: number, showSign = true): string {
  const sign = value >= 0 ? "+" : "";
  return `${showSign ? sign : ""}${value.toFixed(2)}%`;
}

export function getChangeColor(value: number, isPositiveGood = true): string {
  if (value === 0) return "text-neutral";
  const positive = isPositiveGood ? value > 0 : value < 0;
  return positive ? "text-up" : "text-down";
}

export function getChangeBg(value: number, isPositiveGood = true): string {
  if (value === 0) return "";
  const positive = isPositiveGood ? value > 0 : value < 0;
  return positive ? "bg-up" : "bg-down";
}

export function getArrow(value: number): string {
  if (value > 0.2) return "▲";
  if (value < -0.2) return "▼";
  return "◆";
}

export function generateSparkline(
  baseValue: number,
  weeks: number,
  volatility = 0.02
): number[] {
  // Deterministic (seeded by index + baseValue) so SSR and client render
  // identically. Never use Math.random() here — it causes hydration mismatches.
  const points: number[] = [];
  let current = baseValue;
  const seed = Math.round(baseValue * 100);
  for (let i = 0; i < weeks; i++) {
    const rand = ((((i + seed) * 1103515245 + 12345) >>> 0) % 1000) / 1000;
    const change = (rand - 0.48) * volatility * current;
    current += change;
    points.push(Math.round(current * 100) / 100);
  }
  return points;
}
