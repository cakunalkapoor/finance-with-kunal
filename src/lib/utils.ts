import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

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
  if (value === 0) return "text-market-neutral";
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
  const points: number[] = [];
  let current = baseValue;
  for (let i = 0; i < weeks; i++) {
    const change = (Math.random() - 0.48) * volatility * current;
    current += change;
    points.push(current);
  }
  return points;
}
