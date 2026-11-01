import { bodyStyleOf, type VehicleSummary } from '@ride-ready/core';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useForm, useWatch } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { Button, HelperText, Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ColorSwatches } from '@/components/ui/color-swatches';
import { FormTextInput } from '@/components/ui/form-text-input';
import { DeleteVehicle } from './delete-vehicle';
import { ImageChoiceGrid } from '@/components/ui/image-choice-grid';
import { routes } from '@/constants/routes';
import { bodyStyleOptions, PROPULSION_UI, VEHICLE_TYPE_UI } from '@/constants/vehicles';
import { useUpdateVehicle } from '@/hooks/use-vehicles';
import { vehicleEditSchema, type VehicleEditInput, type VehicleEditValues } from '@/schemas/vehicle.schema';
import { useToastStore } from '@/stores/toast.store';
import { useAppTheme } from '@/theme';

export function VehicleEditForm({ vehicle }: { vehicle: VehicleSummary }) {
  const { colors } = useAppTheme();
  const update = useUpdateVehicle();
  const show = useToastStore((s) => s.show);
  const { control, handleSubmit } = useForm<VehicleEditInput, unknown, VehicleEditValues>({
    resolver: zodResolver(vehicleEditSchema),
    mode: 'onTouched',
    defaultValues: { make: vehicle.make, model: vehicle.model, year: String(vehicle.year), variant: vehicle.variant ?? '', bodyStyle: bodyStyleOf(vehicle), color: vehicle.color },
  });
  const color = useWatch({ control, name: 'color' });
  const submit = () =>
    handleSubmit((input) =>
      update.mutate(
        { id: vehicle.id, input },
        {
          onSuccess: () => {
            show('Vehicle updated');
            router.back();
          },
        },
      ),
    )();

  return (
    <KeyboardAvoidingView
      style={[styles.flex, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
        <Text variant="bodyMedium" style={[styles.note, { color: colors.onSurfaceVariant }]}>
          {VEHICLE_TYPE_UI[vehicle.type].label} · {PROPULSION_UI[vehicle.propulsion].label}. Type and powertrain can&apos;t
          change because your fuel and charging records depend on them.
        </Text>
        <FormTextInput control={control} name="make" placeholder="e.g. Honda" label="Make" autoCapitalize="words" maxLength={60} />
        <FormTextInput control={control} name="model" placeholder="e.g. CB500X" label="Model" autoCapitalize="words" maxLength={60} />
        <FormTextInput control={control} name="variant" label="Variant (optional)" placeholder="e.g. 1.6 Hybrid, Adventure" maxLength={60} />
        <FormTextInput control={control} name="year" placeholder="e.g. 2021" label="Year" keyboardType="number-pad" maxLength={4} onSubmitEditing={submit} />
        <ImageChoiceGrid control={control} name="bodyStyle" label="Shape" options={bodyStyleOptions(vehicle.type, color)} />
        <ColorSwatches control={control} name="color" label="Color" />
        <Button icon="account-arrow-right-outline" onPress={() => router.push(routes.transferVehicle(vehicle.id))} style={styles.transfer}>
          Sold it? Transfer to new owner
        </Button>
        <DeleteVehicle vehicle={vehicle} />
        {update.error && (
          <HelperText type="error" visible accessibilityLiveRegion="polite">
            {update.error.message}
          </HelperText>
        )}
      </ScrollView>
      <SafeAreaView edges={['bottom']} style={[styles.footer, { borderTopColor: colors.outlineVariant }]}>
        <Button mode="contained" onPress={submit} loading={update.isPending} disabled={update.isPending} contentStyle={styles.cta}>
          Save changes
        </Button>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 16, gap: 4 },
  note: { marginBottom: 12 },
  footer: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12, borderTopWidth: StyleSheet.hairlineWidth },
  cta: { height: 52 },
  transfer: { marginTop: 24, alignSelf: 'flex-start' },
});
