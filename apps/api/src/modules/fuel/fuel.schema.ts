import { z } from "zod";
import { currency, money, odometerKm, optionalText, pastDate } from "../../lib/schemas.ts";

// Amounts are what the receipt says; totalPaid is not recomputed from liters × price (rounding, promos).
const fields = {
  filledAt: pastDate,
  odometerKm: odometerKm.nullable().optional(),
  receiptId: z.uuid().nullable().optional(), // a receipt document of the same vehicle
  liters: z.number().positive().max(1000),
  pricePerLiter: z.number().positive().max(1000),
  discount: money,
  totalPaid: money,
  currency,
  fullFill: z.boolean(),
  station: optionalText(100),
};

export const createFuelSchema = z.object({ ...fields, discount: money.default(0) });
export const updateFuelSchema = z.object(fields).partial();

export type CreateFuelInput = z.infer<typeof createFuelSchema>;
export type UpdateFuelInput = z.infer<typeof updateFuelSchema>;
