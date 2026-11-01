import { Stack } from 'expo-router';

import { CloseButton } from '@/components/ui/close-button';
import { FONT_ASSETS } from '@/theme';

// Log screens open as a modal stack over the tabs; `?id=` means editing an existing record.
const TITLES = {
  odometer: ['Odometer reading', 'Edit odometer reading'],
  fuel: ['Log fill-up', 'Edit fill-up'],
  charging: ['Log charge', 'Edit charge'],
  maintenance: ['Log service', 'Edit service'],
  expense: ['Log expense', 'Edit expense'],
  battery: ['Battery health', 'Edit battery health'],
} as const;

export default function LogLayout() {
  return (
    <Stack
      screenOptions={{
        headerTitleStyle: { fontFamily: FONT_ASSETS.semibold },
        headerShadowVisible: false,
        headerLeft: () => <CloseButton />,
      }}>
      {Object.entries(TITLES).map(([name, [create, edit]]) => (
        <Stack.Screen
          key={name}
          name={name}
          options={({ route }) => ({ title: (route.params as { id?: string } | undefined)?.id ? edit : create })}
        />
      ))}
    </Stack>
  );
}
