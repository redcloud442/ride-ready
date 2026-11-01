import type { ReactNode } from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { Surface } from 'react-native-paper';

import { RADIUS, SPACE, useAppTheme } from '@/theme';

import { Appear } from './appear';

// The Home / Insights card: surface, 1 px outlineVariant border, radius 16, elevation 1 (brand guide §6).
// Fades in on mount; `index` staggers cards down a screen.
export function Card({ children, style, index }: { children: ReactNode; style?: StyleProp<ViewStyle>; index?: number }) {
  const { colors } = useAppTheme();
  return (
    <Appear index={index}>
      <Surface elevation={1} style={[styles.card, { borderColor: colors.outlineVariant }, style]}>
        {children}
      </Surface>
    </Appear>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: RADIUS.lg, borderWidth: 1, padding: SPACE.lg, gap: SPACE.lg },
});
