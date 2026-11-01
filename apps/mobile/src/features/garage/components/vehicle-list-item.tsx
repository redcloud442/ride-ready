import type { VehicleSummary } from '@ride-ready/core';
import { StyleSheet, View } from 'react-native';
import { Icon, Surface, Text, TouchableRipple } from 'react-native-paper';

import { VehicleThumb } from '@/components/vehicle-thumb';
import { PROPULSION_UI } from '@/constants/vehicles';
import { useAppTheme } from '@/theme';

type Props = { vehicle: VehicleSummary; active: boolean; onPress: () => void };

export function VehicleListItem({ vehicle, active, onPress }: Props) {
  const { colors } = useAppTheme();
  const propulsion = PROPULSION_UI[vehicle.propulsion];
  const name = `${vehicle.make} ${vehicle.model}`;

  return (
    <Surface
      elevation={1}
      style={[styles.card, { borderColor: active ? colors.primary : colors.outlineVariant, backgroundColor: colors.elevation.level1 }]}>
      <TouchableRipple
        onPress={onPress}
        borderless
        style={styles.ripple}
        accessibilityRole="button"
        accessibilityLabel={`${vehicle.year} ${name}, ${propulsion.label}${active ? ', shown on Home' : ''}. Open details`}>
        <View style={styles.row}>
          <View style={[styles.tile, { backgroundColor: colors.primaryContainer }]}>
            <VehicleThumb vehicle={vehicle} height={44} />
          </View>
          <View style={styles.text}>
            <Text variant="titleMedium" numberOfLines={1}>
              {name}
            </Text>
            <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
              {vehicle.year} · {propulsion.label}
            </Text>
          </View>
          {/* icon + border, not colour alone */}
          {active && <Icon source="home-variant" size={20} color={colors.primary} />}
          <Icon source="chevron-right" size={24} color={colors.onSurfaceVariant} />
        </View>
      </TouchableRipple>
    </Surface>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, borderWidth: 1.5 },
  ripple: { borderRadius: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 16, padding: 16 },
  tile: { width: 84, height: 60, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1, gap: 2 },
});
