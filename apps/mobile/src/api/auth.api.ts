import type { UserPreferences } from '@ride-ready/core';

import { authClient } from '@/lib/auth-client';
import { queryClient } from '@/lib/query-client';

type BetterAuthResult = { error: { message?: string } | null };

// Better Auth returns { error } instead of throwing; throw so TanStack mutations see failures.
async function unwrap(call: Promise<BetterAuthResult>, fallback: string) {
  const { error } = await call;
  if (error) throw new Error(error.message || fallback);
}

export const authApi = {
  signInEmail: (input: { email: string; password: string }) =>
    unwrap(authClient.signIn.email(input), "Couldn't sign in. Check your email and password."),

  signUpEmail: (input: { name: string; email: string; password: string }) =>
    unwrap(authClient.signUp.email(input), "Couldn't create your account. Try again."),

  signInGoogle: () =>
    unwrap(
      authClient.signIn.social({ provider: 'google', callbackURL: '/' }),
      'Google sign-in failed. Try again.',
    ),

  async signOut() {
    await authClient.signOut();
    // cached garage data belongs to the previous user
    queryClient.clear();
  },

  // Profile: Better Auth's own endpoints (the API validates preferences and blocks `image`).
  updateName: (name: string) => unwrap(authClient.updateUser({ name }), "Couldn't save your name."),

  /** Sends the whole object: the server replaces it. */
  updatePreferences: (preferences: UserPreferences) =>
    unwrap(authClient.updateUser({ preferences }), "Couldn't save your preferences."),

  changeEmail: (newEmail: string) => unwrap(authClient.changeEmail({ newEmail }), "Couldn't change your email."),

  changePassword: (input: { currentPassword: string; newPassword: string }) =>
    unwrap(authClient.changePassword({ ...input, revokeOtherSessions: true }), "Couldn't change your password."),

  /** Password for email accounts; Google accounts need a recent sign-in instead. */
  async deleteAccount(password: string | undefined) {
    await unwrap(authClient.deleteUser(password ? { password } : {}), "Couldn't delete your account.");
    queryClient.clear();
  },
};
