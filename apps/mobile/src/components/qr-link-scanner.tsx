import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';

import { routeFromLink } from '@/constants/routes';
import { useToastStore } from '@/stores/toast.store';
import { useAppTheme } from '@/theme';

type Props = { hint: string; why: string };

// Camera that reads a RideReady QR code (family invite or vehicle transfer) and opens its screen.
export function QrLinkScanner({ hint, why }: Props) {
  const { colors } = useAppTheme();
  const [permission, requestPermission] = useCameraPermissions();
  const show = useToastStore((s) => s.show);
  const handled = useRef(false); // the callback fires for every frame the code is in view

  if (!permission) return null;
  if (!permission.granted) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text variant="bodyLarge" style={styles.text}>
          {why}
        </Text>
        <Button mode="contained" onPress={requestPermission}>
          Allow camera
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.flex}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={({ data }) => {
          if (handled.current) return;
          const href = routeFromLink(data);
          if (!href) {
            show("That isn't a RideReady code.");
            return;
          }
          handled.current = true;
          router.replace(href);
        }}
      />
      <Text variant="bodyLarge" style={[styles.hint, { color: colors.onPrimary, backgroundColor: colors.primary }]}>
        {hint}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 24 },
  text: { textAlign: 'center' },
  hint: { position: 'absolute', bottom: 48, alignSelf: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 24, overflow: 'hidden' },
});
