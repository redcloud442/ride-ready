import type { VehicleSummary } from '@ride-ready/core';
import { router, Stack } from 'expo-router';
import { Button, IconButton } from 'react-native-paper';

import { routes } from '@/constants/routes';
import { useGarageStore } from '@/stores/garage.store';
import { useToastStore } from '@/stores/toast.store';

// Edit sits in the header (delete is inside Edit); "Show on Home" appears only when it would do something.
export function VehicleActions({ vehicle, isActive }: { vehicle: VehicleSummary; isActive: boolean }) {
  const selectVehicle = useGarageStore((s) => s.selectVehicle);
  const show = useToastStore((s) => s.show);
  const name = `${vehicle.make} ${vehicle.model}`;

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
    </>
  );
}
