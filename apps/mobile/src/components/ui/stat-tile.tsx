import { StyleSheet } from 'react-native';
import { Surface, Text, useTheme } from 'react-native-paper';

type Props = {
  label: string;
  /** null = not enough data; rendered as "—" with `emptyHint`, never as 0. */
  value: string | null;
  emptyHint: string;
  /** shown under a value, e.g. how it was obtained ("Calculated · 3 full fill-ups") */
  caption?: string;
};

export function StatTile({ label, value, emptyHint, caption }: Props) {
  const { colors } = useTheme();
  const note = value === null ? emptyHint : caption;
  return (
    <Surface
      elevation={1}
      style={[styles.tile, { borderColor: colors.outlineVariant }]}
      accessible
      accessibilityLabel={`${label}: ${value ?? 'not available'}. ${note ?? ''}`}>
      <Text variant="labelMedium" style={{ color: colors.onSurfaceVariant }}>
        {label}
      </Text>
      <Text variant="headlineSmall" style={styles.value}>
        {value ?? '—'}
      </Text>
      {note && (
        <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }} numberOfLines={2}>
          {note}
        </Text>
      )}
    </Surface>
  );
}

const styles = StyleSheet.create({
  tile: { flex: 1, borderRadius: 16, borderWidth: 1, padding: 16, gap: 4 },
  value: { fontVariant: ['tabular-nums'] },
});
