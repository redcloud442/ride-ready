import { db } from "../../lib/db.ts";
import { pageArgs, toPage, type ListQuery } from "../../plugins/vehicle-records.ts";
import { documentsService } from "../documents/documents.service.ts";
import type { CreateFuelInput, UpdateFuelInput } from "./fuel.schema.ts";

const omit = { deletedAt: true } as const;
const live = (vehicleId: string, id: string) => ({ id, vehicleId, deletedAt: null });

export const fuelService = {
  async list(vehicleId: string, query: ListQuery) {
    const rows = await db.fuelTransaction.findMany({
      where: { vehicleId, deletedAt: null },
      orderBy: [{ filledAt: "desc" }, { id: "desc" }],
      omit,
      ...pageArgs(query),
    });
    return toPage(rows, query.limit);
  },

  get(vehicleId: string, id: string) {
    return db.fuelTransaction.findFirst({ where: live(vehicleId, id), omit });
  },

  async create(vehicleId: string, input: CreateFuelInput) {
    await documentsService.assertReceipt(vehicleId, input.receiptId);
    return db.fuelTransaction.create({ data: { ...input, vehicleId }, omit });
  },

  async update(vehicleId: string, id: string, input: UpdateFuelInput) {
    await documentsService.assertReceipt(vehicleId, input.receiptId);
    const { count } = await db.fuelTransaction.updateMany({ where: live(vehicleId, id), data: input });
    return count ? fuelService.get(vehicleId, id) : null;
  },

  async remove(vehicleId: string, id: string) {
    const { count } = await db.fuelTransaction.updateMany({
      where: live(vehicleId, id),
      data: { deletedAt: new Date() },
    });
    return count > 0;
  },
};
