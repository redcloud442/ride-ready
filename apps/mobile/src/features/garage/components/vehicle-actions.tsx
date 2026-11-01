import type { VehicleSummary } from '@ride-ready/core';
import { router, Stack } from 'expo-router';
import { Button, IconButton } from 'react-native-paper';

import { routes } from '@/constants/routes';
import { useGarageStore } from '@/stores/garage.store';
import { useToastStore } from '@/stores/toast.store';

import { useShareServiceHistory } from '../hooks/use-share-service-history';

// Edit sits in the header (delete is inside Edit); "Show on Home" appears only when it would do something;
// the service history PDF is for selling the vehicle.
export function VehicleActions({ vehicle, isActive }: { vehicle: VehicleSummary; isActive: boolean }) {
  const selectVehicle = useGarageStore((s) => s.selectVehicle);
  const show = useToastStore((s) => s.show);
  const name = `${vehicle.make} ${vehicle.model}`;
  const history = useShareServiceHistory(vehicle);

  return (
    <>
      {/* a family member's vehicle: records are shared, the vehicle itself stays the owner's */}
      {!vehicle.shared && (
        <Stack.Screen
          options={{
            headerRight: () => (
              <IconButton
                icon="pencil-outline"
                onPress={() => router.push(routes.editVehicle(vehicle.id))}
                accessibilityLabel={`Edit ${name}`}
              />
            ),
          }}
        />
      )}
      {!isActive && (
        <Button
          mode="contained-tonal"
          icon="home-variant"
          onPress={() => {
            selectVehicle(vehicle.id);
            show(`${name} is now on Home`);
          }}>
          Show on Home
        </Button>
      )}
      {/* selling is the owner's call; family members see the records but don't hand them out */}
      {!vehicle.shared && (
        <Button
          mode="outlined"
          icon="file-certificate-outline"
          onPress={history.share}
          loading={history.sharing}
          disabled={!history.ready || history.sharing}>
          Share service history (PDF)
        </Button>
      )}
    </>
  );
}
