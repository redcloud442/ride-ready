import { MAINTENANCE_KINDS } from "@ride-ready/core";
import { z } from "zod";
import { currency, money, odometerKm, optionalText, pastDate, text } from "../../lib/schemas.ts";

const part = z.object({
  name: text(100),
  partNumber: text(60).optional(),
  quantity: z.int().positive().max(1000).optional(),
});

const fields = {
  performedAt: pastDate,
  odometerKm: odometerKm.nullable().optional(),
  kind: z.enum(MAINTENANCE_KINDS),
  description: text(1000),
  parts: z.array(part).max(50),
  laborCost: money.nullable().optional(),
  partsCost: money.nullable().optional(),
  currency: currency.nullable().optional(),
  workshop: optionalText(100),
};

// Every amount carries its currency.
const costHasCurrency = (d: { laborCost?: number | null; partsCost?: number | null; currency?: string | null }) =>
  (d.laborCost == null && d.partsCost == null) || d.currency != null;
const currencyError = { message: "required with laborCost or partsCost", path: ["currency"] };

export const createMaintenanceSchema = z
  .object({ ...fields, parts: fields.parts.default([]) })
  .refine(costHasCurrency, currencyError);
// shortcut: checks currency only within the request; a cost edit on a row that already has a currency must resend it.
export const updateMaintenanceSchema = z.object(fields).partial().refine(costHasCurrency, currencyError);

export type CreateMaintenanceInput = z.infer<typeof createMaintenanceSchema>;
export type UpdateMaintenanceInput = z.infer<typeof updateMaintenanceSchema>;
