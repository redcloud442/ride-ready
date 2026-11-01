import { ENERGY_PRICE_KINDS } from '@ride-ready/core';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useForm, useWatch } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { Button, HelperText, Text, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ChipSelect } from '@/components/ui/chip-select';
import { DateField } from '@/components/ui/date-field';
import { FormTextInput } from '@/components/ui/form-text-input';
import { defaultEnergyKind, ENERGY_KIND_UI } from '@/constants/energy-prices';
import { useSubmitEnergyPrice } from '@/hooks/use-energy-prices';
import { useCurrency } from '@/hooks/use-preferences';
import { useSelectedVehicle } from '@/hooks/use-vehicles';
import { useToastStore } from '@/stores/toast.store';
import { useAppTheme } from '@/theme';

import { priceFormSchema, type PriceFormInput, type PriceFormValues } from '../prices.schemas';

const KIND_OPTIONS = ENERGY_PRICE_KINDS.map((k) => ({ value: k, label: ENERGY_KIND_UI[k].short, icon: ENERGY_KIND_UI[k].icon }));

export function PriceForm() {
  const { colors } = useAppTheme();
  const vehicle = useSelectedVehicle();
  const submitPrice = useSubmitEnergyPrice();
  const currency = useCurrency();
  const show = useToastStore((s) => s.show);
  const { control, handleSubmit } = useForm<PriceFormInput, unknown, PriceFormValues>({
    resolver: zodResolver(priceFormSchema),
    mode: 'onTouched',
    defaultValues: { kind: defaultEnergyKind(vehicle?.propulsion), price: '', currency, region: '', observedAt: new Date() },
  });
  const kind = useWatch({ control, name: 'kind' });
  const submit = () =>
    handleSubmit((v) =>
      submitPrice.mutate(
        { ...v, observedAt: v.observedAt.toISOString() },
        {
          onSuccess: () => {
            show('Thanks, price reported');
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
        <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant, marginBottom: 8 }}>
          Report a price you saw. Your name is not stored with it.
        </Text>
        <ChipSelect control={control} name="kind" label="For" options={KIND_OPTIONS} />
        <FormTextInput
          control={control}
          name="price" placeholder="e.g. 1.85"
          label="Price"
          keyboardType="decimal-pad"
          right={<TextInput.Affix text={`${currency} / ${ENERGY_KIND_UI[kind].unit}`} />}
        />
        <FormTextInput control={control} name="region" label="Area (optional)" placeholder="e.g. Utrecht centre" maxLength={80} />
        <DateField control={control} name="observedAt" label="Seen on" />
        {submitPrice.error && (
          <HelperText type="error" visible accessibilityLiveRegion="polite">
            {submitPrice.error.message}
          </HelperText>
        )}
      </ScrollView>
      <SafeAreaView edges={['bottom']} style={[styles.footer, { borderTopColor: colors.outlineVariant }]}>
        <Button mode="contained" onPress={submit} loading={submitPrice.isPending} disabled={submitPrice.isPending} contentStyle={styles.cta}>
          Report price
        </Button>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 16, gap: 4 },
  row: { flexDirection: 'row', gap: 12 },
  footer: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12, borderTopWidth: StyleSheet.hairlineWidth },
  cta: { height: 52 },
});
