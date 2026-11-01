import { monthOf } from '@ride-ready/core';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

import { Appear } from '@/components/ui/appear';
import { ErrorBanner } from '@/components/ui/error-banner';
import { InfoCard } from '@/components/ui/info-card';
import { StatTile } from '@/components/ui/stat-tile';
import { VehicleSwitcher } from '@/components/vehicle-switcher';
import { TripList } from '@/features/trips/components/trip-list';
import { TripRecorderCard } from '@/features/trips/components/trip-recorder-card';
import { summarizeTrips } from '@/features/trips/utils/trip-summary';
import { useVehicleRecords } from '@/hooks/use-vehicle-records';
import { useSelectedVehicle } from '@/hooks/use-vehicles';
import { useAppTheme } from '@/theme';
import { formatKm } from '@/utils/format';

export default function TripsScreen() {
  const { colors } = useAppTheme();
  const vehicle = useSelectedVehicle();
  const trips = useVehicleRecords('trips', vehicle?.id);
  const month = summarizeTrips(trips.data ?? [], monthOf(new Date()));

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={trips.isRefetching} onRefresh={() => void trips.refetch()} tintColor={colors.primary} />}>
      <VehicleSwitcher />
      <Appear index={1}>
        <TripRecorderCard vehicle={vehicle} />
      </Appear>

      <Text variant="titleMedium" style={styles.section}>
        This month
      </Text>
      <Appear index={2} style={styles.row}>
        <StatTile label="Trips" value={trips.data ? String(month.count) : null} emptyHint="Record your first trip" />
        <StatTile label="GPS distance" value={month.count ? formatKm(month.km) : null} emptyHint="From recorded trips" />
        <StatTile label="Business" value={month.count ? formatKm(month.businessKm) : null} emptyHint="Mark trips as business" />
      </Appear>

      <Text variant="titleMedium" style={styles.section}>
        Recent trips
      </Text>
      {trips.isError && <ErrorBanner message="Couldn't load trips." onRetry={() => void trips.refetch()} />}
      {trips.isLoading ? (
        <ActivityIndicator style={styles.loading} />
      ) : vehicle && trips.data?.length ? (
        <Appear index={3}>
          <TripList vehicle={vehicle} trips={trips.data} />
        </Appear>
      ) : (
        <InfoCard icon="map-marker-path" title="No trips yet" body="Start a trip above; distance and route are saved when you finish." />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 16, paddingBottom: 32 },
  section: { marginTop: 8 },
  row: { flexDirection: 'row', gap: 12 },
  loading: { height: 120 },
});
