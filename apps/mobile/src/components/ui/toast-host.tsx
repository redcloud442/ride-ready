import { Snackbar } from 'react-native-paper';

import { useToastStore } from '@/stores/toast.store';
import { RADIUS } from '@/theme';

// Mounted once in the root layout; anything can call useToastStore.getState().show(message).
export function ToastHost() {
  const message = useToastStore((s) => s.message);
  const hide = useToastStore((s) => s.hide);
  return (
    <Snackbar visible={!!message} onDismiss={hide} duration={3000} style={{ borderRadius: RADIUS.md }}>
      {message}
    </Snackbar>
  );
}
