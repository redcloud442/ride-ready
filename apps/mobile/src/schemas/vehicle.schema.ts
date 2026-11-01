import { BODY_STYLES, PROPULSIONS, VEHICLE_COLORS, VEHICLE_TYPES } from '@ride-ready/core';
import { z } from 'zod';

// Vehicle fields shared by onboarding and Garage > Add vehicle. Mirrors apps/api vehicles.schema.ts.
const MAX_YEAR = new Date().getFullYear() + 1;

export const vehicleFormSchema = z.object({
  type: z.enum(VEHICLE_TYPES, { error: 'Choose a vehicle type' }),
  propulsion: z.enum(PROPULSIONS, { error: 'Choose how it is powered' }),
  // optional: picks the illustration only; send bodyStyleOf(values) so it always matches the type
  bodyStyle: z.enum(BODY_STYLES).optional(),
  // optional paint for the picture; null = the picture's own paint
  color: z.enum(VEHICLE_COLORS).nullable().optional(),
  make: z.string().trim().min(1, 'Enter the make').max(60),
  model: z.string().trim().min(1, 'Enter the model').max(60),
  year: z.coerce
    .number({ error: 'Enter the year' })
    .int()
    .min(1900, `Enter a year between 1900 and ${MAX_YEAR}`)
    .max(MAX_YEAR, `Enter a year between 1900 and ${MAX_YEAR}`),
  // optional: saved as the first odometer reading, the baseline for distance and economy
  odometerKm: z.preprocess(
    (v) => (typeof v === 'string' ? (v.trim() === '' ? undefined : Number(v.trim().replace(',', '.'))) : v),
    z.number({ error: 'Enter a number' }).nonnegative('Must be 0 or more').max(2_000_000, 'Check the reading').optional(),
  ),
});

export type VehicleFormInput = z.input<typeof vehicleFormSchema>;
export type VehicleFormValues = z.output<typeof vehicleFormSchema>;

// Editable after creation: type and propulsion are fixed (records depend on them).
export const vehicleEditSchema = vehicleFormSchema.pick({ make: true, model: true, year: true, bodyStyle: true, color: true }).extend({
  variant: z
    .string()
    .trim()
    .max(60, 'Keep it under 60 characters')
    .transform((s) => s || null),
});

export type VehicleEditInput = z.input<typeof vehicleEditSchema>;
export type VehicleEditValues = z.output<typeof vehicleEditSchema>;
