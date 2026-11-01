import { z } from "zod";
import { currency, money, odometerKm, optionalText, pastDate, percent } from "../../lib/schemas.ts";

const fields = {
  startedAt: pastDate,
  odometerKm: odometerKm.nullable().optional(),
  receiptId: z.uuid().nullable().optional(), // a receipt document of the same vehicle
  kwhPurchased: z.number().positive().max(1000), // energy bought, not energy the battery received
  cost: money,
  currency,
  chargerType: optionalText(40),
  location: optionalText(200),
  tariff: optionalText(100),
  socStartPct: percent.nullable().optional(),
  socEndPct: percent.nullable().optional(),
};

const socInOrder = (d: { socStartPct?: number | null; socEndPct?: number | null }) =>
  d.socStartPct == null || d.socEndPct == null || d.socEndPct >= d.socStartPct;
const socError = { message: "can't be below socStartPct", path: ["socEndPct"] };

export const createChargingSchema = z.object(fields).refine(socInOrder, socError);
// shortcut: only checks SoC order when both values are in the same request; compare with the stored row if partial edits matter.
export const updateChargingSchema = z.object(fields).partial().refine(socInOrder, socError);

export type CreateChargingInput = z.infer<typeof createChargingSchema>;
export type UpdateChargingInput = z.infer<typeof updateChargingSchema>;
