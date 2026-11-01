import { Button, Dialog, Portal, Text } from 'react-native-paper';

import { useAppTheme } from '@/theme';

type Props = {
  visible: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  busy?: boolean;
  onConfirm: () => void;
  onDismiss: () => void;
};

// Confirmation before a destructive action; the confirm button uses the error color.
export function ConfirmDialog({ visible, title, body, confirmLabel, busy, onConfirm, onDismiss }: Props) {
  const { colors } = useAppTheme();
  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>{title}</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium">{body}</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss} disabled={busy}>
            Cancel
          </Button>
          <Button onPress={onConfirm} loading={busy} disabled={busy} textColor={colors.error}>
            {confirmLabel}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}
