import { expoClient } from '@better-auth/expo/client';
import { inferAdditionalFields, organizationClient } from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';
import * as SecureStore from 'expo-secure-store';

export const authClient = createAuthClient({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  plugins: [
    expoClient({
      scheme: 'rideready', // app.json "scheme"
      storagePrefix: 'rideready',
      storage: SecureStore,
    }),
    // mirrors user.additionalFields in apps/api/src/lib/auth.ts
    inferAdditionalFields({
      user: { onboardedAt: { type: 'date', required: false }, preferences: { type: 'json', required: false } },
    }),
    organizationClient(), // family sharing (features/family)
  ],
});

// Re-reads the session everywhere useSession() is used (e.g. after onboarding sets onboardedAt).
export const refreshSession = () => authClient.$store.notify('$sessionSignal');
