import type { EnergyPriceKind, EnergyPriceObservation, Page } from '@ride-ready/core';

import { request } from './client';

export type SubmitEnergyPriceInput = {
  kind: EnergyPriceKind;
  price: number;
  currency: string;
  region?: string | null;
  observedAt: string;
};

export const energyPricesApi = {
  list: (kind?: EnergyPriceKind) =>
    request<Page<EnergyPriceObservation>>(`/api/energy-prices?limit=50${kind ? `&kind=${kind}` : ''}`),
  submit: (input: SubmitEnergyPriceInput) =>
    request<EnergyPriceObservation>('/api/energy-prices', { method: 'POST', body: JSON.stringify(input) }),
};
