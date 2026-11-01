import type { BodyStyle, Propulsion, VehicleColor, VehicleSummary, VehicleType } from '@ride-ready/core';

import { request } from './client';

export type CreateVehicleInput = {
  type: VehicleType;
  propulsion: Propulsion;
  bodyStyle?: BodyStyle;
  color?: VehicleColor | null;
  make: string;
  model: string;
  year: number;
};

// type and propulsion are fixed once created (fuel/charging records depend on them)
export type UpdateVehicleInput = Partial<{ make: string; model: string; year: number; variant: string | null; bodyStyle: BodyStyle; color: VehicleColor | null }>;

export const vehiclesApi = {
  list: () => request<VehicleSummary[]>('/api/vehicles'),
  create: (input: CreateVehicleInput) =>
    request<VehicleSummary>('/api/vehicles', { method: 'POST', body: JSON.stringify(input) }),
  update: (id: string, input: UpdateVehicleInput) =>
    request<VehicleSummary>(`/api/vehicles/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),
  // soft delete on the server; its records stay for sync but stop showing
  remove: (id: string) => request<void>(`/api/vehicles/${id}`, { method: 'DELETE' }),
};
