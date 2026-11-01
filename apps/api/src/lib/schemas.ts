import { z } from "zod";

// Field building blocks shared by module schemas.
export const text = (max: number) => z.string().trim().min(1).max(max);
export const optionalText = (max: number) => text(max).nullable().optional();
export const currency = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z]{3}$/, "Use a 3-letter currency code (ISO 4217)");
export const money = z.number().nonnegative().max(1_000_000_000);
export const odometerKm = z.number().nonnegative().max(2_000_000);
export const percent = z.number().min(0).max(100);
// Event times arrive as ISO strings; a day of slack covers device clock skew.
export const pastDate = z.coerce
  .date()
  .refine((d) => d.getTime() <= Date.now() + 86_400_000, "Can't be in the future");

// User.preferences, written through Better Auth's /update-user (validated in lib/auth.ts). The client
// sends the whole object; unknown keys are dropped.
export const preferencesSchema = z.object({
  currency: currency.optional(), // default for new records when there's no last-used value
  tripsEnabled: z.boolean().optional(),
});
