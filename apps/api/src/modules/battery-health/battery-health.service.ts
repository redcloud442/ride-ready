import { db } from "../../lib/db.ts";
import { pageArgs, toPage, type ListQuery } from "../../plugins/vehicle-records.ts";
import type { CreateBatteryHealthInput, UpdateBatteryHealthInput } from "./battery-health.schema.ts";

const omit = { deletedAt: true } as const;
const live = (vehicleId: string, id: string) => ({ id, vehicleId, deletedAt: null });

export const batteryHealthService = {
  async list(vehicleId: string, query: ListQuery) {
    const rows = await db.batteryHealthRecord.findMany({
      where: { vehicleId, deletedAt: null },
      orderBy: [{ measuredAt: "desc" }, { id: "desc" }],
      omit,
      ...pageArgs(query),
    });
    return toPage(rows, query.limit);
  },

  get(vehicleId: string, id: string) {
    return db.batteryHealthRecord.findFirst({ where: live(vehicleId, id), omit });
  },

  create(vehicleId: string, input: CreateBatteryHealthInput) {
    return db.batteryHealthRecord.create({ data: { ...input, vehicleId }, omit });
  },

  async update(vehicleId: string, id: string, input: UpdateBatteryHealthInput) {
    const { count } = await db.batteryHealthRecord.updateMany({ where: live(vehicleId, id), data: input });
    return count ? batteryHealthService.get(vehicleId, id) : null;
  },

  async remove(vehicleId: string, id: string) {
    const { count } = await db.batteryHealthRecord.updateMany({
      where: live(vehicleId, id),
      data: { deletedAt: new Date() },
    });
    return count > 0;
  },
};
