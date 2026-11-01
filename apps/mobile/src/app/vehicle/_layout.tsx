import { Stack } from 'expo-router';

import { CloseButton } from '@/components/ui/close-button';
import { FONT_ASSETS } from '@/theme';

const modal = { presentation: 'modal' as const, headerLeft: () => <CloseButton /> };

export default function VehicleLayout() {
  return (
    <Stack screenOptions={{ headerTitleStyle: { fontFamily: FONT_ASSETS.semibold }, headerShadowVisible: false }}>
      <Stack.Screen name="[id]" options={{ title: 'Vehicle' }} />
      <Stack.Screen name="new" options={{ title: 'Add vehicle', ...modal }} />
      <Stack.Screen name="edit" options={{ title: 'Edit vehicle', ...modal }} />
      <Stack.Screen name="document" options={{ title: 'Add document', ...modal }} />
    </Stack>
  );
}
