import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';

import { useAppTheme } from '@/theme';

export type StatColumn = {
  label: string;
  /** null = not enough data: shown as "—" with the note saying what's needed, never 0 */
  value: string | null;
  note: string;
};

// Side-by-side numbers split by hairlines, as in Home's "This month" card.
export function StatColumns({ columns }: { columns: StatColumn[] }) {
  const { colors } = useAppTheme();
  return (
    <View style={styles.columns}>
      {columns.map((c, i) => (
        <View
          key={c.label}
          style={[styles.column, i > 0 && { borderLeftColor: colors.outlineVariant, borderLeftWidth: StyleSheet.hairlineWidth }]}
          accessible
          accessibilityLabel={`${c.label}: ${c.value ?? 'not available'}. ${c.note}`}>
          <Text variant="labelSmall" style={{ color: colors.onSurfaceVariant }} numberOfLines={1}>
            {c.label}
          </Text>
          <Text
            variant="titleMedium"
            style={[styles.num, c.value == null && { color: colors.onSurfaceVariant }]}
            numberOfLines={1}
            adjustsFontSizeToFit>
            {c.value ?? '—'}
          </Text>
          <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }} numberOfLines={2}>
            {c.note}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  columns: { flexDirection: 'row' },
  column: { flex: 1, gap: 2, paddingHorizontal: 8 },
  num: { fontVariant: ['tabular-nums'] },
});
