import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from 'react-native-paper';

import { FormTextInput } from '@/components/ui/form-text-input';
import { useUpdateName } from '@/hooks/use-profile';
import { authClient } from '@/lib/auth-client';
import { useToastStore } from '@/stores/toast.store';

import { nameSchema, type NameValues } from '../profile.schemas';

/** `onDone`: called after a successful save (e.g. close the screen). */
export function NameForm({ onDone }: { onDone?: () => void }) {
  const { data: session } = authClient.useSession();
  const update = useUpdateName();
  const show = useToastStore((s) => s.show);
  const { control, handleSubmit, formState } = useForm<NameValues>({
    resolver: zodResolver(nameSchema),
    mode: 'onTouched',
    values: { name: session?.user.name ?? '' },
  });

  return (
    <>
      <FormTextInput control={control} name="name" label="Name" autoCapitalize="words" autoComplete="name" maxLength={60} />
      <Button
        mode="contained"
        contentStyle={{ height: 52 }}
        disabled={!formState.isDirty || update.isPending}
        loading={update.isPending}
        onPress={() => handleSubmit(({ name }) => update.mutate(name, { onSuccess: () => { show('Name saved'); onDone?.(); }, onError: (e) => show(e.message) }))()}>
        Save name
      </Button>
    </>
  );
}
