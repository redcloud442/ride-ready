import { VEHICLE_COLORS, type VehicleColor } from '@ride-ready/core';
import { useController, type Control, type FieldValues, type Path } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { Icon, Text, TouchableRipple } from 'react-native-paper';

import { VEHICLE_COLOR_UI } from '@/constants/vehicles';
import { useAppTheme } from '@/theme';

type Props<T extends FieldValues> = {
  // any: forms whose resolver transforms values (string → number) have a different output type
  control: Control<T, any, any>;
  name: Path<T>;
  label: string;
};

const LIGHT: VehicleColor[] = ['white', 'silver', 'beige'];

// Vehicle paint as a row of swatches, bound to react-hook-form. Tapping the chosen one clears it
// (null = the picture's own paint).
export function ColorSwatches<T extends FieldValues>({ control, name, label }: Props<T>) {
  const { colors } = useAppTheme();
  const { field } = useController({ control, name });
  const value = field.value as VehicleColor | null | undefined;
  return (
    <View style={styles.wrap}>
      <Text variant="labelLarge" style={{ color: colors.onSurfaceVariant }}>
        {label}
        {value ? ` · ${VEHICLE_COLOR_UI[value].label}` : ''}
      </Text>
      <View style={styles.row} accessibilityRole="radiogroup" accessibilityLabel={label}>
        {VEHICLE_COLORS.map((c) => {
          const selected = value === c;
          return (
            <TouchableRipple
              key={c}
              borderless
              style={styles.hit}
              onPress={() => field.onChange(selected ? null : c)}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              accessibilityLabel={VEHICLE_COLOR_UI[c].label}>
              <View style={[styles.ring, { borderColor: selected ? colors.primary : 'transparent' }]}>
                <View style={[styles.swatch, { backgroundColor: VEHICLE_COLOR_UI[c].swatch, borderColor: colors.outlineVariant }]}>
                  {selected && <Icon source="check" size={18} color={LIGHT.includes(c) ? colors.inverseSurface : colors.inverseOnSurface} />}
                </View>
              </View>
            </TouchableRipple>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8, marginBottom: 8 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  hit: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  ring: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  swatch: { width: 34, height: 34, borderRadius: 17, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
});
