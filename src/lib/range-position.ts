/** Position on a closed interval; null means there is no trustworthy range. */
export function rangePosition(value: number, low?: number | null, high?: number | null): number | null {
  if (low == null || high == null || ![value, low, high].every(Number.isFinite) || high < low) return null;
  if (high === low) return 50;
  return Math.max(0, Math.min(100, ((value - low) / (high - low)) * 100));
}
