import type { VehicleTransferPreview } from "@ride-ready/core";
import { Prisma } from "../../generated/prisma/client.ts";
import { db } from "../../lib/db.ts";
import { httpError } from "../../lib/errors.ts";
import { deleteObjects } from "../../lib/storage.ts";
import type { CreateTransferInput } from "./transfers.schema.ts";

// Long enough to meet the buyer, short enough that a photo of the code goes stale.
const TTL_MS = 72 * 3_600_000;
const live = { deletedAt: null } as const;

async function preview(userId: string, id: string): Promise<VehicleTransferPreview | null> {
  const t = await db.vehicleTransfer.findUnique({ where: { id }, include: { vehicle: true } });
  if (!t) return null;
  const mine = t.fromUserId === userId;
  // anyone else sees it only while it can still be accepted, or once they accepted it themselves
  const open = !t.acceptedAt && t.expiresAt > new Date() && !t.vehicle.deletedAt;
  if (!mine && !open && t.toUserId !== userId) return null;

  const docs = t.includeReceipts ? live : { ...live, kind: { not: "receipt" } };
  const withKm = { ...live, odometerKm: { not: null } };
  const { _count: c } = await db.vehicle.findUniqueOrThrow({
    where: { id: t.vehicleId },
    select: {
      _count: {
        select: {
          maintenance: { where: live },
          odometerReadings: { where: live },
          fuelTransactions: { where: live },
          chargingSessions: { where: live },
          expenses: { where: live },
          documents: { where: docs },
        },
      },
    },
  });
  // without costs, fill-ups and charges arrive only as their odometer values
  const asReadings = t.includeCosts
    ? 0
    : (await db.fuelTransaction.count({ where: { vehicleId: t.vehicleId, ...withKm } })) +
      (await db.chargingSession.count({ where: { vehicleId: t.vehicleId, ...withKm } }));
  const v = t.vehicle;
  return {
    id: t.id,
    expiresAt: t.expiresAt.toISOString(),
    acceptedAt: t.acceptedAt?.toISOString() ?? null,
    includeReceipts: t.includeReceipts,
    includeCosts: t.includeCosts,
    mine,
    vehicle: {
      id: v.id,
      type: v.type,
      propulsion: v.propulsion,
      make: v.make,
      model: v.model,
      year: v.year,
      variant: v.variant,
      bodyStyle: v.bodyStyle as VehicleTransferPreview["vehicle"]["bodyStyle"],
      color: v.color as VehicleTransferPreview["vehicle"]["color"],
    },
    counts: {
      maintenance: c.maintenance,
      odometer: c.odometerReadings + asReadings,
      fuel: t.includeCosts ? c.fuelTransactions : 0,
      charging: t.includeCosts ? c.chargingSessions : 0,
      expenses: t.includeCosts ? c.expenses : 0,
      documents: c.documents,
    },
  };
}

export const transfersService = {
  preview,

  /** A new code for one of the user's own vehicles (replacing any open one); null when it isn't theirs. */
  async create(userId: string, { vehicleId, includeReceipts, includeCosts }: CreateTransferInput) {
    const owned = await db.vehicle.findFirst({ where: { id: vehicleId, userId, ...live }, select: { id: true } });
    if (!owned) return null;
    const t = await db.$transaction(async (tx) => {
      await tx.vehicleTransfer.deleteMany({ where: { vehicleId, acceptedAt: null } });
      return tx.vehicleTransfer.create({
        data: {
          vehicleId,
          fromUserId: userId,
          includeCosts,
          includeReceipts: includeReceipts && includeCosts, // a receipt shows what was paid
          expiresAt: new Date(Date.now() + TTL_MS),
        },
      });
    });
    return preview(userId, t.id);
  },

  /**
   * Moves the vehicle with its records and files to `userId`. One transaction: the code is claimed once,
   * so two scans can't both win. The seller's trips (location history) are scrubbed, never handed over.
   */
  async accept(userId: string, id: string) {
    const now = new Date();
    const vehicleId = await db.$transaction(async (tx) => {
      const claimed = await tx.vehicleTransfer.updateMany({
        where: { id, acceptedAt: null, expiresAt: { gt: now }, fromUserId: { not: userId } },
        data: { acceptedAt: now, toUserId: userId },
      });
      if (!claimed.count) throw httpError(404, "This transfer code has expired or was already used.");
      const t = await tx.vehicleTransfer.findUniqueOrThrow({ where: { id } });

      const moved = await tx.vehicle.updateMany({
        where: { id: t.vehicleId, userId: t.fromUserId, ...live },
        data: { userId },
      });
      if (!moved.count) throw httpError(409, "The seller no longer has this vehicle.");

      // tombstones stay for offline sync; the route, distance and notes do not
      await tx.trip.updateMany({
        where: { vehicleId: t.vehicleId },
        data: { route: Prisma.DbNull, gpsKm: null, notes: null, deletedAt: now },
      });

      if (!t.includeCosts) {
        // what the seller paid stays with the seller; the odometer values of fill-ups and charges stay as readings
        const vehicleId = t.vehicleId;
        const withKm = { vehicleId, ...live, odometerKm: { not: null } };
        const fills = await tx.fuelTransaction.findMany({ where: withKm, select: { filledAt: true, odometerKm: true } });
        const charges = await tx.chargingSession.findMany({ where: withKm, select: { startedAt: true, odometerKm: true } });
        await tx.odometerReading.createMany({
          data: [
            ...fills.map((f) => ({ vehicleId, readAt: f.filledAt, km: f.odometerKm!, source: "manual" as const })),
            ...charges.map((c) => ({ vehicleId, readAt: c.startedAt, km: c.odometerKm!, source: "manual" as const })),
          ],
        });
        await tx.fuelTransaction.updateMany({ where: { vehicleId, ...live }, data: { deletedAt: now } });
        await tx.chargingSession.updateMany({ where: { vehicleId, ...live }, data: { deletedAt: now } });
        await tx.expense.updateMany({ where: { vehicleId, ...live }, data: { deletedAt: now } });
        await tx.maintenanceRecord.updateMany({ where: { vehicleId }, data: { laborCost: null, partsCost: null, currency: null } });
      }

      if (!t.includeReceipts) {
        const receipts = await tx.vehicleDocument.findMany({
          where: { vehicleId: t.vehicleId, kind: "receipt" },
          select: { id: true, storageKey: true },
        });
        const ids = receipts.map((r) => r.id);
        await tx.fuelTransaction.updateMany({ where: { receiptId: { in: ids } }, data: { receiptId: null } });
        await tx.chargingSession.updateMany({ where: { receiptId: { in: ids } }, data: { receiptId: null } });
        await tx.vehicleDocument.updateMany({ where: { id: { in: ids }, ...live }, data: { deletedAt: now } });
        // last step inside the transaction: if storage fails, nothing moves and no file is left orphaned
        if (receipts.length) {
          await deleteObjects(receipts.map((r) => r.storageKey)).catch(() => {
            throw httpError(503, "Couldn't remove the receipt photos. Nothing was transferred; try again.");
          });
        }
      }
      return t.vehicleId;
    }, { timeout: 20_000 }); // storage round trips run inside it

    return { vehicleId };
  },

  /** Seller withdraws an open code. false when there's nothing to cancel. */
  async cancel(userId: string, id: string) {
    const { count } = await db.vehicleTransfer.deleteMany({ where: { id, fromUserId: userId, acceptedAt: null } });
    return count > 0;
  },
};
