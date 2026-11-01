import { Image } from 'expo-image';
import { useController, type Control, type FieldValues, type Path } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { HelperText, Icon, Text, TouchableRipple } from 'react-native-paper';

import { useAppTheme } from '@/theme';

type Option = { value: string; label: string; hint?: string; image: number };
type Props<T extends FieldValues> = {
  // any: forms whose resolver transforms values (string → number) have a different output type
  control: Control<T, any, any>;
  name: Path<T>;
  label?: string;
  options: readonly Option[];
  /** 'wide' for 16:10 vehicle renders, 'square' for powertrain icons */
  shape?: 'wide' | 'square';
};

// Single choice as a two-column grid of picture tiles (3D renders), bound to react-hook-form.
export function ImageChoiceGrid<T extends FieldValues>({ control, name, label, options, shape = 'wide' }: Props<T>) {
  const { colors } = useAppTheme();
  const { field, fieldState } = useController({ control, name });
  return (
    <View style={styles.wrap}>
      {label && (
        <Text variant="labelLarge" style={{ color: colors.onSurfaceVariant }}>
          {label}
        </Text>
      )}
      <View style={styles.grid} accessibilityRole="radiogroup" accessibilityLabel={label}>
        {options.map((o) => {
          const selected = field.value === o.value;
          return (
            <View
              key={o.value}
              style={[
                styles.tile,
                {
                  borderColor: selected ? colors.primary : colors.outlineVariant,
                  backgroundColor: selected ? colors.primaryContainer : colors.elevation.level1,
                },
              ]}>
              <TouchableRipple
                onPress={() => {
                  field.onChange(o.value);
                  field.onBlur();
                }}
                borderless
                style={styles.ripple}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
                accessibilityLabel={o.hint ? `${o.label}, ${o.hint}` : o.label}>
                <View style={styles.body}>
                  <Image source={o.image} style={shape === 'wide' ? styles.wide : styles.square} contentFit="contain" />
                  <Text variant="titleSmall" numberOfLines={1} style={{ color: selected ? colors.onPrimaryContainer : colors.onSurface }}>
                    {o.label}
                  </Text>
                  {o.hint && (
                    <Text
                      variant="bodySmall"
                      numberOfLines={2}
                      style={[styles.hint, { color: selected ? colors.onPrimaryContainer : colors.onSurfaceVariant }]}>
                      {o.hint}
                    </Text>
                  )}
                  <View style={styles.check}>
                    <Icon source={selected ? 'check-circle' : 'circle-outline'} size={20} color={selected ? colors.primary : colors.outline} />
                  </View>
                </View>
              </TouchableRipple>
            </View>
          );
        })}
      </View>
      <HelperText type="error" visible={!!fieldState.error} accessibilityLiveRegion="polite">
        {fieldState.error?.message}
      </HelperText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tile: { width: '47.5%', flexGrow: 0, borderRadius: 20, borderWidth: 1.5 },
  ripple: { borderRadius: 20 },
  body: { padding: 12, paddingTop: 8, alignItems: 'center', gap: 2, minHeight: 48 },
  wide: { width: '100%', aspectRatio: 1.6 },
  square: { width: '64%', aspectRatio: 1 },
  hint: { textAlign: 'center' },
  check: { position: 'absolute', top: 8, right: 8 },
});
