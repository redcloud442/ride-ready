import { usesCharging, usesFuel, type VehicleSummary } from '@ride-ready/core';

import type { VehicleRecords } from '@/utils/record-feed';

import { useVehicleRecords } from './use-vehicle-records';

// All record types of one vehicle, loaded together (dashboard metrics, garage history).
export function useVehicleRecordSet(vehicle: VehicleSummary | undefined) {
  const id = vehicle?.id;
  // fuel/charging endpoints refuse vehicles without that powertrain (422), so don't ask
  const queries = {
    odometer: useVehicleRecords('odometer', id),
    fuel: useVehicleRecords('fuel', vehicle && usesFuel(vehicle.propulsion) ? id : undefined),
    charging: useVehicleRecords('charging', vehicle && usesCharging(vehicle.propulsion) ? id : undefined),
    maintenance: useVehicleRecords('maintenance', id),
    expenses: useVehicleRecords('expenses', id),
  };
  const all = Object.values(queries);

  const records: VehicleRecords = {
    odometer: queries.odometer.data ?? [],
    fuel: queries.fuel.data ?? [],
    charging: queries.charging.data ?? [],
    maintenance: queries.maintenance.data ?? [],
    expenses: queries.expenses.data ?? [],
  };

  return {
    records,
    isLoading: all.some((q) => q.isLoading),
    isError: all.some((q) => q.isError),
    isRefetching: all.some((q) => q.isRefetching),
    refetch: () => Promise.all(all.map((q) => (q.isEnabled ? q.refetch() : null))),
  };
}
