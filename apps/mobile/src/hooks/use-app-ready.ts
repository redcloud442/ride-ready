import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  useFonts,
} from '@expo-google-fonts/plus-jakarta-sans';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';

SplashScreen.preventAutoHideAsync();

// Long enough for the boot loader's entrance to play instead of flashing.
const MIN_BOOT_MS = 900;

/**
 * Native splash stays until fonts load; then the boot loader (`booting`) covers the app until the
 * session is known and the loader has shown for MIN_BOOT_MS.
 */
export function useAppReady(sessionPending: boolean) {
  const [fontsLoaded, fontError] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });
  // a font failure falls back to system fonts rather than blocking the app
  const fontsReady = fontsLoaded || !!fontError;
  const ready = fontsReady && !sessionPending;
  const [held, setHeld] = useState(false);

  useEffect(() => {
    if (!fontsReady) return;
    SplashScreen.hideAsync();
    const t = setTimeout(() => setHeld(true), MIN_BOOT_MS);
    return () => clearTimeout(t);
  }, [fontsReady]);

  return { fontsReady, ready, booting: !ready || !held };
}
