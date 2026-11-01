import { ENERGY_PRICE_KINDS, type EnergyPriceKind } from '@ride-ready/core';
import { useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { Chip, Divider, Icon, Surface, Text } from 'react-native-paper';

import { Appear } from '@/components/ui/appear';
import { ErrorBanner } from '@/components/ui/error-banner';
import { InfoCard } from '@/components/ui/info-card';
import { defaultEnergyKind, ENERGY_KIND_UI } from '@/constants/energy-prices';
import { useEnergyPrices } from '@/hooks/use-energy-prices';
import { useSelectedVehicle } from '@/hooks/use-vehicles';
import { useAppTheme } from '@/theme';
import { formatDay, formatMoney, formatTime } from '@/utils/format';

export function PriceList() {
  const { colors } = useAppTheme();
  const vehicle = useSelectedVehicle();
  const [kind, setKind] = useState<EnergyPriceKind>(() => defaultEnergyKind(vehicle?.propulsion)); // local filter
  const prices = useEnergyPrices(kind);

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={prices.isRefetching} onRefresh={() => void prices.refetch()} tintColor={colors.primary} />}>
      <View style={[styles.notice, { backgroundColor: colors.surfaceVariant }]}>
        <Icon source="account-group-outline" size={20} color={colors.onSurfaceVariant} />
        <Text variant="bodySmall" style={[styles.flex, { color: colors.onSurfaceVariant }]}>
          Prices reported by RideReady drivers, with the time they were seen. They are not live station prices.
        </Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {ENERGY_PRICE_KINDS.map((k) => (
          <Chip key={k} icon={ENERGY_KIND_UI[k].icon} selected={k === kind} showSelectedOverlay onPress={() => setKind(k)}>
            {ENERGY_KIND_UI[k].short}
          </Chip>
        ))}
      </ScrollView>

      {prices.isError && <ErrorBanner message="Couldn't load prices." onRetry={() => void prices.refetch()} />}
      {prices.isLoading ? (
        <ActivityIndicator style={styles.loading} />
      ) : !prices.data?.length ? (
        <InfoCard icon="tag-outline" title="No reports yet" body={`Be the first to report a ${ENERGY_KIND_UI[kind].label.toLowerCase()} price.`} />
      ) : (
        // keyed by kind so switching fuel type builds the list in again
        <Appear key={kind} index={1}>
          <Surface elevation={1} style={[styles.card, { borderColor: colors.outlineVariant }]}>
            {prices.data.map((p, i) => {
              const seen = new Date(p.observedAt);
              return (
                <View key={p.id}>
                  {i > 0 && <Divider />}
                  <View
                    style={styles.row}
                    accessible
                    accessibilityLabel={`${formatMoney(Number(p.price), p.currency)} per ${p.unit}${p.region ? `, ${p.region}` : ''}, seen ${formatDay(seen)} ${formatTime(seen)}`}>
                    <View style={styles.flex}>
                      <Text variant="titleMedium" style={styles.num}>
                        {formatMoney(Number(p.price), p.currency)}
                        <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>
                          {' '}
                          / {p.unit}
                        </Text>
                      </Text>
                      <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
                        {[p.region, `seen ${formatDay(seen)} ${formatTime(seen)}`].filter(Boolean).join(' · ')}
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </Surface>
        </Appear>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 16, gap: 12, paddingBottom: 96 },
  notice: { flexDirection: 'row', gap: 10, borderRadius: 12, padding: 12 },
  chips: { gap: 8 },
  loading: { height: 120 },
  card: { borderRadius: 16, borderWidth: 1, paddingHorizontal: 16 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  num: { fontVariant: ['tabular-nums'] },
});
