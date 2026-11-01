import {
  chargingKwh100km,
  costPerKm,
  distanceInPeriod,
  fuelEconomyL100km,
  latestOdometer,
  maintenanceForecast,
  monthOf,
  monthlyTotals,
  RECURRING_MAINTENANCE_KINDS,
  spendByCurrency,
  type MaintenanceForecast,
  type MaintenanceKind,
  type MetricQuality,
  type OdometerPoint,
  type Propulsion,
  type SpendItem,
} from '@ride-ready/core';

import { toNumber } from '@/utils/numbers';
import { odometerPoints, type VehicleRecords } from '@/utils/record-feed';

export type VehicleMetrics = {
  latestOdometer: OdometerPoint | null;
  monthDistanceKm: number | null;
  /** largest-currency total this month; `otherCurrencies` > 0 means spend in more currencies exists */
  monthSpend: { amount: number; currency: string; otherCurrencies: number } | null;
  monthCostPerKm: number | null;
  efficiency: { value: number | null; unit: 'L / 100 km' | 'kWh / 100 km'; quality: MetricQuality };
  counts: { odometer: number; energy: number; service: number; expense: number };
  /** last 6 calendar months of spend in `currency` (oldest first); null when nothing was spent */
  trend: { currency: string; months: { start: Date; total: number }[] } | null;
  /** next visit per recurring kind, detected from the vehicle's own maintenance history */
  forecasts: { kind: MaintenanceKind; forecast: MaintenanceForecast }[];
};

function spendItems(r: VehicleRecords): SpendItem[] {
  return [
    ...r.fuel.map((f) => ({ at: new Date(f.filledAt), amount: Number(f.totalPaid), currency: f.currency })),
    ...r.charging.map((c) => ({ at: new Date(c.startedAt), amount: Number(c.cost), currency: c.currency })),
    ...r.maintenance.flatMap((m) =>
      m.currency
        ? [{ at: new Date(m.performedAt), amount: (toNumber(m.laborCost) ?? 0) + (toNumber(m.partsCost) ?? 0), currency: m.currency }]
        : [],
    ),
    ...r.expenses.map((e) => ({ at: new Date(e.paidAt), amount: Number(e.amount), currency: e.currency })),
  ];
}

function mostUsedCurrency(items: SpendItem[]) {
  const count: Record<string, number> = {};
  for (const i of items) count[i.currency] = (count[i.currency] ?? 0) + 1;
  return Object.entries(count).sort((a, b) => b[1] - a[1])[0]?.[0];
}

export function buildMetrics(r: VehicleRecords, propulsion: Propulsion, now = new Date()): VehicleMetrics {
  const points = odometerPoints(r);
  const month = monthOf(now);
  const monthDistanceKm = distanceInPeriod(points, month);

  const items = spendItems(r);
  const totals = Object.entries(spendByCurrency(items, month)).sort((a, b) => b[1] - a[1]);
  const monthSpend = totals.length
    ? { amount: totals[0][1], currency: totals[0][0], otherCurrencies: totals.length - 1 }
    : null;

  // EVs: kWh bought at the plug (includes charging losses) → estimated. Fuel: full-to-full → calculated.
  const efficiency =
    propulsion === 'ev'
      ? {
          value: chargingKwh100km(
            r.charging.flatMap((c) => (c.odometerKm == null ? [] : [{ odometerKm: Number(c.odometerKm), kwh: Number(c.kwhPurchased) }])),
          ),
          unit: 'kWh / 100 km' as const,
          quality: 'estimated' as const,
        }
      : {
          value: fuelEconomyL100km(
            r.fuel.flatMap((f) => (f.odometerKm == null ? [] : [{ odometerKm: Number(f.odometerKm), liters: Number(f.liters), full: f.fullFill }])),
          ),
          unit: 'L / 100 km' as const,
          quality: 'calculated' as const,
        };

  // trend currency: this month's main one, else the one used most overall
  const trendCurrency = totals[0]?.[0] ?? mostUsedCurrency(items);
  const months = trendCurrency ? monthlyTotals(items, trendCurrency, 6, now) : [];

  const forecasts = RECURRING_MAINTENANCE_KINDS.flatMap((kind) => {
    const visits = r.maintenance
      .filter((m) => m.kind === kind)
      .map((m) => ({ at: new Date(m.performedAt), km: toNumber(m.odometerKm) }));
    const forecast = maintenanceForecast(visits, points, now);
    return forecast ? [{ kind, forecast }] : [];
  });

  return {
    forecasts,
    latestOdometer: latestOdometer(points),
    trend: trendCurrency && months.some((m) => m.total > 0) ? { currency: trendCurrency, months } : null,
    monthDistanceKm,
    monthSpend,
    // only meaningful when all of the month's spend is in one currency
    monthCostPerKm: monthSpend && !monthSpend.otherCurrencies ? costPerKm(monthSpend.amount, monthDistanceKm) : null,
    efficiency,
    counts: {
      odometer: points.length,
      energy: r.fuel.length + r.charging.length,
      service: r.maintenance.length,
      expense: r.expenses.length,
    },
  };
}
