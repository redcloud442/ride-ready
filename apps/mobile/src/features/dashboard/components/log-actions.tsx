import type { VehicleSummary } from '@ride-ready/core';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Button, IconButton } from 'react-native-paper';

import { routes } from '@/constants/routes';
import { useQuickScan } from '@/features/documents/hooks/use-quick-scan';
import { usePreferences } from '@/hooks/use-preferences';
import { useToastStore } from '@/stores/toast.store';

// Home's one logging row: scan a receipt (least typing). Typing it in is the tab bar's "+".
export function LogActions({ vehicle }: { vehicle: VehicleSummary | undefined }) {
  const scan = useQuickScan(vehicle);
  const tripsEnabled = !!usePreferences().tripsEnabled;
  const show = useToastStore((s) => s.show);

  return (
    <View style={styles.row}>
      <Button
        mode="contained"
        icon="camera-outline"
        onPress={() => scan.scan('camera')}
        loading={scan.busy}
        disabled={scan.busy}
        style={styles.flex}
        contentStyle={styles.cta}
        accessibilityHint="Take a photo of a fuel, charging or service receipt; the form is filled in for you to check">
        {scan.stage ?? 'Scan receipt'}
      </Button>
      <IconButton
        icon="image-outline"
        mode="contained-tonal"
        size={24}
        disabled={scan.busy}
        onPress={() => scan.scan('library')}
        accessibilityLabel="Scan a receipt from your photos"
        style={styles.square}
      />
      {tripsEnabled && (
        <IconButton
          icon="map-marker-path"
          mode="contained-tonal"
          size={24}
          onPress={() => (vehicle ? router.push(routes.trips) : show('Add a vehicle first.'))}
          accessibilityLabel="Record a trip"
          style={styles.square}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  cta: { height: 52 },
  square: { margin: 0, width: 52, height: 52, borderRadius: 16 },
});
