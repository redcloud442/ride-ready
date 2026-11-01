import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from 'react-native-paper';

import { FormTextInput } from '@/components/ui/form-text-input';
import { useCurrency, useUpdatePreferences } from '@/hooks/use-preferences';
import { useToastStore } from '@/stores/toast.store';

import { currencySchema, type CurrencyValues } from '../profile.schemas';

// The one currency every form and new record uses (forms no longer ask for it).
export function CurrencyForm({ onDone }: { onDone?: () => void }) {
  const currency = useCurrency();
  const update = useUpdatePreferences();
  const show = useToastStore((s) => s.show);
  const { control, handleSubmit } = useForm<CurrencyValues>({
    resolver: zodResolver(currencySchema),
    mode: 'onTouched',
    values: { currency },
  });

  const submit = () =>
    handleSubmit((v) =>
      update.mutate(v, {
        onSuccess: () => {
          show(`New records use ${v.currency}`);
          onDone?.();
        },
        onError: (e) => show(e.message),
      }),
    )();

  return (
    <>
      <FormTextInput
        control={control}
        name="currency" placeholder="e.g. EUR"
        label="Currency"
        autoCapitalize="characters"
        autoCorrect={false}
        maxLength={3}
        info="3-letter code, e.g. EUR, USD, PHP. Records you already saved keep their currency."
      />
      <Button mode="contained" contentStyle={{ height: 52 }} loading={update.isPending} disabled={update.isPending} onPress={submit}>
        Save currency
      </Button>
    </>
  );
}
