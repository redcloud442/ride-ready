import type { Control } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import type { ComponentProps } from 'react';

import { ImageChoiceGrid } from '@/components/ui/image-choice-grid';
import { useAppTheme } from '@/theme';

import type { OnboardingInput, OnboardingValues } from '../onboarding.schemas';

type Props = {
  control: Control<OnboardingInput, unknown, OnboardingValues>;
  name: 'type' | 'bodyStyle' | 'propulsion';
  title: string;
  subtitle: string;
  options: ComponentProps<typeof ImageChoiceGrid>['options'];
  shape?: 'wide' | 'square';
};

// One question with picture tiles, bound to a form field.
export function ChoiceStep({ control, name, title, subtitle, options, shape }: Props) {
  const { colors } = useAppTheme();
  return (
    <View style={styles.wrap}>
      <Text variant="headlineSmall" accessibilityRole="header">
        {title}
      </Text>
      <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>
        {subtitle}
      </Text>
      <View style={styles.choices}>
        <ImageChoiceGrid control={control} name={name} label={title} options={options} shape={shape} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  choices: { marginTop: 4 },
});
