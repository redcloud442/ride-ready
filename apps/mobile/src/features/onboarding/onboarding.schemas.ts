import type { z } from 'zod';

import { vehicleFormSchema } from '@/schemas/vehicle.schema';

// Onboarding collects exactly the first vehicle.
export const onboardingSchema = vehicleFormSchema;

export type OnboardingInput = z.input<typeof onboardingSchema>;
export type OnboardingValues = z.output<typeof onboardingSchema>;

export const STEPS = ['welcome', 'type', 'bodyStyle', 'propulsion', 'details'] as const;
export type Step = (typeof STEPS)[number];

// Fields validated before leaving each step.
export const STEP_FIELDS: Record<Step, (keyof OnboardingInput)[]> = {
  welcome: [],
  type: ['type'],
  bodyStyle: ['bodyStyle', 'color'],
  propulsion: ['propulsion'],
  details: ['make', 'model', 'year', 'odometerKm'],
};
