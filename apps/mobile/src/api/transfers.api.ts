import type { VehicleTransferPreview } from '@ride-ready/core';

import { request } from './client';

/**
 * What the transfer QR code holds: an https page on the API that hands over to the app, because Android
 * camera apps often ignore rideready:// links. The in-app scanner reads it directly.
 */
export const transferLink = (id: string) => `${process.env.EXPO_PUBLIC_API_URL}/t/${id}`;

export const transfersApi = {
  create: (input: { vehicleId: string; includeReceipts: boolean; includeCosts: boolean }) =>
    request<VehicleTransferPreview>('/api/transfers', { method: 'POST', body: JSON.stringify(input) }),
  get: (id: string) => request<VehicleTransferPreview>(`/api/transfers/${id}`),
  accept: (id: string) => request<{ vehicleId: string }>(`/api/transfers/${id}/accept`, { method: 'POST' }),
  cancel: (id: string) => request<void>(`/api/transfers/${id}`, { method: 'DELETE' }),
};
