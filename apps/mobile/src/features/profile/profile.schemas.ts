import { z } from 'zod';

import { emailField, nameField, newPasswordField } from '@/schemas/account.schema';

export const nameSchema = z.object({ name: nameField });

export const emailSchema = z.object({ newEmail: emailField });

export const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Enter your current password'),
    newPassword: newPasswordField,
    confirmPassword: z.string().min(1, 'Re-enter the new password'),
  })
  .refine((d) => d.newPassword === d.confirmPassword, { path: ['confirmPassword'], message: "Passwords don't match" });

export const currencySchema = z.object({
  currency: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{3}$/, 'Use a 3-letter code like EUR or PHP'),
});

export type NameValues = z.infer<typeof nameSchema>;
export type EmailValues = z.infer<typeof emailSchema>;
export type PasswordValues = z.infer<typeof passwordSchema>;
export type CurrencyValues = z.infer<typeof currencySchema>;
