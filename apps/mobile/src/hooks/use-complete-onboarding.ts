import { useMutation, useQueryClient } from '@tanstack/react-query';

import { ApiError } from '@/api/client';
import { onboardingApi, type CompleteOnboardingInput } from '@/api/onboarding.api';
import { queryKeys } from '@/api/query-keys';
import { vehiclesApi } from '@/api/vehicles.api';
import { refreshSession } from '@/lib/auth-client';

import { saveStartingOdometer } from './use-vehicles';

type Input = { vehicle?: NonNullable<CompleteOnboardingInput['vehicle']> & { odometerKm?: number } };

export function useCompleteOnboarding() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ vehicle }: Input) => {
      const { odometerKm, ...car } = vehicle ?? {};
      try {
        await onboardingApi.complete(vehicle ? { vehicle: car as NonNullable<CompleteOnboardingInput['vehicle']> } : {});
      } catch (err) {
        // 409 = already onboarded (e.g. a double submit landed first): same outcome as success
        if (!(err instanceof ApiError && err.status === 409)) throw err;
        return;
      }
      // onboarding doesn't return the vehicle; it is the user's only one
      // shortcut: two calls; have POST /onboarding/complete accept odometerKm (or return the vehicle) to make it one.
      if (odometerKm != null) {
        const [first] = await vehiclesApi.list().catch(() => []);
        if (first) await saveStartingOdometer(first.id, odometerKm);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.vehicles });
      refreshSession(); // onboardedAt is now set; the root layout switches to (tabs)
    },
  });
}
