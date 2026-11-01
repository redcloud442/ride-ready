import type { VehicleSummary } from '@ride-ready/core';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Divider, Icon, Surface, Text, TouchableRipple } from 'react-native-paper';

import { routes } from '@/constants/routes';
import { useDocuments } from '@/hooks/use-documents';
import { useAppTheme } from '@/theme';

import { buildNudges } from '../utils/nudges';
import type { VehicleMetrics } from '../utils/metrics';

// "Up next": reminders from the vehicle's own data. Renders nothing when there's nothing to say.
export function Nudges({ vehicle, metrics }: { vehicle: VehicleSummary; metrics: VehicleMetrics | null }) {
  const { colors } = useAppTheme();
  const docs = useDocuments(vehicle.id);
  const nudges = buildNudges({ documents: docs.data ?? [], metrics, propulsion: vehicle.propulsion });
  if (!nudges.length) return null;

  const tile = {
    error: [colors.errorContainer, colors.onErrorContainer],
    tertiary: [colors.tertiaryContainer, colors.onTertiaryContainer],
    primary: [colors.primaryContainer, colors.onPrimaryContainer],
  };

  return (
    <View style={styles.wrap}>
      <Text variant="titleMedium">Up next</Text>
      <Surface elevation={1} style={[styles.card, { borderColor: colors.outlineVariant }]}>
        {nudges.map((n, i) => (
          <View key={n.key}>
            {i > 0 && <Divider />}
            <TouchableRipple
              // document nudges lead to the vehicle's documents; the others are acted on right here on Home
              onPress={n.key.startsWith('doc-') ? () => router.push(routes.vehicle(vehicle.id)) : undefined}
              disabled={!n.key.startsWith('doc-')}
              accessibilityRole={n.key.startsWith('doc-') ? 'button' : 'text'}
              accessibilityLabel={`${n.title}. ${n.body}`}>
              <View style={styles.row}>
                <View style={[styles.icon, { backgroundColor: tile[n.tone][0] }]}>
                  <Icon source={n.icon} size={22} color={tile[n.tone][1]} />
                </View>
                <View style={styles.flex}>
                  <Text variant="titleSmall" style={n.tone === 'error' ? { color: colors.error } : undefined}>
                    {n.title}
                  </Text>
                  <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
                    {n.body}
                  </Text>
                </View>
                {n.key.startsWith('doc-') && <Icon source="chevron-right" size={22} color={colors.onSurfaceVariant} />}
              </View>
            </TouchableRipple>
          </View>
        ))}
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  wrap: { gap: 12, marginTop: 8 },
  card: { borderRadius: 16, borderWidth: 1, paddingHorizontal: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  icon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
