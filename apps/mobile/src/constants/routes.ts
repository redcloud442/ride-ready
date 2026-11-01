import type { Href } from 'expo-router';

import type { RecordKind } from '@/api/records.api';

// Every in-app link in one place.
// shortcut: cast to Href until typed routes regenerate on the next `expo start`; then drop the casts.

export type LogScreen = 'odometer' | 'fuel' | 'charging' | 'maintenance' | 'expense' | 'battery';

// record kind (API) → log screen (route file name)
export const LOG_SCREEN: Partial<Record<RecordKind, LogScreen>> = {
  odometer: 'odometer',
  fuel: 'fuel',
  charging: 'charging',
  maintenance: 'maintenance',
  expenses: 'expense',
  battery: 'battery',
};

export const routes = {
  garage: '/garage' as Href,
  trips: '/trips' as Href,
  quickAdd: (type?: 'fuel' | 'charging' | 'maintenance' | 'expense') => (type ? `/quick-add?type=${type}` : '/quick-add') as Href,
  log: (screen: LogScreen) => `/log/${screen}` as Href,
  logFor: (screen: LogScreen, vehicleId: string) => `/log/${screen}?vehicleId=${vehicleId}` as Href,
  editRecord: (screen: LogScreen, vehicleId: string, id: string) =>
    `/log/${screen}?vehicleId=${vehicleId}&id=${id}` as Href,
  vehicle: (id: string) => `/vehicle/${id}` as Href,
  newVehicle: '/vehicle/new' as Href,
  editVehicle: (id: string) => `/vehicle/edit?id=${id}` as Href,
  newDocument: (vehicleId: string) => `/vehicle/document?vehicleId=${vehicleId}` as Href,
  prices: '/prices' as Href,
  profile: '/profile' as Href,
  account: (screen: 'details' | 'email' | 'password' | 'currency') => `/account/${screen}` as Href,
  family: '/family' as Href,
  scanInvite: '/family/scan' as Href,
  invite: (id: string) => `/invite/${id}` as Href,
  newPrice: '/prices/new' as Href,
};
