import { Controller, type Control, type FieldValues, type Path } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { HelperText, Text, TextInput, type TextInputProps } from 'react-native-paper';

import { RADIUS, useAppTheme } from '@/theme';

type Props<T extends FieldValues> = Omit<TextInputProps, 'value' | 'onChangeText' | 'onBlur' | 'error'> & {
  // any: forms whose resolver transforms values (string → number) have a different output type
  control: Control<T, any, any>;
  name: Path<T>;
  /** helper shown when the field has no error */
  info?: string;
};

// Soft filled input bound to react-hook-form (brand guide §7 "Inputs"): label above, tinted fill, no
// border at rest, primary ring on focus. The line below shows the field's zod error, else `info`.
export function FormTextInput<T extends FieldValues>({ control, name, info, label, style, ...input }: Props<T>) {
  const { colors } = useAppTheme();
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const message = fieldState.error?.message ?? info;
        return (
          <View style={styles.field}>
            {typeof label === 'string' ? (
              <Text variant="labelLarge" style={{ color: fieldState.error ? colors.error : colors.onSurfaceVariant }}>
                {label}
              </Text>
            ) : (
              label
            )}
            <TextInput
              mode="outlined"
              outlineColor="transparent"
              activeOutlineColor={colors.primary}
              outlineStyle={styles.outline}
              placeholderTextColor={colors.onSurfaceVariant}
              accessibilityLabel={typeof label === 'string' ? label : undefined}
              {...input}
              style={[{ backgroundColor: colors.surfaceVariant }, style]}
              ref={field.ref} // lets handleSubmit focus the first invalid field
              value={field.value ?? ''}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              error={!!fieldState.error}
            />
            {!!message && (
              <HelperText type={fieldState.error ? 'error' : 'info'} visible padding="none" accessibilityLiveRegion="polite">
                {message}
              </HelperText>
            )}
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  field: { gap: 6, marginBottom: 12 },
  outline: { borderRadius: RADIUS.md },
});
