import type { OdometerReading } from "../../generated/prisma/client.ts";
import { db } from "../../lib/db.ts";
import { pageArgs, toPage, type ListQuery } from "../../plugins/vehicle-records.ts";
import type { CreateOdometerInput, UpdateOdometerInput } from "./odometer.schema.ts";

const omit = { deletedAt: true } as const;
const live = (vehicleId: string, id: string) => ({ id, vehicleId, deletedAt: null });

// A reading that disagrees with history (lower than an earlier one, or higher than a later one) is
// kept and flagged, never rejected or overwritten.
async function withConflict(reading: Omit<OdometerReading, "deletedAt">) {
  const conflicts = await db.odometerReading.count({
    where: {
      vehicleId: reading.vehicleId,
      deletedAt: null,
      id: { not: reading.id },
      OR: [
        { readAt: { lt: reading.readAt }, km: { gt: reading.km } },
        { readAt: { gt: reading.readAt }, km: { lt: reading.km } },
      ],
    },
  });
  return { ...reading, conflict: conflicts > 0 };
}

export const odometerService = {
  async list(vehicleId: string, query: ListQuery) {
    const rows = await db.odometerReading.findMany({
      where: { vehicleId, deletedAt: null },
      orderBy: [{ readAt: "desc" }, { id: "desc" }],
      omit,
      ...pageArgs(query),
    });
    return toPage(rows, query.limit);
  },

  async get(vehicleId: string, id: string) {
    const reading = await db.odometerReading.findFirst({ where: live(vehicleId, id), omit });
    return reading && withConflict(reading);
  },

  async create(vehicleId: string, input: CreateOdometerInput) {
    return withConflict(await db.odometerReading.create({ data: { ...input, vehicleId }, omit }));
  },

  async update(vehicleId: string, id: string, input: UpdateOdometerInput) {
    const { count } = await db.odometerReading.updateMany({ where: live(vehicleId, id), data: input });
    return count ? odometerService.get(vehicleId, id) : null;
  },

  async remove(vehicleId: string, id: string) {
    const { count } = await db.odometerReading.updateMany({
      where: live(vehicleId, id),
      data: { deletedAt: new Date() },
    });
    return count > 0;
  },
};
