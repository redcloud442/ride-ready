import type { VehicleSummary } from '@ride-ready/core';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Button, Icon, Surface, Text, TouchableRipple } from 'react-native-paper';

import { routes } from '@/constants/routes';
import { useVehicleRecords } from '@/hooks/use-vehicle-records';
import { useAppTheme } from '@/theme';
import { formatDay, formatNumber } from '@/utils/format';

// Latest measured state of health + history. EVs and PHEVs only.
export function BatteryHealthCard({ vehicle }: { vehicle: VehicleSummary }) {
  const { colors } = useAppTheme();
  const records = useVehicleRecords('battery', vehicle.id);
  const items = records.data ?? [];
  const latest = items[0];

  return (
    <Surface elevation={1} style={[styles.card, { borderColor: colors.outlineVariant }]}>
      <View style={styles.head}>
        <View style={[styles.icon, { backgroundColor: colors.secondaryContainer }]}>
          <Icon source="battery-heart-variant" size={22} color={colors.onSecondaryContainer} />
        </View>
        <View style={styles.flex}>
          <Text variant="titleMedium">Battery health</Text>
          <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
            {latest ? `${formatDay(new Date(latest.measuredAt))} · ${latest.source}` : 'Only from a real measurement'}
          </Text>
        </View>
        <Text variant="headlineSmall" style={styles.num}>
          {latest ? `${formatNumber(Number(latest.sohPct), 1)}%` : '—'}
        </Text>
      </View>
      {items.slice(1, 4).map((r) => (
        <TouchableRipple
          key={r.id}
          onPress={() => router.push(routes.editRecord('battery', vehicle.id, r.id))}
          accessibilityRole="button"
          accessibilityLabel={`${formatNumber(Number(r.sohPct), 1)} percent on ${formatDay(new Date(r.measuredAt))}. Edit`}>
          <View style={styles.row}>
            <Text variant="bodyMedium" style={[styles.flex, { color: colors.onSurfaceVariant }]}>
              {formatDay(new Date(r.measuredAt))} · {r.source}
            </Text>
            <Text variant="titleSmall" style={styles.num}>
              {formatNumber(Number(r.sohPct), 1)}%
            </Text>
          </View>
        </TouchableRipple>
      ))}
      <View style={styles.actions}>
        {latest && (
          <Button onPress={() => router.push(routes.editRecord('battery', vehicle.id, latest.id))}>Edit latest</Button>
        )}
        <Button mode="contained-tonal" icon="plus" onPress={() => router.push(routes.logFor('battery', vehicle.id))}>
          Add measurement
        </Button>
      </View>
    </Surface>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  card: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 8 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  icon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  num: { fontVariant: ['tabular-nums'] },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, minHeight: 44 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
});
