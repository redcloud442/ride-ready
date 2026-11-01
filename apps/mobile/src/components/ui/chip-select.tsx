import { useController, type Control, type FieldValues, type Path } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { Chip, HelperText, Text } from 'react-native-paper';

import { useAppTheme } from '@/theme';

type Option = { value: string; label: string; icon?: string };
type Props<T extends FieldValues> = {
  // any: forms whose resolver transforms values (string → number) have a different output type
  control: Control<T, any, any>;
  name: Path<T>;
  label: string;
  options: readonly Option[];
  /** tapping the selected chip clears it (for optional fields) */
  clearable?: boolean;
};

// Single choice from a short list, as wrapping chips, bound to react-hook-form.
export function ChipSelect<T extends FieldValues>({ control, name, label, options, clearable }: Props<T>) {
  const { colors } = useAppTheme();
  const { field, fieldState } = useController({ control, name });
  return (
    <View style={styles.wrap}>
      <Text variant="labelLarge" style={{ color: colors.onSurfaceVariant }}>
        {label}
      </Text>
      <View style={styles.chips} accessibilityRole="radiogroup" accessibilityLabel={label}>
        {options.map((o) => {
          const selected = field.value === o.value;
          return (
            <Chip
              key={o.value}
              icon={o.icon}
              selected={selected}
              showSelectedOverlay
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              onPress={() => field.onChange(selected && clearable ? '' : o.value)}>
              {o.label}
            </Chip>
          );
        })}
      </View>
      <HelperText type="error" visible={!!fieldState.error}>
        {fieldState.error?.message}
      </HelperText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
