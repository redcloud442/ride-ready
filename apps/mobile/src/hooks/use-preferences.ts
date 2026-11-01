import type { UserPreferences } from '@ride-ready/core';
import { useMutation } from '@tanstack/react-query';

import { authApi } from '@/api/auth.api';
import { authClient, refreshSession } from '@/lib/auth-client';
import { defaultCurrency } from '@/utils/format';

// Preferences live on the account (User.preferences), so they follow the user across devices.
export function usePreferences(): UserPreferences {
  const { data } = authClient.useSession();
  return (data?.user.preferences as UserPreferences | null | undefined) ?? {};
}

/** The currency every new record and form uses: the profile's, else the phone's region. */
export function useCurrency() {
  return usePreferences().currency ?? defaultCurrency();
}

export function useUpdatePreferences() {
  const current = usePreferences();
  return useMutation({
    mutationFn: (patch: UserPreferences) => authApi.updatePreferences({ ...current, ...patch }),
    onSuccess: refreshSession,
  });
}
