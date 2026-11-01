import type { Control } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { Text, TextInput } from 'react-native-paper';

import { FormTextInput } from '@/components/ui/form-text-input';

import type { OnboardingInput, OnboardingValues } from '../onboarding.schemas';

export function DetailsStep({ control, onSubmit }: { control: Control<OnboardingInput, unknown, OnboardingValues>; onSubmit: () => void }) {
  return (
    <View style={styles.wrap}>
      <Text variant="headlineSmall" accessibilityRole="header">
        A few details
      </Text>
      <View>
        <FormTextInput control={control} name="make" label="Make" placeholder="e.g. Toyota" autoCapitalize="words" maxLength={60} />
        <FormTextInput control={control} name="model" label="Model" placeholder="e.g. Corolla Cross" autoCapitalize="words" maxLength={60} />
        <FormTextInput
          control={control}
          name="year"
          label="Year"
          placeholder={`e.g. ${new Date().getFullYear()}`}
          keyboardType="number-pad"
          maxLength={4}
        />
        <FormTextInput
          control={control}
          name="odometerKm"
          label="Current odometer (optional)"
          keyboardType="decimal-pad"
          right={<TextInput.Affix text="km" />}
          info="The starting point for distance and fuel economy"
          onSubmitEditing={onSubmit}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
});
