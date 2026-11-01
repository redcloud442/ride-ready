import { QueryClientProvider } from '@tanstack/react-query';
import { Stack, ThemeProvider } from 'expo-router';
import { useColorScheme } from 'react-native';
import { PaperProvider } from 'react-native-paper';

import { ToastHost } from '@/components/ui/toast-host';
import { useAppReady } from '@/hooks/use-app-ready';
import { authClient } from '@/lib/auth-client';
import { queryClient } from '@/lib/query-client';
import { themes } from '@/theme';

export default function RootLayout() {
  const theme = themes[useColorScheme() === 'dark' ? 'dark' : 'light'];
  const { data: session, isPending } = authClient.useSession();
  const ready = useAppReady(isPending);
  if (!ready) return null;

  const signedIn = !!session;
  const onboarded = !!session?.user.onboardedAt;

  return (
    <QueryClientProvider client={queryClient}>
      <PaperProvider theme={theme.paper}>
        <ThemeProvider value={theme.nav}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Protected guard={signedIn && onboarded}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="log" options={{ presentation: 'modal' }} />
              <Stack.Screen name="vehicle" />
              <Stack.Screen name="prices" />
              <Stack.Screen
                name="quick-add"
                options={{
                  presentation: 'formSheet',
                  sheetAllowedDetents: [0.92],
                  sheetGrabberVisible: true,
                  sheetCornerRadius: 24,
                }}
              />
              <Stack.Screen name="trips" options={{ headerShown: true, title: 'Trips', headerShadowVisible: false }} />
              <Stack.Screen name="family" />
              <Stack.Screen name="account" options={{ presentation: 'modal' }} />
              {/* shortcut: a link opened while signed out lands on sign-in and is not resumed after; keep the URL and replay it if invites get lost */}
              <Stack.Screen name="invite/[id]" />
            </Stack.Protected>
            <Stack.Protected guard={signedIn && !onboarded}>
              <Stack.Screen name="onboarding" />
            </Stack.Protected>
            <Stack.Protected guard={!signedIn}>
              <Stack.Screen name="sign-in" />
            </Stack.Protected>
          </Stack>
          <ToastHost />
        </ThemeProvider>
      </PaperProvider>
    </QueryClientProvider>
  );
}
