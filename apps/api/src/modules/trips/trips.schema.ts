import { z } from "zod";
import { optionalText, pastDate } from "../../lib/schemas.ts";

const fields = {
  startedAt: pastDate,
  endedAt: pastDate.nullable().optional(),
  // GPS distance stays separate from odometer readings; it never overwrites them
  gpsKm: z.number().nonnegative().max(20_000).nullable().optional(),
  // encoded polyline; private location history, so it's returned only by GET /:id
  route: z.string().min(1).max(500_000).optional(),
  purpose: z.enum(["personal", "business"]),
  notes: optionalText(500),
};

const endsAfterStart = (d: { startedAt?: Date; endedAt?: Date | null }) =>
  !d.startedAt || !d.endedAt || d.endedAt >= d.startedAt;
const endError = { message: "can't be before startedAt", path: ["endedAt"] };

export const createTripSchema = z
  .object({ ...fields, purpose: fields.purpose.default("personal") })
  .refine(endsAfterStart, endError);
// shortcut: only checks order when both times are in the same request; compare with the stored row if partial edits matter.
export const updateTripSchema = z.object(fields).partial().refine(endsAfterStart, endError);

export type CreateTripInput = z.infer<typeof createTripSchema>;
export type UpdateTripInput = z.infer<typeof updateTripSchema>;
