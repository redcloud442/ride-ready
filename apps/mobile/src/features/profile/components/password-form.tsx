import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button, Text } from 'react-native-paper';

import { PasswordInput } from '@/components/ui/password-input';
import { useChangePassword } from '@/hooks/use-profile';
import { authClient } from '@/lib/auth-client';
import { useToastStore } from '@/stores/toast.store';
import { useAppTheme } from '@/theme';

import { passwordSchema, type PasswordValues } from '../profile.schemas';

export function PasswordForm({ onDone }: { onDone?: () => void }) {
  const { colors } = useAppTheme();
  const { data: session } = authClient.useSession();
  const change = useChangePassword();
  const show = useToastStore((s) => s.show);
  const { control, handleSubmit, reset } = useForm<PasswordValues>({ resolver: zodResolver(passwordSchema), mode: 'onTouched' });

  // shortcut: only Google sign-ins have a verified email until email verification exists; switch to
  // authClient.listAccounts() (a "credential" account) when it does.
  if (session?.user.emailVerified) {
    return (
      <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
        You sign in with Google, so there is no RideReady password to change.
      </Text>
    );
  }

  const submit = () =>
    handleSubmit(({ currentPassword, newPassword }) =>
      change.mutate(
        { currentPassword, newPassword },
        {
          onSuccess: () => {
            reset({ currentPassword: '', newPassword: '', confirmPassword: '' });
            show('Password changed. Other devices were signed out.');
            onDone?.();
          },
          onError: (e) => show(e.message),
        },
      ),
    )();

  return (
    <>
      <PasswordInput control={control} name="currentPassword" label="Current password" autoComplete="current-password" />
      <PasswordInput
        control={control}
        name="newPassword"
        label="New password"
        autoComplete="new-password"
        info="At least 8 characters, with a letter and a number"
      />
      <PasswordInput control={control} name="confirmPassword" label="Confirm new password" autoComplete="new-password" />
      <Button mode="contained" contentStyle={{ height: 52 }} loading={change.isPending} disabled={change.isPending} onPress={submit}>
        Change password
      </Button>
    </>
  );
}
