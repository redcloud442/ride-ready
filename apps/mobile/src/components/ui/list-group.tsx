import { Fragment, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Divider, Icon, Surface, Text, TouchableRipple } from 'react-native-paper';
import Animated from 'react-native-reanimated';

import { RADIUS, SPACE, useAppTheme } from '@/theme';

import { enterAt } from './appear';

type RowProps = {
  icon: string;
  title: string;
  /** current value or a short explanation, under the title */
  subtitle?: string;
  /** replaces the chevron, e.g. a Switch */
  right?: ReactNode;
  onPress?: () => void;
  destructive?: boolean;
  disabled?: boolean;
};

// One settings row: icon tile, title + subtitle, chevron when it opens something (min 56 dp).
export function ListRow({ icon, title, subtitle, right, onPress, destructive, disabled }: RowProps) {
  const { colors } = useAppTheme();
  const tone = destructive ? colors.error : colors.onSurfaceVariant;
  return (
    <TouchableRipple
      onPress={onPress}
      disabled={disabled || !onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={[title, subtitle].filter(Boolean).join('. ')}
      accessibilityState={{ disabled: !!disabled }}>
      <View style={[styles.row, disabled && styles.disabled]}>
        <View style={[styles.icon, { backgroundColor: destructive ? colors.errorContainer : colors.surfaceVariant }]}>
          <Icon source={icon} size={20} color={tone} />
        </View>
        <View style={styles.text}>
          <Text variant="bodyLarge" style={destructive && { color: colors.error }}>
            {title}
          </Text>
          {subtitle && (
            <Text variant="bodySmall" numberOfLines={1} style={{ color: colors.onSurfaceVariant }}>
              {subtitle}
            </Text>
          )}
        </View>
        {right ?? (onPress && !destructive && <Icon source="chevron-right" size={22} color={colors.onSurfaceVariant} />)}
      </View>
    </TouchableRipple>
  );
}

// Rows grouped in a Home-style card under a small title (iOS Settings / Material list pattern).
export function ListGroup({ title, index, children }: { title?: string; index?: number; children: ReactNode[] | ReactNode }) {
  const { colors } = useAppTheme();
  const rows = (Array.isArray(children) ? children : [children]).filter(Boolean);
  return (
    <Animated.View entering={enterAt(index)} style={styles.group}>
      {title && (
        <Text variant="titleSmall" style={[styles.title, { color: colors.onSurfaceVariant }]} accessibilityRole="header">
          {title}
        </Text>
      )}
      <Surface elevation={1} style={[styles.card, { borderColor: colors.outlineVariant }]}>
        {rows.map((row, i) => (
          <Fragment key={i}>
            {i > 0 && <Divider style={styles.divider} />}
            {row}
          </Fragment>
        ))}
      </Surface>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  group: { gap: SPACE.sm },
  title: { paddingHorizontal: SPACE.xs },
  card: { borderRadius: RADIUS.lg, borderWidth: 1, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: SPACE.md, paddingHorizontal: SPACE.lg, paddingVertical: SPACE.md, minHeight: 60 },
  icon: { width: 36, height: 36, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1, gap: 2 },
  disabled: { opacity: 0.5 },
  divider: { marginLeft: 64 },
});
