import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  useFonts,
} from '@expo-google-fonts/plus-jakarta-sans';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

SplashScreen.preventAutoHideAsync();

// Keeps the splash up until fonts are loaded and the session is known.
export function useAppReady(sessionPending: boolean) {
  const [fontsLoaded, fontError] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });
  // a font failure falls back to system fonts rather than blocking the app
  const ready = (fontsLoaded || !!fontError) && !sessionPending;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  return ready;
}
