import { Stack } from 'expo-router';

import { CloseButton } from '@/components/ui/close-button';
import { FONT_ASSETS } from '@/theme';

// Profile edit screens, opened as modals from the Profile tab.
export default function AccountLayout() {
  return (
    <Stack
      screenOptions={{
        presentation: 'modal',
        headerTitleStyle: { fontFamily: FONT_ASSETS.semibold },
        headerShadowVisible: false,
        headerLeft: () => <CloseButton />,
      }}>
      <Stack.Screen name="details" options={{ title: 'Name and photo' }} />
      <Stack.Screen name="email" options={{ title: 'Email' }} />
      <Stack.Screen name="password" options={{ title: 'Password' }} />
      <Stack.Screen name="currency" options={{ title: 'Currency' }} />
    </Stack>
  );
}
