import { db } from "../../lib/db.ts";
import { pageArgs, toPage, type ListQuery } from "../../plugins/vehicle-records.ts";
import type { CreateTripInput, UpdateTripInput } from "./trips.schema.ts";

const omit = { deletedAt: true } as const;
const live = (vehicleId: string, id: string) => ({ id, vehicleId, deletedAt: null });

export const tripsService = {
  async list(vehicleId: string, query: ListQuery) {
    const rows = await db.trip.findMany({
      where: { vehicleId, deletedAt: null },
      orderBy: [{ startedAt: "desc" }, { id: "desc" }],
      omit: { ...omit, route: true }, // routes are large and private; fetch one trip to get it
      ...pageArgs(query),
    });
    return toPage(rows, query.limit);
  },

  get(vehicleId: string, id: string) {
    return db.trip.findFirst({ where: live(vehicleId, id), omit });
  },

  create(vehicleId: string, input: CreateTripInput) {
    return db.trip.create({ data: { ...input, vehicleId }, omit: { ...omit, route: true } });
  },

  async update(vehicleId: string, id: string, input: UpdateTripInput) {
    const { count } = await db.trip.updateMany({ where: live(vehicleId, id), data: input });
    return count ? tripsService.get(vehicleId, id) : null;
  },

  async remove(vehicleId: string, id: string) {
    const { count } = await db.trip.updateMany({
      where: live(vehicleId, id),
      data: { deletedAt: new Date() },
    });
    return count > 0;
  },
};
