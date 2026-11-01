import { bodyStyleOf } from '@ride-ready/core';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import { useCompleteOnboarding } from '@/hooks/use-complete-onboarding';

import {
  onboardingSchema,
  STEP_FIELDS,
  STEPS,
  type OnboardingInput,
  type OnboardingValues,
} from '../onboarding.schemas';

// Step navigation + the onboarding form + the save mutation, so the screen only renders.
export function useOnboardingFlow() {
  const [index, setIndex] = useState(0);
  const complete = useCompleteOnboarding();
  const form = useForm<OnboardingInput, unknown, OnboardingValues>({
    resolver: zodResolver(onboardingSchema),
    mode: 'onTouched',
    defaultValues: { make: '', model: '', year: '', odometerKm: '' },
  });

  const [type, color] = useWatch({ control: form.control, name: ['type', 'color'] });
  const step = STEPS[index];
  const isLast = index === STEPS.length - 1;

  return {
    step,
    index,
    total: STEPS.length,
    isLast,
    form,
    type,
    color,
    saving: complete.isPending,
    error: complete.error ? "Couldn't save. Check your connection and try again." : undefined,
    back: () => setIndex((i) => Math.max(0, i - 1)),
    async next() {
      if (await form.trigger(STEP_FIELDS[step])) setIndex((i) => i + 1);
    },
    finish: () => form.handleSubmit((vehicle) => complete.mutate({ vehicle: { ...vehicle, bodyStyle: bodyStyleOf(vehicle) } }))(),
    skip: () => complete.mutate({}),
  };
}
