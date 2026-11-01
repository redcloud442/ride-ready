import { usesCharging, usesFuel, type VehicleSummary } from '@ride-ready/core';

import { useLatestOdometerKm } from './use-latest-odometer';
import { useCurrency } from './use-preferences';
import { useVehicleRecords } from './use-vehicle-records';

// Smart defaults from the vehicle's own newest records (lists are already newest first and cached).
// Currency is the profile's (Profile → Default currency), never guessed from old records.
export function useLastUsed(vehicle: VehicleSummary | undefined) {
  const id = vehicle?.id;
  const fuel = useVehicleRecords('fuel', vehicle && usesFuel(vehicle.propulsion) ? id : undefined).data?.[0];
  const charge = useVehicleRecords('charging', vehicle && usesCharging(vehicle.propulsion) ? id : undefined).data?.[0];
  const service = useVehicleRecords('maintenance', id).data?.[0];
  const lastKm = useLatestOdometerKm(vehicle);
  const currency = useCurrency();

  return {
    currency,
    station: fuel?.station ?? '',
    chargerType: charge?.chargerType ?? '',
    chargeLocation: charge?.location ?? '',
    workshop: service?.workshop ?? '',
    lastKm,
  };
}
