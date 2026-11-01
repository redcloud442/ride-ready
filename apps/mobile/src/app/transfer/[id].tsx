import { Stack, useLocalSearchParams } from 'expo-router';

import { TransferDetails } from '@/features/transfer/components/transfer-details';

// rideready://transfer/<id> — the seller's QR code, scanned with the phone camera or in the app.
export default function TransferScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: 'Vehicle transfer', headerShadowVisible: false }} />
      <TransferDetails id={id} />
    </>
  );
}
