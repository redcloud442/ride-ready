import { z } from "zod";
import { currency, optionalText, pastDate } from "../../lib/schemas.ts";
import { listQuerySchema } from "../../plugins/vehicle-records.ts";

// Unit follows from the kind, so it isn't client input.
export const ENERGY_KINDS = {
  gasoline_regular: "L",
  gasoline_premium: "L",
  diesel: "L",
  electricity_ac: "kWh",
  electricity_dc: "kWh",
} as const;
const kind = z.enum(Object.keys(ENERGY_KINDS) as [keyof typeof ENERGY_KINDS]);

// Plan §3: timestamped community submissions until official/provider feeds are wired in.
export const submitEnergyPriceSchema = z.object({
  kind,
  price: z.number().positive().max(1000),
  currency,
  region: optionalText(80),
  observedAt: pastDate,
});

export const energyPriceQuerySchema = listQuerySchema.extend({
  kind: kind.optional(),
  region: z.string().trim().min(1).max(80).optional(),
});

export type SubmitEnergyPriceInput = z.infer<typeof submitEnergyPriceSchema>;
export type EnergyPriceQuery = z.infer<typeof energyPriceQuerySchema>;
