import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '@/theme';

import { BrandGradient } from './brand-gradient';

// How far the first card overlaps the band (same as Home's hero).
export const BRAND_OVERLAP = 56;

type Props = {
  /** small line above the title, e.g. the vehicle */
  eyebrow?: string;
  title: string;
  /** right of the title, e.g. the vehicle render */
  right?: ReactNode;
  /** under the title, e.g. period pills */
  children?: ReactNode;
};

// Gradient band at the top of a tab screen, like Home's header; put the first card in a View with
// marginTop: -BRAND_OVERLAP so it overlaps the band's bottom edge.
export function BrandHeader({ eyebrow, title, right, children }: Props) {
  const { brand } = useAppTheme();
  return (
    <BrandGradient style={styles.band}>
      <SafeAreaView edges={['top']} style={styles.inner}>
        <View style={styles.row}>
          <View style={styles.text}>
            {eyebrow && (
              <Text variant="bodyMedium" numberOfLines={1} style={{ color: brand.onBrandMuted }}>
                {eyebrow}
              </Text>
            )}
            <Text variant="headlineSmall" numberOfLines={1} style={{ color: brand.onBrand }} accessibilityRole="header">
              {title}
            </Text>
          </View>
          {right}
        </View>
        {children}
      </SafeAreaView>
    </BrandGradient>
  );
}

const styles = StyleSheet.create({
  band: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: BRAND_OVERLAP + 20, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  inner: { gap: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 56 },
  text: { flex: 1 },
});
