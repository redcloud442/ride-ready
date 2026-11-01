import { Stack, useLocalSearchParams } from 'expo-router';

import { InvitationDetails } from '@/features/family/components/invitation-details';

// rideready://invite/<id> — from a scanned QR code or a shared link.
export default function InviteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: 'Family invite', headerShadowVisible: false }} />
      <InvitationDetails id={id} />
    </>
  );
}
