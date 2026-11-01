import { Stack } from 'expo-router';

import { CloseButton } from '@/components/ui/close-button';
import { FONT_ASSETS } from '@/theme';

export default function PricesLayout() {
  return (
    <Stack screenOptions={{ headerTitleStyle: { fontFamily: FONT_ASSETS.semibold }, headerShadowVisible: false }}>
      <Stack.Screen name="index" options={{ title: 'Fuel and charging prices' }} />
      <Stack.Screen name="new" options={{ title: 'Report a price', presentation: 'modal', headerLeft: () => <CloseButton /> }} />
    </Stack>
  );
}
