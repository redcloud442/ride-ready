import type { Period, Trip } from '@ride-ready/core';

import { toNumber } from '@/utils/numbers';

export type TripSummary = { count: number; km: number; businessKm: number };

/** Trips started in the period; km is GPS distance only (trips without GPS km add 0). */
export function summarizeTrips(trips: Trip[], { start, end }: Period): TripSummary {
  const inside = trips.filter((t) => {
    const at = new Date(t.startedAt);
    return at >= start && at < end;
  });
  const km = (t: Trip) => toNumber(t.gpsKm) ?? 0;
  return {
    count: inside.length,
    km: inside.reduce((sum, t) => sum + km(t), 0),
    businessKm: inside.filter((t) => t.purpose === 'business').reduce((sum, t) => sum + km(t), 0),
  };
}
