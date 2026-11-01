import { ENERGY_PRICE_KINDS } from '@ride-ready/core';
import { z } from 'zod';

const parseNumber = (v: unknown) => {
  if (typeof v !== 'string') return v;
  const s = v.trim().replace(',', '.');
  return s === '' ? undefined : Number(s);
};

// Mirrors apps/api energy-prices.schema.ts.
export const priceFormSchema = z.object({
  kind: z.enum(ENERGY_PRICE_KINDS, { error: 'Choose what the price is for' }),
  price: z.preprocess(
    parseNumber,
    z
      .number({ error: (iss) => (iss.input === undefined ? 'Enter the price' : 'Enter a number') })
      .positive('Must be more than 0')
      .max(1000, 'Check the price'),
  ),
  currency: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{3}$/, 'Use a 3-letter code like EUR'),
  region: z
    .string()
    .trim()
    .max(80)
    .transform((s) => s || null),
  observedAt: z.date().refine((d) => d.getTime() <= Date.now() + 86_400_000, "Can't be in the future"),
});

export type PriceFormInput = z.input<typeof priceFormSchema>;
export type PriceFormValues = z.output<typeof priceFormSchema>;
