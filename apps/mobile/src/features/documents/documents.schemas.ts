import { DOCUMENT_KINDS } from '@ride-ready/core';
import { z } from 'zod';

import type { PickedFile } from '@/hooks/use-pick-file';

export const documentFormSchema = z.object({
  kind: z.enum(DOCUMENT_KINDS, { error: 'Choose a type' }),
  title: z
    .string()
    .trim()
    .max(120, 'Keep it under 120 characters')
    .transform((s) => s || null),
  hasExpiry: z.boolean(),
  expiresAt: z.date(),
  /** for receipts and photos: read it and open a prefilled log form */
  readNow: z.boolean(),
  file: z.custom<PickedFile | null>((v) => !!v, 'Choose a photo or PDF'),
});

export type DocumentFormInput = z.input<typeof documentFormSchema>;
export type DocumentFormValues = z.output<typeof documentFormSchema>;
