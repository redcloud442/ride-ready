import {
  EXPENSE_CATEGORIES,
  MAINTENANCE_KINDS,
  type BatteryHealthRecord,
  type ChargingSession,
  type Expense,
  type FuelTransaction,
  type MaintenanceRecord,
  type OdometerReading,
} from '@ride-ready/core';

import type { BatteryForm, ChargingForm, ExpenseForm, FuelForm, MaintenanceForm, OdometerForm } from '../logging.schemas';

// Saved record → form fields (inputs hold strings; decimals already arrive as strings).
const s = (v: string | null | undefined) => v ?? '';
// the API accepts free text here; values outside the app's list edit as "other"
const oneOf = <T extends string>(list: readonly T[], v: string, fallback: T): T => (list.includes(v as T) ? (v as T) : fallback);

export const odometerValues = (r: OdometerReading): OdometerForm => ({ readAt: new Date(r.readAt), km: r.km });

export const fuelValues = (r: FuelTransaction): FuelForm => ({
  filledAt: new Date(r.filledAt),
  odometerKm: s(r.odometerKm),
  liters: r.liters,
  pricePerLiter: r.pricePerLiter,
  totalPaid: r.totalPaid,
  discount: Number(r.discount) ? r.discount : '',
  currency: r.currency,
  fullFill: r.fullFill,
  station: s(r.station),
});

export const chargingValues = (r: ChargingSession): ChargingForm => ({
  startedAt: new Date(r.startedAt),
  odometerKm: s(r.odometerKm),
  kwhPurchased: r.kwhPurchased,
  cost: r.cost,
  currency: r.currency,
  chargerType: s(r.chargerType),
  location: s(r.location),
  socStartPct: s(r.socStartPct),
  socEndPct: s(r.socEndPct),
});

export const maintenanceValues = (r: MaintenanceRecord, fallbackCurrency: string): MaintenanceForm => ({
  performedAt: new Date(r.performedAt),
  odometerKm: s(r.odometerKm),
  kind: oneOf(MAINTENANCE_KINDS, r.kind, 'other'),
  description: r.description,
  laborCost: s(r.laborCost),
  partsCost: s(r.partsCost),
  currency: r.currency ?? fallbackCurrency,
  workshop: s(r.workshop),
});

export const expenseValues = (r: Expense): ExpenseForm => ({
  paidAt: new Date(r.paidAt),
  category: oneOf(EXPENSE_CATEGORIES, r.category, 'other'),
  amount: r.amount,
  currency: r.currency,
  note: s(r.note),
});

export const batteryValues = (r: BatteryHealthRecord): BatteryForm => ({
  measuredAt: new Date(r.measuredAt),
  sohPct: r.sohPct,
  source: r.source,
});
