import type { VehicleSummary } from '@ride-ready/core';
import { usesCharging, usesFuel } from '@ride-ready/core';
import { router } from 'expo-router';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { Chip, Divider, Icon, IconButton, Surface, Text, TouchableRipple } from 'react-native-paper';

import { LOG_SCREEN, routes } from '@/constants/routes';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { ErrorBanner } from '@/components/ui/error-banner';
import { InfoCard } from '@/components/ui/info-card';
import { useAppTheme } from '@/theme';
import { formatDay, formatMoney } from '@/utils/format';

import { useRecordHistory, type HistoryFilter } from '../hooks/use-record-history';

const FILTERS: { value: HistoryFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'fuel', label: 'Fuel' },
  { value: 'charging', label: 'Charging' },
  { value: 'maintenance', label: 'Service' },
  { value: 'expenses', label: 'Expenses' },
  { value: 'odometer', label: 'Odometer' },
];

export function RecordHistory({ vehicle }: { vehicle: VehicleSummary }) {
  const { colors } = useAppTheme();
  const h = useRecordHistory(vehicle);
  const filters = FILTERS.filter(
    (f) => (f.value !== 'fuel' || usesFuel(vehicle.propulsion)) && (f.value !== 'charging' || usesCharging(vehicle.propulsion)),
  );

  return (
    <View style={styles.wrap}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {filters.map((f) => (
          <Chip key={f.value} selected={h.filter === f.value} showSelectedOverlay onPress={() => h.setFilter(f.value)}>
            {f.label}
          </Chip>
        ))}
      </ScrollView>

      {h.isError && <ErrorBanner message="Couldn't load the history." onRetry={() => void h.refetch()} />}
      {h.isLoading ? (
        <ActivityIndicator style={styles.loading} />
      ) : h.items.length === 0 ? (
        <InfoCard
          icon="history"
          title={h.total ? 'Nothing of this type' : 'Nothing logged yet'}
          body="Use the quick actions on Home to log fill-ups, services and expenses."
        />
      ) : (
        <Surface elevation={1} style={[styles.card, { borderColor: colors.outlineVariant }]}>
          {h.items.map((item, i) => (
            <View key={item.key}>
              {i > 0 && <Divider />}
              <View style={styles.row}>
                <TouchableRipple
                  style={styles.open}
                  onPress={() => router.push(routes.editRecord(LOG_SCREEN[item.kind]!, vehicle.id, item.id))}
                  accessibilityRole="button"
                  accessibilityLabel={`${item.title}, ${formatDay(item.at)}. Edit`}>
                  <View style={styles.openInner}>
                <View style={[styles.icon, { backgroundColor: colors.surfaceVariant }]}>
                  <Icon source={item.icon} size={20} color={colors.onSurfaceVariant} />
                </View>
                <View style={styles.text}>
                  <Text variant="titleSmall" numberOfLines={1}>
                    {item.title}
                  </Text>
                  <Text variant="bodySmall" numberOfLines={1} style={{ color: colors.onSurfaceVariant }}>
                    {[formatDay(item.at), item.detail].filter(Boolean).join(' · ')}
                  </Text>
                </View>
                {item.amount && (
                  <Text variant="titleSmall" style={styles.amount}>
                    {formatMoney(item.amount.value, item.amount.currency)}
                  </Text>
                )}
                  </View>
                </TouchableRipple>
                <IconButton
                  icon="delete-outline"
                  size={22}
                  hitSlop={4} // 40 dp button → 48 dp touch target
                  onPress={() => h.askDelete(item)}
                  accessibilityLabel={`Delete ${item.title} from ${formatDay(item.at)}`}
                />
              </View>
            </View>
          ))}
        </Surface>
      )}

      <ConfirmDialog
        visible={!!h.pendingDelete}
        title="Delete this record?"
        body={h.pendingDelete ? `${h.pendingDelete.title} · ${formatDay(h.pendingDelete.at)}. Totals and stats will update.` : ''}
        confirmLabel="Delete"
        busy={h.deleting}
        onConfirm={h.confirmDelete}
        onDismiss={h.cancelDelete}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  chips: { gap: 8 },
  loading: { height: 120 },
  card: { borderRadius: 16, borderWidth: 1, paddingLeft: 16, paddingRight: 4 },
  row: { flexDirection: 'row', alignItems: 'center' },
  open: { flex: 1, borderRadius: 12 },
  openInner: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  icon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1 },
  amount: { fontVariant: ['tabular-nums'] },
});
