import { z } from "zod";
import { odometerKm, pastDate } from "../../lib/schemas.ts";

export const createOdometerSchema = z.object({
  readAt: pastDate,
  km: odometerKm,
  // trip_gps and receipt readings come from those flows, not from this endpoint
  source: z.enum(["manual", "photo_ocr"]).default("manual"),
  confidence: z.number().min(0).max(1).nullable().optional(), // set by OCR
});

export const updateOdometerSchema = z.object({ readAt: pastDate, km: odometerKm }).partial();

export type CreateOdometerInput = z.infer<typeof createOdometerSchema>;
export type UpdateOdometerInput = z.infer<typeof updateOdometerSchema>;
