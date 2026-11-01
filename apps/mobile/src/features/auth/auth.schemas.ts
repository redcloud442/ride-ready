import { z } from 'zod';

import { emailField as email, nameField, newPasswordField } from '@/schemas/account.schema';

// Client-side form schemas (UX). The API re-validates: Better Auth length + the letter/number hook.

export const signInSchema = z.object({
  email,
  password: z.string().min(1, 'Enter your password'),
});

export const signUpSchema = z
  .object({
    name: nameField,
    email,
    password: newPasswordField,
    confirmPassword: z.string().min(1, 'Re-enter your password'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ['confirmPassword'],
    message: "Passwords don't match",
  });

export type SignInValues = z.infer<typeof signInSchema>;
export type SignUpValues = z.infer<typeof signUpSchema>;
