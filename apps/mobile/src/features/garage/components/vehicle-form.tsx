import { bodyStyleOf } from '@ride-ready/core';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useForm, useWatch } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { Button, HelperText, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ColorSwatches } from '@/components/ui/color-swatches';
import { FormTextInput } from '@/components/ui/form-text-input';
import { ImageChoiceGrid } from '@/components/ui/image-choice-grid';
import { bodyStyleOptions, PROPULSION_OPTIONS, TYPE_OPTIONS } from '@/constants/vehicles';
import { useCreateVehicle } from '@/hooks/use-vehicles';
import { vehicleFormSchema, type VehicleFormInput, type VehicleFormValues } from '@/schemas/vehicle.schema';
import { useToastStore } from '@/stores/toast.store';
import { useAppTheme } from '@/theme';

export function VehicleForm() {
  const { colors } = useAppTheme();
  const create = useCreateVehicle();
  const show = useToastStore((s) => s.show);
  const { control, handleSubmit } = useForm<VehicleFormInput, unknown, VehicleFormValues>({
    resolver: zodResolver(vehicleFormSchema),
    mode: 'onTouched',
    defaultValues: { make: '', model: '', year: '', odometerKm: '' },
  });
  const [type, color] = useWatch({ control, name: ['type', 'color'] });
  const submit = () =>
    handleSubmit((values) =>
      create.mutate({ ...values, bodyStyle: bodyStyleOf(values) }, {
        onSuccess: ({ vehicle: v, odometerSaved }) => {
          show(odometerSaved ? `${v.make} ${v.model} added` : `${v.make} ${v.model} added, but the odometer didn't save. Add it on Home.`);
          router.back();
        },
      }),
    )();

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
        <ImageChoiceGrid control={control} name="type" label="Type" options={TYPE_OPTIONS} />
        {type && (
          <>
            <ImageChoiceGrid control={control} name="bodyStyle" label="Shape" options={bodyStyleOptions(type, color)} />
            <ColorSwatches control={control} name="color" label="Color" />
          </>
        )}
        <ImageChoiceGrid control={control} name="propulsion" label="Powertrain" options={PROPULSION_OPTIONS} shape="square" />
        <FormTextInput control={control} name="make" label="Make" placeholder="e.g. Honda" autoCapitalize="words" maxLength={60} />
        <FormTextInput control={control} name="model" label="Model" placeholder="e.g. CB500X" autoCapitalize="words" maxLength={60} />
        <FormTextInput control={control} name="year" label="Year" keyboardType="number-pad" maxLength={4} />
        <FormTextInput
          control={control}
          name="odometerKm"
          label="Current odometer (optional)"
          keyboardType="decimal-pad"
          right={<TextInput.Affix text="km" />}
          info="The starting point for distance and fuel economy"
          onSubmitEditing={submit}
        />
        {create.error && (
          <HelperText type="error" visible accessibilityLiveRegion="polite">
            {create.error.message}
          </HelperText>
        )}
      </ScrollView>
      <SafeAreaView edges={['bottom']} style={[styles.footer, { borderTopColor: colors.outlineVariant }]}>
        <Button mode="contained" onPress={submit} loading={create.isPending} disabled={create.isPending} contentStyle={styles.cta}>
          Add to garage
        </Button>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 16, gap: 4 },
  footer: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12, borderTopWidth: StyleSheet.hairlineWidth },
  cta: { height: 52 },
});
