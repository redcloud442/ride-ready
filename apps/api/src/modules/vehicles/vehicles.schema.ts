import { BODY_STYLES, PROPULSIONS, VEHICLE_COLORS, VEHICLE_TYPES } from "@ride-ready/core";
import { z } from "zod";

// Request schemas (trust boundary). Unknown keys are stripped.
const make = z.string().trim().min(1).max(60);
const model = z.string().trim().min(1).max(60);
const year = z.int().min(1900).max(new Date().getFullYear() + 1);
const bodyStyle = z.enum(BODY_STYLES).nullable();
const color = z.enum(VEHICLE_COLORS).nullable();

export const createVehicleSchema = z.object({
  type: z.enum(VEHICLE_TYPES),
  propulsion: z.enum(PROPULSIONS),
  make,
  model,
  year,
  bodyStyle: bodyStyle.optional(),
  color: color.optional(),
});

// type and propulsion are fixed once created: fuel/charging records depend on them.
export const updateVehicleSchema = z
  .object({ make, model, year, variant: z.string().trim().max(60).nullable(), bodyStyle, color })
  .partial();

export const vehicleParamsSchema = z.object({ id: z.uuid() });

export type CreateVehicleInput = z.infer<typeof createVehicleSchema>;
export type UpdateVehicleInput = z.infer<typeof updateVehicleSchema>;
export type VehicleParams = z.infer<typeof vehicleParamsSchema>;
