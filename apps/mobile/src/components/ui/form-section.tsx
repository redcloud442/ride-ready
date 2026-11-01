import type { ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import { Surface, Text } from 'react-native-paper';
import Animated from 'react-native-reanimated';

import { RADIUS, SPACE, useAppTheme } from '@/theme';

import { enterAt } from './appear';

type Props = { title?: string; footer?: string; index?: number; children: ReactNode };

// A group of related fields (brand guide §7 "Form groups"): small title, then a rounded card.
export function FormSection({ title, footer, index, children }: Props) {
  const { colors } = useAppTheme();
  return (
    <Animated.View entering={enterAt(index)} style={styles.wrap}>
      {title && (
        <Text variant="titleSmall" style={[styles.title, { color: colors.onSurfaceVariant }]} accessibilityRole="header">
          {title}
        </Text>
      )}
      <Surface elevation={0} style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
        {children}
      </Surface>
      {footer && (
        <Text variant="bodySmall" style={[styles.title, { color: colors.onSurfaceVariant }]}>
          {footer}
        </Text>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: SPACE.sm },
  title: { paddingHorizontal: SPACE.xs },
  card: { borderRadius: RADIUS.lg, borderWidth: StyleSheet.hairlineWidth, padding: SPACE.lg, paddingBottom: SPACE.xs, gap: SPACE.xs },
});
