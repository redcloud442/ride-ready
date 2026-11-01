import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Icon, Surface, Text, TouchableRipple } from 'react-native-paper';

import { useAppTheme } from '@/theme';

import { useSetupChecklist } from '../hooks/use-setup-checklist';
import type { VehicleMetrics } from '../utils/metrics';

// "Get RideReady": segmented gauge (brand motif) + checklist. Hidden once everything is done.
export function SetupProgress({ metrics }: { metrics: VehicleMetrics | null }) {
  const { colors } = useAppTheme();
  const { items, done } = useSetupChecklist(metrics);
  if (done === items.length) return null;

  return (
    <Surface
      elevation={1}
      style={[styles.card, { borderColor: colors.outlineVariant }]}
      accessible
      accessibilityLabel={`Garage setup: ${done} of ${items.length} done`}>
      <View style={styles.head}>
        <Text variant="titleMedium">Get RideReady</Text>
        <Text variant="labelLarge" style={{ color: colors.onSurfaceVariant }}>
          {done} of {items.length}
        </Text>
      </View>
      <View style={styles.segments}>
        {items.map((i) => (
          <View key={i.key} style={[styles.segment, { backgroundColor: i.done ? colors.secondary : colors.surfaceVariant }]} />
        ))}
      </View>
      {items.map((i) => (
        <TouchableRipple
          key={i.key}
          disabled={i.done}
          onPress={() => router.push(i.href)}
          style={styles.itemHit}
          accessibilityRole="button"
          accessibilityState={{ disabled: i.done, checked: i.done }}
          accessibilityLabel={i.done ? `${i.label}, done` : i.label}>
          <View style={styles.item}>
            <Icon
              source={i.done ? 'check-circle' : 'circle-outline'}
              size={20}
              color={i.done ? colors.secondary : colors.outline}
            />
            <Text
              variant="bodyMedium"
              style={{ flex: 1, color: i.done ? colors.onSurfaceVariant : colors.onSurface, textDecorationLine: i.done ? 'line-through' : 'none' }}>
              {i.label}
            </Text>
            {!i.done && <Icon source="chevron-right" size={20} color={colors.onSurfaceVariant} />}
          </View>
        </TouchableRipple>
      ))}
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 12 },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  segments: { flexDirection: 'row', gap: 6 },
  segment: { flex: 1, height: 6, borderRadius: 3 },
  itemHit: { borderRadius: 8 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 44 },
});
