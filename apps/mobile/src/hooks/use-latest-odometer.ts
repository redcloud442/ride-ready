import { latestOdometer, type VehicleSummary } from '@ride-ready/core';

import { odometerPoints } from '@/utils/record-feed';

import { useVehicleRecordSet } from './use-vehicle-record-set';

// Latest odometer value from any record of the vehicle (shares the cached record queries).
export function useLatestOdometerKm(vehicle: VehicleSummary | undefined) {
  const { records } = useVehicleRecordSet(vehicle);
  return latestOdometer(odometerPoints(records))?.km ?? null;
}
