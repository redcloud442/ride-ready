import { router } from 'expo-router';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { Button, FAB } from 'react-native-paper';

import { routes } from '@/constants/routes';
import { Appear } from '@/components/ui/appear';
import { ErrorBanner } from '@/components/ui/error-banner';
import { InfoCard } from '@/components/ui/info-card';
import { VehicleListItem } from '@/features/garage/components/vehicle-list-item';
import { useSelectedVehicle, useVehicles } from '@/hooks/use-vehicles';
import { useAppTheme } from '@/theme';

export default function GarageScreen() {
  const { colors } = useAppTheme();
  const vehicles = useVehicles();
  const active = useSelectedVehicle();

  return (
    <View style={[styles.flex, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={vehicles.isRefetching} onRefresh={() => void vehicles.refetch()} tintColor={colors.primary} />}>
        {vehicles.isError && <ErrorBanner message="Couldn't load your garage." onRetry={() => void vehicles.refetch()} />}
        {vehicles.isPending ? (
          <ActivityIndicator style={styles.loading} />
        ) : vehicles.data?.length ? (
          vehicles.data.map((v, i) => (
            <Appear key={v.id} index={i}>
              <VehicleListItem vehicle={v} active={v.id === active?.id} onPress={() => router.push(routes.vehicle(v.id))} />
            </Appear>
          ))
        ) : (
          vehicles.isSuccess && (
            <InfoCard icon="garage-open-variant" tone="primary" title="Your garage is empty" body="Add a car or motorcycle to start tracking it." />
          )
        )}
        {vehicles.isSuccess && (
          <Button icon="qrcode-scan" onPress={() => router.push(routes.scanTransfer)} style={styles.scan}>
            Bought a car from a RideReady user? Scan its code
          </Button>
        )}
      </ScrollView>
      <FAB icon="plus" label="Add vehicle" style={styles.fab} onPress={() => router.push(routes.newVehicle)} />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 16, gap: 12, paddingBottom: 96 },
  loading: { height: 120 },
  scan: { alignSelf: 'center' },
  fab: { position: 'absolute', right: 16, bottom: 16 },
});
