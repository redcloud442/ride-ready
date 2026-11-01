import { db } from "../../lib/db.ts";
import { pageArgs, toPage, type ListQuery } from "../../plugins/vehicle-records.ts";
import { documentsService } from "../documents/documents.service.ts";
import type { CreateChargingInput, UpdateChargingInput } from "./charging.schema.ts";

const omit = { deletedAt: true } as const;
const live = (vehicleId: string, id: string) => ({ id, vehicleId, deletedAt: null });

export const chargingService = {
  async list(vehicleId: string, query: ListQuery) {
    const rows = await db.chargingSession.findMany({
      where: { vehicleId, deletedAt: null },
      orderBy: [{ startedAt: "desc" }, { id: "desc" }],
      omit,
      ...pageArgs(query),
    });
    return toPage(rows, query.limit);
  },

  get(vehicleId: string, id: string) {
    return db.chargingSession.findFirst({ where: live(vehicleId, id), omit });
  },

  async create(vehicleId: string, input: CreateChargingInput) {
    await documentsService.assertReceipt(vehicleId, input.receiptId);
    return db.chargingSession.create({ data: { ...input, vehicleId }, omit });
  },

  async update(vehicleId: string, id: string, input: UpdateChargingInput) {
    await documentsService.assertReceipt(vehicleId, input.receiptId);
    const { count } = await db.chargingSession.updateMany({ where: live(vehicleId, id), data: input });
    return count ? chargingService.get(vehicleId, id) : null;
  },

  async remove(vehicleId: string, id: string) {
    const { count } = await db.chargingSession.updateMany({
      where: live(vehicleId, id),
      data: { deletedAt: new Date() },
    });
    return count > 0;
  },
};
