import { z } from 'zod';

// Account fields shared by sign-up and the profile screen. The API re-validates: Better Auth length +
// the letter/number hook in apps/api/src/lib/auth.ts.

export const emailField = z.string().trim().pipe(z.email('Enter a valid email address'));

export const nameField = z.string().trim().min(1, 'Enter your name').max(60, 'Keep it under 60 characters');

export const newPasswordField = z
  .string()
  .min(8, 'Use at least 8 characters')
  .max(128, 'Use at most 128 characters')
  .regex(/[A-Za-z]/, 'Include at least one letter')
  .regex(/\d/, 'Include at least one number');
