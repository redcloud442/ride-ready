import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from 'react-native-paper';

import { FormTextInput } from '@/components/ui/form-text-input';
import { useInvite } from '@/hooks/use-family';
import { useToastStore } from '@/stores/toast.store';

import { inviteSchema, type InviteValues } from '../family.schemas';

type Props = { organizationId: string | undefined; onInvited: (invite: { id: string; email: string }) => void };

export function InviteForm({ organizationId, onInvited }: Props) {
  const invite = useInvite();
  const show = useToastStore((s) => s.show);
  const { control, handleSubmit, reset } = useForm<InviteValues>({ resolver: zodResolver(inviteSchema), mode: 'onTouched' });

  const submit = () =>
    handleSubmit(({ email }) =>
      invite.mutate(
        { organizationId, email },
        {
          onSuccess: (created) => {
            reset({ email: '' });
            onInvited({ id: created.id, email: created.email });
          },
          onError: (e) => show(e.message),
        },
      ),
    )();

  return (
    <>
      <FormTextInput
        control={control}
        name="email" placeholder="partner@example.com"
        label="Their email"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        info="They can see and log everything in your garage"
      />
      <Button mode="contained" icon="account-plus-outline" loading={invite.isPending} disabled={invite.isPending} onPress={submit}>
        Invite
      </Button>
    </>
  );
}
