import { db } from "../../lib/db.ts";
import { pageArgs, toPage, type ListQuery } from "../../plugins/vehicle-records.ts";
import type { CreateMaintenanceInput, UpdateMaintenanceInput } from "./maintenance.schema.ts";

const omit = { deletedAt: true } as const;
const live = (vehicleId: string, id: string) => ({ id, vehicleId, deletedAt: null });

export const maintenanceService = {
  async list(vehicleId: string, query: ListQuery) {
    const rows = await db.maintenanceRecord.findMany({
      where: { vehicleId, deletedAt: null },
      orderBy: [{ performedAt: "desc" }, { id: "desc" }],
      omit,
      ...pageArgs(query),
    });
    return toPage(rows, query.limit);
  },

  get(vehicleId: string, id: string) {
    return db.maintenanceRecord.findFirst({ where: live(vehicleId, id), omit });
  },

  create(vehicleId: string, input: CreateMaintenanceInput) {
    return db.maintenanceRecord.create({ data: { ...input, vehicleId }, omit });
  },

  async update(vehicleId: string, id: string, input: UpdateMaintenanceInput) {
    const { count } = await db.maintenanceRecord.updateMany({ where: live(vehicleId, id), data: input });
    return count ? maintenanceService.get(vehicleId, id) : null;
  },

  async remove(vehicleId: string, id: string) {
    const { count } = await db.maintenanceRecord.updateMany({
      where: live(vehicleId, id),
      data: { deletedAt: new Date() },
    });
    return count > 0;
  },
};
