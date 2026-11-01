import type { MetricQuality, Page } from '@ride-ready/core';

import { request } from './client';

// Generated summaries (VehicleInsight rows): plain-language text built from core metrics (describeStats).
export type Insight = {
  id: string;
  vehicleId: string;
  kind: string;
  body: string;
  quality: MetricQuality;
  createdAt: string;
};

const base = (vehicleId: string) => `/api/vehicles/${vehicleId}/insights`;

export const insightsApi = {
  list: (vehicleId: string) => request<Page<Insight>>(`${base(vehicleId)}?limit=20`),
  generate: (vehicleId: string, from: Date, to: Date) =>
    request<Insight>(base(vehicleId), {
      method: 'POST',
      body: JSON.stringify({ from: from.toISOString(), to: to.toISOString() }),
    }),
};
