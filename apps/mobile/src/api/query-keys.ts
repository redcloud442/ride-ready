import type { EnergyPriceKind } from '@ride-ready/core';

import type { RecordKind } from './records.api';

// Single source of TanStack Query keys, so invalidation after a mutation can't drift from the query.
// Everything about one vehicle starts with ['vehicles', id], so invalidating that prefix refreshes it all.
export const queryKeys = {
  vehicles: ['vehicles'] as const,
  vehicle: (vehicleId: string | undefined) => ['vehicles', vehicleId] as const,
  records: (vehicleId: string | undefined, kind: RecordKind) => ['vehicles', vehicleId, kind] as const,
  stats: (vehicleId: string | undefined, from: string, to: string) => ['vehicles', vehicleId, 'stats', from, to] as const,
  insights: (vehicleId: string | undefined) => ['vehicles', vehicleId, 'insights'] as const,
  documents: (vehicleId: string | undefined) => ['vehicles', vehicleId, 'documents'] as const,
  family: ['family'] as const,
  invitation: (id: string) => ['family', 'invitation', id] as const,
  transfer: (id: string) => ['transfers', id] as const,
  avatar: ['profile', 'avatar'] as const,
  // mutation keys: offline saves are stored with these and replayed by their defaults (use-vehicle-records.ts)
  recordSave: (kind: RecordKind, action: 'create' | 'update') => ['records', kind, action] as const,
  recordDelete: ['records', 'delete'] as const,
  energyPrices: (kind: EnergyPriceKind | undefined) => ['energy-prices', kind ?? 'all'] as const,
};
