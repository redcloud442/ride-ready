import type { VehicleSummary } from '@ride-ready/core';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';

import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { routes } from '@/constants/routes';
import { useDeleteVehicle } from '@/hooks/use-vehicles';
import { useToastStore } from '@/stores/toast.store';
import { useAppTheme } from '@/theme';

// The destructive action lives at the bottom of Edit, not on the vehicle page.
export function DeleteVehicle({ vehicle }: { vehicle: VehicleSummary }) {
  const { colors } = useAppTheme();
  const show = useToastStore((s) => s.show);
  const remove = useDeleteVehicle();
  const [confirming, setConfirming] = useState(false); // local dialog state
  const name = `${vehicle.make} ${vehicle.model}`;

  return (
    <>
      <Button icon="delete-outline" textColor={colors.error} onPress={() => setConfirming(true)} style={styles.button}>
        Delete vehicle
      </Button>
      <ConfirmDialog
        visible={confirming}
        title={`Delete ${name}?`}
        body="It disappears from your garage with all its records. This can't be undone in the app."
        confirmLabel="Delete"
        busy={remove.isPending}
        onDismiss={() => setConfirming(false)}
        onConfirm={() =>
          remove.mutate(vehicle.id, {
            onSuccess: () => {
              show(`${name} deleted`);
              // its vehicle page is gone too
              router.dismissTo(routes.garage);
            },
            onError: (e) => show(e.message),
            onSettled: () => setConfirming(false),
          })
        }
      />
    </>
  );
}

const styles = StyleSheet.create({
  button: { marginTop: 24, alignSelf: 'flex-start' },
});
