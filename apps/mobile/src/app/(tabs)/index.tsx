import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { Appear } from '@/components/ui/appear';
import { ErrorBanner } from '@/components/ui/error-banner';
import { DashboardHeader, HERO_OVERLAP } from '@/features/dashboard/components/dashboard-header';
import { EmptyGarageCard } from '@/features/dashboard/components/empty-garage-card';
import { LogActions } from '@/features/dashboard/components/log-actions';
import { Nudges } from '@/features/dashboard/components/nudges';
import { RecentActivity } from '@/features/dashboard/components/recent-activity';
import { SetupProgress } from '@/features/dashboard/components/setup-progress';
import { SummaryStrip } from '@/features/dashboard/components/summary-strip';
import { VehicleCarousel } from '@/features/dashboard/components/vehicle-carousel';
import { useVehicleMetrics } from '@/features/dashboard/hooks/use-vehicle-metrics';
import { useSelectedVehicle, useVehicles } from '@/hooks/use-vehicles';
import { useAppTheme } from '@/theme';

export default function HomeScreen() {
  const { colors } = useAppTheme();
  const vehicles = useVehicles();
  const vehicle = useSelectedVehicle();
  const { metrics, activity, ...records } = useVehicleMetrics(vehicle);
  const refresh = () => void Promise.all([vehicles.refetch(), records.refetch()]);

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.scroll}
      refreshControl={
        <RefreshControl refreshing={vehicles.isRefetching || records.isRefetching} onRefresh={refresh} tintColor={colors.primary} />
      }>
      <DashboardHeader />
      <View style={styles.body}>
        <View style={styles.hero}>
          {vehicles.isPending ? (
            <ActivityIndicator style={styles.loading} />
          ) : vehicles.data?.length ? (
            <VehicleCarousel vehicles={vehicles.data} />
          ) : (
            vehicles.isSuccess && <EmptyGarageCard />
          )}
        </View>
        {(vehicles.isError || records.isError) && (
          <ErrorBanner message="Couldn't load everything in your garage." onRetry={refresh} />
        )}
        {/* sections build in top to bottom (components/ui/appear.tsx) */}
        <Appear index={1}>
          <LogActions vehicle={vehicle} />
        </Appear>
        {vehicle && (
          <Appear index={2}>
            <Nudges vehicle={vehicle} metrics={metrics} />
          </Appear>
        )}

        <Text variant="titleMedium" style={styles.section}>
          This month
        </Text>
        <Appear index={3}>
          <SummaryStrip metrics={metrics} propulsion={vehicle?.propulsion} />
        </Appear>
        <Appear index={4}>
          <SetupProgress metrics={metrics} />
        </Appear>

        <Text variant="titleMedium" style={styles.section}>
          Recent activity
        </Text>
        {records.isLoading ? (
          <ActivityIndicator style={styles.loading} />
        ) : (
          <Appear index={5}>
            <RecentActivity items={activity} />
          </Appear>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 32 },
  body: { paddingHorizontal: 16, gap: 16 },
  hero: { marginTop: -HERO_OVERLAP },
  loading: { height: 120 },
  section: { marginTop: 8 },
});
