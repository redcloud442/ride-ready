import { usesCharging } from '@ride-ready/core';
import { Stack, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, ScrollView, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

import { Appear } from '@/components/ui/appear';
import { InfoCard } from '@/components/ui/info-card';
import { VehicleHero } from '@/components/vehicle-hero';
import { DocumentList } from '@/features/documents/components/document-list';
import { BatteryHealthCard } from '@/features/garage/components/battery-health-card';
import { TripsSummaryCard } from '@/features/trips/components/trips-summary-card';
import { RecordHistory } from '@/features/garage/components/record-history';
import { VehicleActions } from '@/features/garage/components/vehicle-actions';
import { useLatestOdometerKm } from '@/hooks/use-latest-odometer';
import { useSelectedVehicle, useVehicles } from '@/hooks/use-vehicles';
import { usePreferences } from '@/hooks/use-preferences';
import { useAppTheme } from '@/theme';

export default function VehicleScreen() {
  const { colors } = useAppTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const vehicles = useVehicles();
  const active = useSelectedVehicle();
  const vehicle = vehicles.data?.find((v) => v.id === id);
  const odometerKm = useLatestOdometerKm(vehicle);
  const tripsEnabled = !!usePreferences().tripsEnabled;

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: vehicle ? `${vehicle.make} ${vehicle.model}` : 'Vehicle' }} />
      {vehicles.isPending ? (
        <ActivityIndicator style={styles.loading} />
      ) : !vehicle ? (
        <InfoCard icon="car-off" title="Vehicle not found" body="It may have been deleted." />
      ) : (
        <>
          <Appear>
            <VehicleHero vehicle={vehicle} odometerKm={odometerKm} />
          </Appear>
          <Appear index={1}>
            <VehicleActions vehicle={vehicle} isActive={vehicle.id === active?.id} />
          </Appear>
          {usesCharging(vehicle.propulsion) && (
            <Appear index={2}>
              <BatteryHealthCard vehicle={vehicle} />
            </Appear>
          )}
          {tripsEnabled && (
            <Appear index={3}>
              <TripsSummaryCard vehicle={vehicle} />
            </Appear>
          )}
          <Text variant="titleMedium" style={styles.section}>
            Documents
          </Text>
          <Appear index={4}>
            <DocumentList vehicle={vehicle} />
          </Appear>
          <Text variant="titleMedium" style={styles.section}>
            History
          </Text>
          <Appear index={5}>
            <RecordHistory vehicle={vehicle} />
          </Appear>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 16, paddingBottom: 32 },
  loading: { height: 160 },
  section: { marginTop: 8 },
});
