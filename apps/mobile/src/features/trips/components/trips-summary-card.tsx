import { monthOf, type VehicleSummary } from '@ride-ready/core';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Button, Icon, Surface, Text } from 'react-native-paper';

import { routes } from '@/constants/routes';
import { useVehicleRecords } from '@/hooks/use-vehicle-records';
import { useGarageStore } from '@/stores/garage.store';
import { useAppTheme } from '@/theme';
import { formatKm } from '@/utils/format';

import { summarizeTrips } from '../utils/trip-summary';

// Vehicle page entry to trips (only when trip tracking is on).
export function TripsSummaryCard({ vehicle }: { vehicle: VehicleSummary }) {
  const { colors } = useAppTheme();
  const trips = useVehicleRecords('trips', vehicle.id);
  const selectVehicle = useGarageStore((s) => s.selectVehicle);
  const month = summarizeTrips(trips.data ?? [], monthOf(new Date()));

  return (
    <Surface elevation={1} style={[styles.card, { borderColor: colors.outlineVariant }]}>
      <View style={styles.head}>
        <View style={[styles.icon, { backgroundColor: colors.primaryContainer }]}>
          <Icon source="map-marker-path" size={22} color={colors.onPrimaryContainer} />
        </View>
        <View style={styles.flex}>
          <Text variant="titleMedium">Trips</Text>
          <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
            {month.count
              ? `This month: ${month.count} ${month.count === 1 ? 'trip' : 'trips'}, ${formatKm(month.km)}${month.businessKm ? ` (${formatKm(month.businessKm)} business)` : ''}`
              : 'No trips this month'}
          </Text>
        </View>
      </View>
      <Button
        mode="contained-tonal"
        icon="map-marker-path"
        onPress={() => {
          selectVehicle(vehicle.id); // the trips screen follows the selected vehicle
          router.push(routes.trips);
        }}>
        Open trips
      </Button>
    </Surface>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 12 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  icon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
