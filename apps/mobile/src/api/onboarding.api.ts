import type { CreateVehicleInput } from './vehicles.api';

import { request } from './client';

export type CompleteOnboardingInput = {
  vehicle?: CreateVehicleInput;
};

export const onboardingApi = {
  complete: (input: CompleteOnboardingInput) =>
    request<{ ok: true }>('/api/onboarding/complete', { method: 'POST', body: JSON.stringify(input) }),
};
