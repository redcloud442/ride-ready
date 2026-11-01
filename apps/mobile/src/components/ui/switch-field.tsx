import { useController, type Control, type FieldValues, type Path } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { Switch, Text, TouchableRipple } from 'react-native-paper';

import { useAppTheme } from '@/theme';

type Props<T extends FieldValues> = {
  control: Control<T, any, any>;
  name: Path<T>;
  label: string;
  hint?: string;
};

export function SwitchField<T extends FieldValues>({ control, name, label, hint }: Props<T>) {
  const { colors } = useAppTheme();
  const { field } = useController({ control, name });
  const value = !!field.value;
  return (
    <TouchableRipple
      onPress={() => field.onChange(!value)}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={label}>
      <View style={styles.row}>
        <View style={styles.text}>
          <Text variant="bodyLarge">{label}</Text>
          {hint && (
            <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
              {hint}
            </Text>
          )}
        </View>
        <Switch value={value} onValueChange={field.onChange} />
      </View>
    </TouchableRipple>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 12, minHeight: 56 },
  text: { flex: 1 },
});
