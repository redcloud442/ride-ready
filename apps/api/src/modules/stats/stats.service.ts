import {
  previousPeriod,
  previousStats,
  statsDetails,
  vehicleStats,
  type Metric,
  type Period,
  type Propulsion,
  type StatsInput,
} from "@ride-ready/core";
import { db } from "../../lib/db.ts";

const num = (d: { toNumber(): number }) => d.toNumber();
const numOrNull = (d: { toNumber(): number } | null) => (d ? d.toNumber() : null);

// Loads one vehicle's records and hands them to core; all arithmetic lives in @ride-ready/core.
export const statsService = {
  async forVehicle(vehicle: { id: string; propulsion: Propulsion }, period: Period) {
    const vehicleId = vehicle.id;
    const live = { vehicleId, deletedAt: null };
    // shortcut: month boundaries are read in the server's time zone; send the phone's offset if users sit far from it
    const previous = previousPeriod(period);
    // from the previous period's start, so the comparison comes from the same query
    const inPeriod = { gte: previous.start, lt: period.end };

    const [odometer, fuel, charging, maintenance, expenses, battery] = await Promise.all([
      // readings before the period give distance its baseline
      db.odometerReading.findMany({ where: { ...live, readAt: { lt: period.end } }, select: { readAt: true, km: true } }),
      db.fuelTransaction.findMany({ where: { ...live, filledAt: inPeriod } }),
      db.chargingSession.findMany({ where: { ...live, startedAt: inPeriod } }),
      db.maintenanceRecord.findMany({ where: { ...live, performedAt: inPeriod } }),
      db.expense.findMany({ where: { ...live, paidAt: inPeriod } }),
      db.batteryHealthRecord.findFirst({ where: { ...live, measuredAt: { lt: period.end } }, orderBy: { measuredAt: "desc" } }),
    ]);

    const input: StatsInput = {
      propulsion: vehicle.propulsion,
      odometer: odometer.map((r) => ({ at: r.readAt, km: num(r.km) })),
      fuel: fuel.map((f) => ({
        at: f.filledAt,
        odometerKm: numOrNull(f.odometerKm),
        liters: num(f.liters),
        fullFill: f.fullFill,
        totalPaid: num(f.totalPaid),
        currency: f.currency,
      })),
      charging: charging.map((c) => ({
        at: c.startedAt,
        odometerKm: numOrNull(c.odometerKm),
        kwhPurchased: num(c.kwhPurchased),
        cost: num(c.cost),
        currency: c.currency,
      })),
      maintenance: maintenance.map((m) => ({
        at: m.performedAt,
        laborCost: numOrNull(m.laborCost),
        partsCost: numOrNull(m.partsCost),
        currency: m.currency,
      })),
      expenses: expenses.map((e) => ({ at: e.paidAt, amount: num(e.amount), currency: e.currency })),
    };
    const stats = vehicleStats(input, period);
    const before = vehicleStats(input, previous);

    const batteryHealth: Metric & { measuredAt: Date | null } = {
      value: numOrNull(battery?.sohPct ?? null),
      unit: "%",
      quality: "measured",
      basis: battery ? `latest record (${battery.source})` : "no battery health record",
      measuredAt: battery?.measuredAt ?? null,
    };

    // ids behind this period's numbers, so a stored insight can cite what it is based on
    const current = (at: Date) => at >= period.start;
    const supportingRecords = [
      ...fuel.filter((r) => current(r.filledAt)),
      ...charging.filter((r) => current(r.startedAt)),
      ...maintenance.filter((r) => current(r.performedAt)),
      ...expenses.filter((r) => current(r.paidAt)),
    ].map((r) => r.id);
    return {
      ...stats,
      batteryHealth,
      details: statsDetails(input, period),
      previous: previousStats(before), // same elapsed span of the period before
      supportingRecords,
    };
  },
};
