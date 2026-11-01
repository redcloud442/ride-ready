import { z } from "zod";
import { createVehicleSchema } from "../vehicles/vehicles.schema.ts";

// `vehicle` is optional so the user can skip adding one.
export const completeOnboardingSchema = z.object({ vehicle: createVehicleSchema.optional() });

export type CompleteOnboardingInput = z.infer<typeof completeOnboardingSchema>;
