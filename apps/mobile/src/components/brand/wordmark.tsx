import { StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

import { FONT_ASSETS, useAppTheme } from '@/theme';

type Props = { size?: number; onBrand?: boolean };

// "Ride" medium + "Ready" bold; on brand surfaces "Ready" takes the teal accent.
export function Wordmark({ size = 28, onBrand = false }: Props) {
  const { colors, brand } = useAppTheme();
  return (
    <Text
      accessibilityRole="header"
      style={[styles.base, { fontSize: size, lineHeight: size * 1.2, color: onBrand ? brand.onBrand : colors.onSurface }]}>
      <Text style={{ fontFamily: FONT_ASSETS.medium }}>Ride</Text>
      <Text style={{ fontFamily: FONT_ASSETS.bold, color: onBrand ? brand.accent : colors.primary }}>Ready</Text>
    </Text>
  );
}

const styles = StyleSheet.create({
  base: { letterSpacing: -0.5 },
});
