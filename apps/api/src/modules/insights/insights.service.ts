import { describeStats, weakestQuality, type Period, type Propulsion } from "@ride-ready/core";
import { db } from "../../lib/db.ts";
import { pageArgs, toPage, type ListQuery } from "../../plugins/vehicle-records.ts";
import { statsService } from "../stats/stats.service.ts";

type Vehicle = { id: string; propulsion: Propulsion };

export const insightsService = {
  async list(vehicleId: string, query: ListQuery) {
    const rows = await db.vehicleInsight.findMany({
      where: { vehicleId },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      ...pageArgs(query),
    });
    return toPage(rows, query.limit);
  },

  // Numbers come from core; the stored insight records how strong they are and which records back them.
  async generate(vehicle: Vehicle, period: Period) {
    const { supportingRecords, details, previous, ...stats } = await statsService.forVehicle(vehicle, period);
    const body = describeStats(stats, vehicle.propulsion, { details, previous });
    const metrics = [stats.distance, stats.fuelEconomy, stats.chargingConsumption, stats.fuelPurchased, stats.energyPurchased, stats.costPerKm];
    return db.vehicleInsight.create({
      data: {
        vehicleId: vehicle.id,
        kind: "period_summary",
        body,
        quality: weakestQuality(metrics) ?? "measured", // no metric had a value: the text only reports what's missing
        supportingRecords,
      },
    });
  },

};
