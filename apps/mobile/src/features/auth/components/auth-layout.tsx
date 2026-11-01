import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Appear } from '@/components/ui/appear';
import { BrandGradient } from '@/components/brand/brand-gradient';
import { LogoMark } from '@/components/brand/logo-mark';
import { Wordmark } from '@/components/brand/wordmark';
import { useAppTheme } from '@/theme';

// Brand gradient with logo on top, form on a rounded sheet below.
export function AuthLayout({ title, children }: { title: string; children: ReactNode }) {
  const { colors, brand } = useAppTheme();
  return (
    <BrandGradient style={styles.flex}>
      <SafeAreaView edges={['top']} style={styles.flex}>
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" bounces={false}>
            <Appear style={styles.hero}>
              <LogoMark size={64} />
              <Wordmark size={32} onBrand />
              <Text variant="bodyLarge" style={[styles.center, { color: brand.onBrandMuted }]}>
                One garage. Every kilometer. Smarter ownership.
              </Text>
            </Appear>
            <Appear index={1} style={[styles.sheet, { backgroundColor: colors.background }]}>
              <Text variant="headlineSmall" accessibilityRole="header">
                {title}
              </Text>
              {children}
            </Appear>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </BrandGradient>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { flexGrow: 1 },
  hero: { alignItems: 'center', gap: 8, paddingHorizontal: 24, paddingTop: 32, paddingBottom: 36 },
  center: { textAlign: 'center' },
  sheet: { flexGrow: 1, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, gap: 16 },
});
