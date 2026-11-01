import { router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { IconButton, Text } from 'react-native-paper';

import { BRAND_OVERLAP, BrandHeader } from '@/components/brand/brand-header';
import { Appear } from '@/components/ui/appear';
import { Card } from '@/components/ui/card';
import { ErrorBanner } from '@/components/ui/error-banner';
import { InfoCard } from '@/components/ui/info-card';
import { VehicleArt } from '@/components/vehicle-art';
import { VehicleSwitcher } from '@/components/vehicle-switcher';
import { routes } from '@/constants/routes';
import { EconomyCard } from '@/features/insights/components/economy-card';
import { HabitsCard } from '@/features/insights/components/habits-card';
import { InsightList } from '@/features/insights/components/insight-list';
import { MetricList } from '@/features/insights/components/metric-list';
import { OverviewCard } from '@/features/insights/components/overview-card';
import { PeriodPills } from '@/features/insights/components/period-pills';
import { SpendBreakdown } from '@/features/insights/components/spend-breakdown';
import { compareLabel, periodRange, type PeriodKey } from '@/features/insights/insights.periods';
import { useVehicleStats } from '@/hooks/use-stats';
import { useSelectedVehicle } from '@/hooks/use-vehicles';
import { useAppTheme } from '@/theme';

// Laid out like Home: brand band (vehicle + period), the overview card overlapping it, then cards.
export default function InsightsScreen() {
  const { colors } = useAppTheme();
  const vehicle = useSelectedVehicle();
  const [period, setPeriod] = useState<PeriodKey>('1m'); // local UI choice
  const { from, to } = periodRange(period);
  const stats = useVehicleStats(vehicle?.id, from, to);
  const compare = compareLabel(period);

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.scroll}
      refreshControl={<RefreshControl refreshing={stats.isRefetching} onRefresh={() => void stats.refetch()} tintColor={colors.primary} />}>
      <BrandHeader
        eyebrow={vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : undefined}
        title="Insights"
        right={
          vehicle && (
            <View style={styles.art}>
              {/* keyed so switching vehicles drives the new one in */}
              <VehicleArt key={vehicle.id} vehicle={vehicle} height={64} />
            </View>
          )
        }>
        <PeriodPills value={period} onChange={setPeriod} />
      </BrandHeader>

      <View style={styles.body}>
        <View style={styles.hero}>
          {!vehicle ? (
            <InfoCard icon="garage-open-variant" title="No vehicle yet" body="Add a vehicle in Garage to see its insights." />
          ) : stats.isPending ? (
            <Card style={styles.loading}>
              <ActivityIndicator />
            </Card>
          ) : stats.isError ? (
            <ErrorBanner message="Couldn't load insights." onRetry={() => void stats.refetch()} />
          ) : (
            <OverviewCard key={period} stats={stats.data} compare={compare} index={0} />
          )}
        </View>
        <VehicleSwitcher labelSingle={false} />

        {vehicle && stats.data && (
          // keyed by period so a new period builds in again
          <View key={`${vehicle.id}-${period}`} style={styles.sections}>
            {stats.data.details.economy.length > 0 && (
              <>
                <Text variant="titleMedium" style={styles.section}>
                  Fuel economy per tank
                </Text>
                <EconomyCard stats={stats.data} compare={compare} index={1} />
              </>
            )}
            <Text variant="titleMedium" style={styles.section}>
              Fill-up and charging habits
            </Text>
            <HabitsCard stats={stats.data} propulsion={vehicle.propulsion} index={2} />
            <Text variant="titleMedium" style={styles.section}>
              Driving and energy
            </Text>
            <Appear index={3}>
              <MetricList stats={stats.data} propulsion={vehicle.propulsion} />
            </Appear>
            <Text variant="titleMedium" style={styles.section}>
              Where the money went
            </Text>
            <Appear index={4}>
              <SpendBreakdown spend={stats.data.spend} />
            </Appear>
            <Text variant="titleMedium" style={styles.section}>
              Summaries
            </Text>
            <Appear index={5}>
              <InsightList vehicleId={vehicle.id} from={from} to={to} />
            </Appear>
          </View>
        )}

        <InfoCard
          icon="tag-outline"
          tone="primary"
          title="Fuel and charging prices"
          body="See what drivers paid recently, or report a price."
          action={<IconButton icon="chevron-right" hitSlop={4} onPress={() => router.push(routes.prices)} accessibilityLabel="Open fuel and charging prices" />}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 32 },
  body: { paddingHorizontal: 16, gap: 16 },
  hero: { marginTop: -BRAND_OVERLAP },
  art: { width: 104 },
  loading: { height: 160, justifyContent: 'center' },
  sections: { gap: 16 },
  section: { marginTop: 8 },
});
