import { useState, type ReactNode } from 'react';
import { useFormState, type Control, type FieldValues, type Path } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { Icon, Text, TouchableRipple } from 'react-native-paper';

import { useAppTheme } from '@/theme';

type Props<T extends FieldValues> = {
  control: Control<T, any, any>;
  /** fields inside; the section opens itself when one of them has an error */
  fields: Path<T>[];
  /** what the hidden fields currently hold, e.g. "Today · no station" */
  summary: string;
  defaultOpen?: boolean;
  children: ReactNode;
};

// Optional fields folded away so a log needs only the essentials (progressive disclosure).
export function MoreDetails<T extends FieldValues>({ control, fields, summary, defaultOpen = false, children }: Props<T>) {
  const { colors } = useAppTheme();
  const [userOpen, setUserOpen] = useState(defaultOpen); // local UI toggle
  const { errors } = useFormState({ control, name: fields });
  const open = userOpen || fields.some((f) => f in errors);

  return (
    <View style={styles.wrap}>
      <TouchableRipple
        onPress={() => setUserOpen(!open)}
        style={styles.toggle}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        accessibilityLabel={`More details. ${summary}`}>
        <View style={styles.row}>
          <View style={styles.flex}>
            <Text variant="titleSmall">More details</Text>
            {!open && (
              <Text variant="bodySmall" numberOfLines={1} style={{ color: colors.onSurfaceVariant }}>
                {summary}
              </Text>
            )}
          </View>
          <Icon source={open ? 'chevron-up' : 'chevron-down'} size={24} color={colors.onSurfaceVariant} />
        </View>
      </TouchableRipple>
      {open && <View style={styles.body}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  wrap: { marginTop: 4 },
  toggle: { borderRadius: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 48, paddingVertical: 6 },
  body: { gap: 4, paddingTop: 4 },
});
