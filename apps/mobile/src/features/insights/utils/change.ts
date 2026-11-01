import { percentChange } from '@ride-ready/core';

/**
 * "Up 12% vs previous 3 months", or null when either side is missing (no comparison is shown then).
 * Direction is said in words, so meaning never rests on color.
 */
export function changeNote(current: number | null | undefined, previous: number | null | undefined, compare: string) {
  const pct = percentChange(current ?? null, previous ?? null);
  if (pct == null) return null;
  const rounded = Math.round(pct);
  return rounded === 0 ? `Same ${compare.replace(/^vs /, 'as ')}` : `${rounded > 0 ? 'Up' : 'Down'} ${Math.abs(rounded)}% ${compare}`;
}

export const monthShort = (iso: string) => new Date(iso).toLocaleString(undefined, { month: 'short' });
export const dayShort = (iso: string) => new Date(iso).toLocaleString(undefined, { day: 'numeric', month: 'short' });
