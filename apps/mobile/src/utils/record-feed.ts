import type {
  ChargingSession,
  Expense,
  FuelTransaction,
  MaintenanceRecord,
  OdometerPoint,
  OdometerReading,
} from '@ride-ready/core';

import type { RecordKind } from '@/api/records.api';

import { toNumber } from './numbers';

// Everything logged for one vehicle (trips are separate: they never feed spend or odometer).
export type VehicleRecords = {
  odometer: OdometerReading[];
  fuel: FuelTransaction[];
  charging: ChargingSession[];
  maintenance: MaintenanceRecord[];
  expenses: Expense[];
};

// Every odometer value the user recorded, from any record type.
export function odometerPoints(r: VehicleRecords): OdometerPoint[] {
  const point = (at: string, km: string | null) => (km == null ? [] : [{ at: new Date(at), km: Number(km) }]);
  return [
    ...r.odometer.flatMap((o) => point(o.readAt, o.km)),
    ...r.fuel.flatMap((f) => point(f.filledAt, f.odometerKm)),
    ...r.charging.flatMap((c) => point(c.startedAt, c.odometerKm)),
    ...r.maintenance.flatMap((m) => point(m.performedAt, m.odometerKm)),
  ];
}

export type FeedItem = {
  key: string;
  id: string;
  kind: Exclude<RecordKind, 'trips' | 'battery'>;
  icon: string;
  title: string;
  detail: string | null;
  at: Date;
  amount: { value: number; currency: string } | null;
};

const money = (value: string | null, currency: string | null) =>
  value != null && currency ? { value: Number(value), currency } : null;

/** Every record type as one feed, newest first. */
export function recordFeed(r: VehicleRecords, limit = Infinity): FeedItem[] {
  const items: FeedItem[] = [
    ...r.fuel.map((f) => ({
      key: `fuel-${f.id}`,
      id: f.id,
      kind: 'fuel' as const,
      icon: 'gas-station',
      title: f.fullFill ? 'Fill-up' : 'Partial fill-up',
      detail: `${Number(f.liters)} L${f.station ? ` · ${f.station}` : ''}`,
      at: new Date(f.filledAt),
      amount: money(f.totalPaid, f.currency),
    })),
    ...r.charging.map((c) => ({
      key: `charging-${c.id}`,
      id: c.id,
      kind: 'charging' as const,
      icon: 'ev-station',
      title: 'Charge',
      detail: `${Number(c.kwhPurchased)} kWh${c.location ? ` · ${c.location}` : ''}`,
      at: new Date(c.startedAt),
      amount: money(c.cost, c.currency),
    })),
    ...r.maintenance.map((m) => ({
      key: `maintenance-${m.id}`,
      id: m.id,
      kind: 'maintenance' as const,
      icon: 'wrench-outline',
      title: m.description,
      detail: m.workshop,
      at: new Date(m.performedAt),
      amount:
        m.currency && (m.laborCost != null || m.partsCost != null)
          ? { value: (toNumber(m.laborCost) ?? 0) + (toNumber(m.partsCost) ?? 0), currency: m.currency }
          : null,
    })),
    ...r.expenses.map((e) => ({
      key: `expenses-${e.id}`,
      id: e.id,
      kind: 'expenses' as const,
      icon: 'cash-multiple',
      title: e.category.charAt(0).toUpperCase() + e.category.slice(1),
      detail: e.note,
      at: new Date(e.paidAt),
      amount: money(e.amount, e.currency),
    })),
    ...r.odometer.map((o) => ({
      key: `odometer-${o.id}`,
      id: o.id,
      kind: 'odometer' as const,
      icon: 'counter',
      title: 'Odometer reading',
      detail: `${Number(o.km).toLocaleString()} km`,
      at: new Date(o.readAt),
      amount: null,
    })),
  ];
  return items.sort((a, b) => b.at.getTime() - a.at.getTime()).slice(0, limit);
}
