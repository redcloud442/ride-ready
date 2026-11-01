import type { Metric, PreviousStats, StatsDetails, VehicleStats } from '@ride-ready/core';

import { request } from './client';

// Dates arrive as ISO strings in JSON.
type Json<T> = T extends Date ? string : T extends (infer U)[] ? Json<U>[] : T extends object ? { [K in keyof T]: Json<T[K]> } : T;

// GET /api/vehicles/:vehicleId/stats — computed by vehicleStats() / statsDetails() in core on the server.
export type VehicleStatsResponse = Json<VehicleStats> & {
  /** latest measured state of health before the period end (EVs) */
  batteryHealth?: Json<Metric & { measuredAt: Date | null }>;
  /** monthly trend, economy per interval, fill-up and charging habits */
  details: Json<StatsDetails>;
  /** the same elapsed span of the period before */
  previous: Json<PreviousStats>;
};

export const statsApi = {
  get: (vehicleId: string, from: Date, to: Date) =>
    request<VehicleStatsResponse>(
      `/api/vehicles/${vehicleId}/stats?from=${encodeURIComponent(from.toISOString())}&to=${encodeURIComponent(to.toISOString())}`,
    ),
};
