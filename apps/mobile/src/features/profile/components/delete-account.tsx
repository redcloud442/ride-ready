import { useState } from 'react';
import { Button, Dialog, HelperText, Portal, Text, TextInput } from 'react-native-paper';

import { ListRow } from '@/components/ui/list-group';
import { useDeleteAccount } from '@/hooks/use-profile';
import { useAppTheme } from '@/theme';

// Deletes the account with every vehicle, record and stored file. Better Auth checks the password
// (email accounts) or a recent sign-in (Google accounts). On success the session ends and the root
// layout shows sign-in.
export function DeleteAccount() {
  const { colors } = useAppTheme();
  const remove = useDeleteAccount();
  const [open, setOpen] = useState(false); // local dialog toggle
  const [password, setPassword] = useState(''); // dialog-only input, never stored

  const close = () => {
    setOpen(false);
    setPassword('');
    remove.reset();
  };

  return (
    <>
      <ListRow icon="delete-outline" title="Delete account" subtitle="Your garage, records and files" destructive onPress={() => setOpen(true)} />
      <Portal>
        <Dialog visible={open} onDismiss={close}>
          <Dialog.Title>Delete your account?</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Your vehicles, records, receipts and photos are deleted for good. Family members lose access to your garage.
            </Text>
            <TextInput
              mode="outlined"
              label="Password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              autoComplete="current-password"
              style={{ marginTop: 16 }}
            />
            <HelperText type={remove.error ? 'error' : 'info'} visible>
              {remove.error?.message ?? 'Signed in with Google? Leave it empty.'}
            </HelperText>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={close} disabled={remove.isPending}>
              Cancel
            </Button>
            <Button textColor={colors.error} loading={remove.isPending} disabled={remove.isPending} onPress={() => remove.mutate(password || undefined)}>
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </>
  );
}
