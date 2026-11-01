import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/api/query-keys';
import { recordsApis } from '@/api/records.api';
import { vehiclesApi, type CreateVehicleInput, type UpdateVehicleInput } from '@/api/vehicles.api';
import { useGarageStore } from '@/stores/garage.store';

export const useVehicles = () => useQuery({ queryKey: queryKeys.vehicles, queryFn: vehiclesApi.list });

// The vehicle the dashboard, trips and insights show: the user's pick, else the first one.
export function useSelectedVehicle() {
  const { data } = useVehicles();
  const selectedId = useGarageStore((s) => s.selectedVehicleId);
  return data?.find((v) => v.id === selectedId) ?? data?.[0];
}

/** Saves the current odometer as the vehicle's first reading. Never throws: the vehicle already exists. */
export async function saveStartingOdometer(vehicleId: string, km: number | undefined) {
  if (km == null) return true;
  try {
    await recordsApis.odometer.create(vehicleId, { readAt: new Date().toISOString(), km });
    return true;
  } catch {
    return false;
  }
}

export function useCreateVehicle() {
  const queryClient = useQueryClient();
  const selectVehicle = useGarageStore((s) => s.selectVehicle);
  return useMutation({
    mutationFn: async ({ odometerKm, ...input }: CreateVehicleInput & { odometerKm?: number }) => {
      const vehicle = await vehiclesApi.create(input);
      return { vehicle, odometerSaved: await saveStartingOdometer(vehicle.id, odometerKm) };
    },
    onSuccess: ({ vehicle }) => {
      selectVehicle(vehicle.id); // a vehicle you just added is the one you want to log for
      return queryClient.invalidateQueries({ queryKey: queryKeys.vehicles });
    },
  });
}

export function useUpdateVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateVehicleInput }) => vehiclesApi.update(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.vehicles, exact: true }),
  });
}

export function useDeleteVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: vehiclesApi.remove,
    onSuccess: (_void, id) => {
      const { selectedVehicleId, selectVehicle } = useGarageStore.getState();
      if (selectedVehicleId === id) selectVehicle(null);
      queryClient.removeQueries({ queryKey: queryKeys.vehicle(id) });
      return queryClient.invalidateQueries({ queryKey: queryKeys.vehicles, exact: true });
    },
  });
}
