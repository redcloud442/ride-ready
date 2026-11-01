import { db } from "../../lib/db.ts";
import { garageOwnerIds } from "../../lib/family.ts";
import type { CreateVehicleInput, UpdateVehicleInput } from "./vehicles.schema.ts";

const vehicleSelect = {
  id: true,
  type: true,
  propulsion: true,
  make: true,
  model: true,
  year: true,
  variant: true,
  bodyStyle: true,
  color: true,
  userId: true,
} as const;

// `shared`: the vehicle belongs to another member of the user's family
const summary =
  (me: string) =>
  <T extends { userId: string }>({ userId, ...v }: T) => ({ ...v, shared: userId !== me });

// A live vehicle owned by the user; anything else reads as not found. Edits and deletes are owner-only.
const owned = (userId: string, id: string) => ({ id, userId, deletedAt: null });

// Every query is scoped by the session user's id (callers never pass a client-supplied one); reads also
// cover garages shared through a family.
export const vehiclesService = {
  async listForUser(userId: string) {
    const rows = await db.vehicle.findMany({
      where: { userId: { in: await garageOwnerIds(userId) }, deletedAt: null },
      select: vehicleSelect,
      orderBy: { createdAt: "asc" },
    });
    return rows.map(summary(userId));
  },

  async getForUser(userId: string, id: string) {
    const row = await db.vehicle.findFirst({
      where: { id, userId: { in: await garageOwnerIds(userId) }, deletedAt: null },
      select: vehicleSelect,
    });
    return row && summary(userId)(row);
  },

  async create(userId: string, input: CreateVehicleInput) {
    return summary(userId)(await db.vehicle.create({ data: { ...input, userId }, select: vehicleSelect }));
  },

  // Returns null when the vehicle isn't the user's own (or is deleted).
  async update(userId: string, id: string, input: UpdateVehicleInput) {
    const { count } = await db.vehicle.updateMany({ where: owned(userId, id), data: input });
    const row = count ? await db.vehicle.findUnique({ where: { id }, select: vehicleSelect }) : null;
    return row && summary(userId)(row);
  },

  // Soft delete: the tombstone lets offline clients sync the removal. Returns false when not found.
  async remove(userId: string, id: string) {
    const { count } = await db.vehicle.updateMany({
      where: owned(userId, id),
      data: { deletedAt: new Date() },
    });
    return count > 0;
  },
};
