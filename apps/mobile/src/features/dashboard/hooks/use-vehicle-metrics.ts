import type { VehicleSummary } from '@ride-ready/core';

import { useVehicleRecordSet } from '@/hooks/use-vehicle-record-set';
import { recordFeed } from '@/utils/record-feed';

import { buildMetrics } from '../utils/metrics';

// Dashboard numbers + the five newest records of the vehicle.
export function useVehicleMetrics(vehicle: VehicleSummary | undefined) {
  const { records, ...status } = useVehicleRecordSet(vehicle);
  return {
    metrics: vehicle ? buildMetrics(records, vehicle.propulsion) : null,
    activity: recordFeed(records, 5),
    ...status,
  };
}
