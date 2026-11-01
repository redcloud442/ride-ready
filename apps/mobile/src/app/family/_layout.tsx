import { Stack } from 'expo-router';

import { CloseButton } from '@/components/ui/close-button';
import { FONT_ASSETS } from '@/theme';

export default function FamilyLayout() {
  return (
    <Stack screenOptions={{ headerTitleStyle: { fontFamily: FONT_ASSETS.semibold }, headerShadowVisible: false }}>
      <Stack.Screen name="index" options={{ title: 'Family' }} />
      <Stack.Screen name="scan" options={{ title: 'Scan invite', presentation: 'modal', headerLeft: () => <CloseButton /> }} />
    </Stack>
  );
}
