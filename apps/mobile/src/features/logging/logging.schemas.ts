import { completeFuelAmounts, EXPENSE_CATEGORIES, MAINTENANCE_KINDS } from '@ride-ready/core';
import { z } from 'zod';

// Form schemas for the log screens. Text inputs give strings; these turn them into the numbers and
// dates the API expects (limits mirror apps/api/src/lib/schemas.ts). The API re-validates.

// "45,5" and "45.5" both parse; empty means "not given".
const parseNumber = (v: unknown) => {
  if (typeof v !== 'string') return v;
  const s = v.trim().replace(',', '.');
  return s === '' ? undefined : Number(s);
};

const number = (label: string, refine: (n: z.ZodNumber) => z.ZodNumber = (n) => n) =>
  z.preprocess(
    parseNumber,
    refine(z.number({ error: (iss) => (iss.input === undefined ? `Enter ${label}` : 'Enter a number') })),
  );

const optionalNumber = (refine: (n: z.ZodNumber) => z.ZodNumber = (n) => n) =>
  z.preprocess(parseNumber, refine(z.number({ error: 'Enter a number' })).optional());

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Keep it under ${max} characters`)
    .transform((s) => s || undefined);

const pastDate = z.date().refine((d) => d.getTime() <= Date.now() + 86_400_000, "Can't be in the future");

const currency = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z]{3}$/, 'Use a 3-letter code like EUR');

const odometer = optionalNumber((n) => n.nonnegative('Must be 0 or more').max(2_000_000, 'Check the reading'));
const money = (label: string) => number(label, (n) => n.nonnegative('Must be 0 or more').max(1_000_000_000));

export const odometerFormSchema = z.object({
  readAt: pastDate,
  km: number('the reading', (n) => n.nonnegative('Must be 0 or more').max(2_000_000, 'Check the reading')),
});

// Any two of liters / price per liter / total are enough; the third is computed (completeFuelAmounts).
export const fuelFormSchema = z
  .object({
    filledAt: pastDate,
    odometerKm: odometer,
    liters: optionalNumber((n) => n.positive('Must be more than 0').max(1000)),
    pricePerLiter: optionalNumber((n) => n.positive('Must be more than 0').max(1000)),
    totalPaid: optionalNumber((n) => n.nonnegative('Must be 0 or more').max(1_000_000_000)),
    discount: optionalNumber((n) => n.nonnegative('Must be 0 or more')),
    currency,
    fullFill: z.boolean(),
    station: optionalText(100),
  })
  .transform((d, ctx) => {
    const amounts = completeFuelAmounts(d);
    if (!amounts) {
      ctx.addIssue({ code: 'custom', path: ['totalPaid'], message: 'Enter two of liters, price per liter and total' });
      return z.NEVER;
    }
    return { ...d, ...amounts };
  });

export const chargingFormSchema = z
  .object({
    startedAt: pastDate,
    odometerKm: odometer,
    kwhPurchased: number('kWh', (n) => n.positive('Must be more than 0').max(1000)),
    cost: money('the cost'),
    currency,
    chargerType: optionalText(40),
    location: optionalText(200),
    socStartPct: optionalNumber((n) => n.min(0).max(100, 'Use 0–100')),
    socEndPct: optionalNumber((n) => n.min(0).max(100, 'Use 0–100')),
  })
  .refine((d) => d.socStartPct == null || d.socEndPct == null || d.socEndPct >= d.socStartPct, {
    path: ['socEndPct'],
    message: "Can't be below the start level",
  });

export const maintenanceFormSchema = z.object({
  performedAt: pastDate,
  odometerKm: odometer,
  kind: z.enum(MAINTENANCE_KINDS, { error: 'Choose a type' }),
  description: z.string().trim().min(1, 'Describe what was done').max(1000),
  laborCost: optionalNumber((n) => n.nonnegative('Must be 0 or more')),
  partsCost: optionalNumber((n) => n.nonnegative('Must be 0 or more')),
  currency,
  workshop: optionalText(100),
});

export const expenseFormSchema = z.object({
  paidAt: pastDate,
  category: z.enum(EXPENSE_CATEGORIES, { error: 'Choose a category' }),
  amount: money('the amount'),
  currency,
  note: optionalText(500),
});

export type OdometerForm = z.input<typeof odometerFormSchema>;
export type FuelForm = z.input<typeof fuelFormSchema>;
export type ChargingForm = z.input<typeof chargingFormSchema>;
export type MaintenanceForm = z.input<typeof maintenanceFormSchema>;
export type ExpenseForm = z.input<typeof expenseFormSchema>;

// Only from a supported measurement, never a guess (plan: battery health only when measured).
export const BATTERY_SOURCES = ['OBD reading', 'Dealer report', 'Vehicle display'] as const;

export const batteryFormSchema = z.object({
  measuredAt: pastDate,
  sohPct: number('the state of health', (n) => n.min(0).max(100, 'Use 0–100')),
  source: z.string().trim().min(1, 'Choose where the value comes from').max(60),
});

export type BatteryForm = z.input<typeof batteryFormSchema>;
