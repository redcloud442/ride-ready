import { randomUUID } from "node:crypto";
import { db } from "../../lib/db.ts";
import { httpError } from "../../lib/errors.ts";
import { downloadUrl, uploadUrl } from "../../lib/storage.ts";
import { pageArgs, toPage, type ListQuery } from "../../plugins/vehicle-records.ts";
import type { CreateDocumentInput, UpdateDocumentInput } from "./documents.schema.ts";

// Storage keys stay server-side; clients only ever see short-lived URLs.
const omit = { deletedAt: true, storageKey: true } as const;
const live = (vehicleId: string, id: string) => ({ id, vehicleId, deletedAt: null });

export const documentsService = {
  async list(vehicleId: string, query: ListQuery) {
    const rows = await db.vehicleDocument.findMany({
      where: { vehicleId, deletedAt: null },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      omit,
      ...pageArgs(query),
    });
    return toPage(rows, query.limit);
  },

  async get(vehicleId: string, id: string) {
    const doc = await db.vehicleDocument.findFirst({ where: live(vehicleId, id), omit: { deletedAt: true } });
    if (!doc) return null;
    const { storageKey, ...rest } = doc;
    // shortcut: no upload confirmation, so a never-uploaded file yields a URL that 404s; add an uploadedAt
    // set by a storage event (or a HEAD check) when that matters.
    return { ...rest, downloadUrl: await downloadUrl(storageKey) };
  },

  async create(vehicleId: string, { sizeBytes, ...input }: CreateDocumentInput) {
    const storageKey = `vehicles/${vehicleId}/${randomUUID()}`;
    const doc = await db.vehicleDocument.create({ data: { ...input, vehicleId, storageKey }, omit });
    const url = await uploadUrl(storageKey, input.mimeType, sizeBytes);
    return {
      ...doc,
      upload: { url, method: "PUT", headers: { "content-type": input.mimeType, "content-length": String(sizeBytes) } },
    };
  },

  async update(vehicleId: string, id: string, input: UpdateDocumentInput) {
    const { count } = await db.vehicleDocument.updateMany({ where: live(vehicleId, id), data: input });
    return count ? documentsService.get(vehicleId, id) : null;
  },

  // shortcut: the object stays in storage after a soft delete; purge it in a BullMQ job once sync has
  // propagated the tombstone.
  async remove(vehicleId: string, id: string) {
    const { count } = await db.vehicleDocument.updateMany({
      where: live(vehicleId, id),
      data: { deletedAt: new Date() },
    });
    return count > 0;
  },

  // A record may only point at a live receipt of the same vehicle.
  async assertReceipt(vehicleId: string, receiptId: string | null | undefined) {
    if (!receiptId) return;
    const doc = await db.vehicleDocument.findFirst({ where: { ...live(vehicleId, receiptId), kind: "receipt" } });
    if (!doc) throw httpError(422, "receiptId must be a receipt document of this vehicle");
  },
};
