import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useController, type Control, type FieldValues, type Path } from 'react-hook-form';
import { Platform, StyleSheet, View } from 'react-native';
import { HelperText, Icon, Text, TouchableRipple } from 'react-native-paper';

import { RADIUS, useAppTheme } from '@/theme';
import { formatDay } from '@/utils/format';

type Props<T extends FieldValues> = {
  control: Control<T, any, any>;
  name: Path<T>;
  label: string;
  /** expiry dates etc.; by default only past dates (event times) */
  allowFuture?: boolean;
};

// Date picker bound to react-hook-form, styled like FormTextInput: compact native picker on iOS,
// system dialog on Android.
export function DateField<T extends FieldValues>({ control, name, label, allowFuture }: Props<T>) {
  const { colors } = useAppTheme();
  const { field, fieldState } = useController({ control, name });
  const value = field.value as Date;
  const maximumDate = allowFuture ? undefined : new Date();
  const box = [styles.box, { backgroundColor: colors.surfaceVariant }, fieldState.error && { borderColor: colors.error }];

  return (
    <View style={styles.field}>
      {Platform.OS === 'ios' ? (
        <View style={box}>
          <Text variant="bodyLarge">{label}</Text>
          <DateTimePicker
            value={value}
            mode="date"
            display="compact"
            maximumDate={maximumDate}
            onChange={(_, d) => d && field.onChange(d)}
            accentColor={colors.primary}
          />
        </View>
      ) : (
        <TouchableRipple
          style={[box, styles.ripple]}
          borderless
          accessibilityRole="button"
          accessibilityLabel={`${label}: ${formatDay(value)}. Change date`}
          onPress={() =>
            DateTimePickerAndroid.open({
              value,
              mode: 'date',
              maximumDate,
              onChange: (event, d) => event.type === 'set' && d && field.onChange(d),
            })
          }>
          <View style={styles.row}>
            <Text variant="bodyLarge">{label}</Text>
            <View style={styles.value}>
              <Text variant="bodyLarge" style={{ color: colors.primary }}>
                {formatDay(value)}
              </Text>
              <Icon source="calendar-month-outline" size={20} color={colors.onSurfaceVariant} />
            </View>
          </View>
        </TouchableRipple>
      )}
      {fieldState.error && (
        <HelperText type="error" visible padding="none">
          {fieldState.error.message}
        </HelperText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { marginBottom: 12, gap: 6 },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: RADIUS.md,
    borderWidth: 2,
    borderColor: 'transparent',
    paddingLeft: 16,
    paddingRight: 8,
    minHeight: 56,
  },
  ripple: { paddingRight: 16 },
  row: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  value: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
