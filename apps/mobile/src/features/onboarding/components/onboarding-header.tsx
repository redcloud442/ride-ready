import { StyleSheet, View } from 'react-native';
import { Button, IconButton, ProgressBar, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandGradient } from '@/components/brand/brand-gradient';
import { LogoMark } from '@/components/brand/logo-mark';
import { useAppTheme } from '@/theme';

type Props = {
  index: number;
  total: number;
  onBack: () => void;
  onSkip: () => void;
  skipDisabled: boolean;
};

export function OnboardingHeader({ index, total, onBack, onSkip, skipDisabled }: Props) {
  const { brand } = useAppTheme();
  return (
    <BrandGradient style={styles.band}>
      <SafeAreaView edges={['top']}>
        <View style={styles.row}>
          {index > 0 ? (
            <IconButton icon="arrow-left" iconColor={brand.onBrand} onPress={onBack} accessibilityLabel="Back" />
          ) : (
            <View style={styles.logo}>
              <LogoMark size={32} />
            </View>
          )}
          <Text variant="labelLarge" style={[styles.flex, { color: brand.onBrandMuted }]}>
            Step {index + 1} of {total}
          </Text>
          <Button onPress={onSkip} disabled={skipDisabled} textColor={brand.onBrand} compact>
            Skip
          </Button>
        </View>
        <ProgressBar
          progress={(index + 1) / total}
          color={brand.accent}
          style={[styles.progress, { backgroundColor: brand.motif }]}
          accessibilityLabel={`Step ${index + 1} of ${total}`}
        />
      </SafeAreaView>
    </BrandGradient>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  band: { paddingBottom: 20, paddingHorizontal: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  logo: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center' },
  progress: { height: 6, borderRadius: 3, marginHorizontal: 12, marginTop: 4 },
});
