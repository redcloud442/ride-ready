import type { EnergyPriceKind, Propulsion } from '@ride-ready/core';

export const ENERGY_KIND_UI: Record<EnergyPriceKind, { label: string; short: string; icon: string; unit: 'L' | 'kWh' }> = {
  gasoline_regular: { label: 'Gasoline (regular)', short: 'Regular', icon: 'gas-station', unit: 'L' },
  gasoline_premium: { label: 'Gasoline (premium)', short: 'Premium', icon: 'gas-station-outline', unit: 'L' },
  diesel: { label: 'Diesel', short: 'Diesel', icon: 'barrel', unit: 'L' },
  electricity_ac: { label: 'AC charging', short: 'AC', icon: 'ev-plug-type2', unit: 'kWh' },
  electricity_dc: { label: 'DC fast charging', short: 'DC fast', icon: 'ev-station', unit: 'kWh' },
};

/** The price list opens on what the selected vehicle buys. */
export function defaultEnergyKind(propulsion: Propulsion | undefined): EnergyPriceKind {
  return propulsion === 'ev' ? 'electricity_ac' : propulsion === 'diesel' ? 'diesel' : 'gasoline_regular';
}
