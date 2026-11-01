import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandGradient } from '@/components/brand/brand-gradient';
import { LogoMark } from '@/components/brand/logo-mark';
import { authClient } from '@/lib/auth-client';
import { useAppTheme } from '@/theme';
import { firstName, greetingFor } from '@/utils/greeting';

import { AccountMenu } from './account-menu';

// Gradient band; the hero card below overlaps its bottom edge (HERO_OVERLAP).
export const HERO_OVERLAP = 56;

export function DashboardHeader() {
  const { brand } = useAppTheme();
  const { data: session } = authClient.useSession();
  return (
    <BrandGradient style={styles.band}>
      <SafeAreaView edges={['top']}>
        <View style={styles.row}>
          <LogoMark size={36} />
          <View style={styles.text}>
            <Text variant="bodyMedium" style={{ color: brand.onBrandMuted }}>
              {greetingFor()}
            </Text>
            <Text variant="headlineSmall" numberOfLines={1} style={{ color: brand.onBrand }} accessibilityRole="header">
              {firstName(session?.user.name) ?? 'Driver'}
            </Text>
          </View>
          <AccountMenu />
        </View>
      </SafeAreaView>
    </BrandGradient>
  );
}

const styles = StyleSheet.create({
  band: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: HERO_OVERLAP + 20, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  text: { flex: 1 },
});
