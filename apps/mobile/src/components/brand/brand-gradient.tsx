import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useAppTheme } from '@/theme';

type Props = { children?: ReactNode; style?: StyleProp<ViewStyle> };

// Brand surface: violet gradient with the gauge-arc motif (concentric rings) bleeding off the top-right.
export function BrandGradient({ children, style }: Props) {
  const { brand } = useAppTheme();
  return (
    <LinearGradient colors={brand.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.base, style]}>
      <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={StyleSheet.absoluteFill}>
        {[260, 360, 460].map((d) => (
          <View
            key={d}
            style={[styles.ring, { width: d, height: d, borderRadius: d / 2, borderColor: brand.motif, top: -d / 2.4, right: -d / 2.6 }]}
          />
        ))}
      </View>
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  base: { overflow: 'hidden' },
  ring: { position: 'absolute', borderWidth: 2 },
});
