import type { VehicleSummary } from '@ride-ready/core';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Icon, Surface, Text, TouchableRipple } from 'react-native-paper';

import { VehicleArt } from '@/components/vehicle-art';
import { routes } from '@/constants/routes';
import { PROPULSION_UI } from '@/constants/vehicles';
import { useAppTheme } from '@/theme';
import { formatKm } from '@/utils/format';

// The vehicle at a glance: picture, name, one quiet detail line, and the odometer (tap to update).
export function VehicleHero({ vehicle, odometerKm }: { vehicle: VehicleSummary; odometerKm: number | null }) {
  const { colors } = useAppTheme();
  const propulsion = PROPULSION_UI[vehicle.propulsion].label;

  return (
    <Surface elevation={2} style={[styles.card, { backgroundColor: colors.elevation.level1 }]}>
      <VehicleArt vehicle={vehicle} height={130} />
      <View>
        <Text variant="headlineSmall" numberOfLines={1}>
          {vehicle.make} {vehicle.model}
        </Text>
        <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>
          {vehicle.year} · {propulsion}
        </Text>
      </View>
      <TouchableRipple
        onPress={() => router.push(routes.logFor('odometer', vehicle.id))}
        style={[styles.odometer, { backgroundColor: colors.surfaceVariant }]}
        borderless
        accessibilityRole="button"
        accessibilityLabel={odometerKm != null ? `Odometer ${formatKm(odometerKm)}. Update` : 'Add odometer reading'}>
        <View style={styles.row}>
          <Icon source="speedometer" size={18} color={colors.onSurfaceVariant} />
          <Text variant="titleSmall" style={[styles.flex, { color: colors.onSurface }]}>
            {odometerKm != null ? formatKm(odometerKm) : 'No odometer reading yet'}
          </Text>
          <Text variant="labelLarge" style={{ color: colors.primary }}>
            {odometerKm != null ? 'Update' : 'Add'}
          </Text>
        </View>
      </TouchableRipple>
    </Surface>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: { borderRadius: 24, padding: 20, paddingTop: 8, gap: 12 },
  odometer: { borderRadius: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 48, paddingHorizontal: 12 },
});
