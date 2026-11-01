import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button, Text } from 'react-native-paper';

import { FormTextInput } from '@/components/ui/form-text-input';
import { useChangeEmail } from '@/hooks/use-profile';
import { authClient } from '@/lib/auth-client';
import { useToastStore } from '@/stores/toast.store';
import { useAppTheme } from '@/theme';

import { emailSchema, type EmailValues } from '../profile.schemas';

export function EmailForm({ onDone }: { onDone?: () => void }) {
  const { colors } = useAppTheme();
  const { data: session } = authClient.useSession();
  const change = useChangeEmail();
  const show = useToastStore((s) => s.show);
  const { control, handleSubmit, reset } = useForm<EmailValues>({ resolver: zodResolver(emailSchema), mode: 'onTouched' });

  // shortcut: there's no email sender yet, so verified addresses (Google sign-in) can't change here;
  // configure sendChangeEmailConfirmation on the API once email is set up.
  if (session?.user.emailVerified) {
    return (
      <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
        {session.user.email} is managed by your Google account.
      </Text>
    );
  }

  const submit = () =>
    handleSubmit(({ newEmail }) =>
      change.mutate(newEmail, {
        onSuccess: () => {
          reset({ newEmail: '' });
          show('Email changed');
          onDone?.();
        },
        onError: (e) => show(e.message),
      }),
    )();

  return (
    <>
      <FormTextInput
        control={control}
        name="newEmail" placeholder="new@example.com"
        label="New email"
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        info={`Currently ${session?.user.email ?? ''}. You will sign in with the new address.`}
      />
      <Button mode="contained" contentStyle={{ height: 52 }} loading={change.isPending} disabled={change.isPending} onPress={submit}>
        Change email
      </Button>
    </>
  );
}
