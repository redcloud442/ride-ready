import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { Stack, ThemeProvider } from 'expo-router';
import { useColorScheme } from 'react-native';
import { PaperProvider } from 'react-native-paper';

import { BootLoader } from '@/components/brand/boot-loader';
import { ToastHost } from '@/components/ui/toast-host';
import { useAppReady } from '@/hooks/use-app-ready';
import { useResumeLink } from '@/hooks/use-resume-link';
import { resumeOfflineSaves } from '@/hooks/use-vehicle-records';
import { authClient } from '@/lib/auth-client';
import { isOfflineSave, OFFLINE_MAX_AGE, persister, queryClient } from '@/lib/query-client';
import { themes } from '@/theme';

export default function RootLayout() {
  const theme = themes[useColorScheme() === 'dark' ? 'dark' : 'light'];
  const { data: session, isPending } = authClient.useSession();
  useResumeLink({ loaded: !isPending, allowed: !!session?.user.onboardedAt });
  const { fontsReady, ready, booting } = useAppReady(isPending);
  if (!fontsReady) return null;

  const signedIn = !!session;
  const onboarded = !!session?.user.onboardedAt;

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister, maxAge: OFFLINE_MAX_AGE, dehydrateOptions: { shouldDehydrateMutation: isOfflineSave } }}
      onSuccess={resumeOfflineSaves}>
      <PaperProvider theme={theme.paper}>
        <ThemeProvider value={theme.nav}>
          {/* the guards need the session, so the stack waits for it under the boot loader */}
          {ready && (
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
                {/* opened while signed out, these resume after sign-in (useResumeLink) */}
                <Stack.Screen name="invite/[id]" />
                <Stack.Screen name="transfer/[id]" />
              </Stack.Protected>
              <Stack.Protected guard={signedIn && !onboarded}>
                <Stack.Screen name="onboarding" />
              </Stack.Protected>
              <Stack.Protected guard={!signedIn}>
                <Stack.Screen name="sign-in" />
              </Stack.Protected>
            </Stack>
          )}
          <ToastHost />
          {booting && <BootLoader />}
        </ThemeProvider>
      </PaperProvider>
    </PersistQueryClientProvider>
  );
}
