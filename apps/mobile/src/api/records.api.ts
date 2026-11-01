import type {
  BatteryHealthRecord,
  ChargingSession,
  Expense,
  FuelTransaction,
  MaintenanceRecord,
  OdometerReading,
  Page,
  Trip,
} from '@ride-ready/core';

import { request } from './client';

// Request bodies mirror the zod schemas in apps/api/src/modules/<feature>/<feature>.schema.ts.
// Numbers are JSON numbers, dates ISO strings; responses carry decimals as strings (see @ride-ready/core).

export type CreateOdometerInput = { readAt: string; km: number };

export type CreateFuelInput = {
  filledAt: string;
  odometerKm?: number | null;
  liters: number;
  pricePerLiter: number;
  discount?: number;
  totalPaid: number;
  currency: string;
  fullFill: boolean;
  station?: string | null;
  receiptId?: string | null; // a receipt document of the same vehicle
};

export type CreateChargingInput = {
  startedAt: string;
  odometerKm?: number | null;
  kwhPurchased: number;
  cost: number;
  currency: string;
  chargerType?: string | null;
  location?: string | null;
  socStartPct?: number | null;
  socEndPct?: number | null;
  receiptId?: string | null;
};

export type CreateMaintenanceInput = {
  performedAt: string;
  odometerKm?: number | null;
  kind: string;
  description: string;
  laborCost?: number | null;
  partsCost?: number | null;
  currency?: string | null;
  workshop?: string | null;
};

export type CreateTripInput = {
  startedAt: string;
  endedAt?: string | null;
  gpsKm?: number | null;
  route?: string; // encoded polyline
  purpose: 'personal' | 'business';
  notes?: string | null;
};

// Only from a supported measurement (OBD reading, dealer report, vehicle display), never a guess.
export type CreateBatteryHealthInput = { measuredAt: string; sohPct: number; source: string };

export type CreateExpenseInput = {
  paidAt: string;
  category: string;
  amount: number;
  currency: string;
  note?: string | null;
};

// shortcut: lists read the newest 100 records (one page); follow nextCursor once history screens need more.
const PAGE_LIMIT = 100;

function recordsApi<TRecord, TCreate>(segment: string) {
  const base = (vehicleId: string) => `/api/vehicles/${vehicleId}/${segment}`;
  return {
    list: (vehicleId: string) => request<Page<TRecord>>(`${base(vehicleId)}?limit=${PAGE_LIMIT}`),
    create: (vehicleId: string, input: TCreate) =>
      request<TRecord>(base(vehicleId), { method: 'POST', body: JSON.stringify(input) }),
    // PATCH: only the fields sent change; null clears an optional field
    update: (vehicleId: string, id: string, input: Partial<TCreate>) =>
      request<TRecord>(`${base(vehicleId)}/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),
    remove: (vehicleId: string, id: string) => request<void>(`${base(vehicleId)}/${id}`, { method: 'DELETE' }),
  };
}

export const recordsApis = {
  odometer: recordsApi<OdometerReading, CreateOdometerInput>('odometer-readings'),
  fuel: recordsApi<FuelTransaction, CreateFuelInput>('fuel-transactions'),
  charging: recordsApi<ChargingSession, CreateChargingInput>('charging-sessions'),
  maintenance: recordsApi<MaintenanceRecord, CreateMaintenanceInput>('maintenance'),
  expenses: recordsApi<Expense, CreateExpenseInput>('expenses'),
  trips: recordsApi<Trip, CreateTripInput>('trips'),
  battery: recordsApi<BatteryHealthRecord, CreateBatteryHealthInput>('battery-health'),
};

export type RecordKind = keyof typeof recordsApis;
