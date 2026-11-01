import { Share, StyleSheet, View } from 'react-native';
import { Button, Dialog, Portal, Text } from 'react-native-paper';
import QRCode from 'react-native-qrcode-svg';

import { inviteLink } from '@/api/family.api';
import { themes } from '@/theme';

// dark modules on a light field in both themes: inverted codes don't scan reliably
const QR = themes.light.paper.colors;

type Props = { invite: { id: string; email: string } | null; onDismiss: () => void };

// The invite as a QR code to scan in person, or a link to send. Either only works for the invited email.
export function InviteQrDialog({ invite, onDismiss }: Props) {
  const link = invite ? inviteLink(invite.id) : '';

  return (
    <Portal>
      <Dialog visible={!!invite} onDismiss={onDismiss}>
        <Dialog.Title>Invite {invite?.email}</Dialog.Title>
        <Dialog.Content style={styles.content}>
          <View style={[styles.qr, { backgroundColor: QR.surface }]} accessibilityLabel="Invitation QR code" accessible>
            {!!link && <QRCode value={link} size={200} color={QR.onSurface} backgroundColor={QR.surface} quietZone={8} />}
          </View>
          <Text variant="bodyMedium">
            They scan this in RideReady (Family → Scan invite), or open the link you send. They need to sign in with this email.
            The invite expires in 7 days.
          </Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss}>Done</Button>
          <Button
            icon="share-variant"
            onPress={() => Share.share({ message: `Join my garage on RideReady (sign in as ${invite?.email}): ${link}` })}>
            Share link
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  content: { gap: 16, alignItems: 'center' },
  qr: { padding: 8, borderRadius: 12 },
});
