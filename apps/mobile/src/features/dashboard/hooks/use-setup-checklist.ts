import { usesFuel } from '@ride-ready/core';
import type { Href } from 'expo-router';

import { routes } from '@/constants/routes';
import { useSelectedVehicle, useVehicles } from '@/hooks/use-vehicles';

import type { VehicleMetrics } from '../utils/metrics';

export type SetupItem = { key: string; label: string; done: boolean; href: Href };

// Garage setup progress, derived from real records only. Each open item links to where it gets done.
export function useSetupChecklist(metrics: VehicleMetrics | null): { items: SetupItem[]; done: number } {
  const { data: vehicles } = useVehicles();
  const vehicle = useSelectedVehicle();
  const counts = metrics?.counts;
  const energyScreen = !vehicle || usesFuel(vehicle.propulsion) ? 'fuel' : 'charging';
  const items: SetupItem[] = [
    { key: 'vehicle', label: 'Add a vehicle', done: !!vehicles?.length, href: routes.newVehicle },
    { key: 'odometer', label: 'Record an odometer reading', done: !!counts?.odometer, href: routes.log('odometer') },
    { key: 'energy', label: 'Log a fill-up or charge', done: !!counts?.energy, href: routes.log(energyScreen) },
    { key: 'service', label: 'Log a service or expense', done: !!(counts?.service || counts?.expense), href: routes.log('maintenance') },
  ];
  return { items, done: items.filter((i) => i.done).length };
}
