import { z } from "zod";
import { pastDate, percent, text } from "../../lib/schemas.ts";

// Only record state of health from a supported measurement (OBD reading, dealer report), never a guess.
export const createBatteryHealthSchema = z.object({
  measuredAt: pastDate,
  sohPct: percent,
  source: text(60),
});

export const updateBatteryHealthSchema = createBatteryHealthSchema.partial();

export type CreateBatteryHealthInput = z.infer<typeof createBatteryHealthSchema>;
export type UpdateBatteryHealthInput = z.infer<typeof updateBatteryHealthSchema>;
