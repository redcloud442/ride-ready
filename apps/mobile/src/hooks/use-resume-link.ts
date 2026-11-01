import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import { useEffect, useRef } from 'react';

import { routeFromLink } from '@/constants/routes';

/**
 * A transfer or invite link opened while signed out (or before onboarding) lands on sign-in, because
 * those screens are protected. Remember it and open it once the user is in.
 * `loaded`: the session is known. `allowed`: signed in and onboarded.
 */
export function useResumeLink({ loaded, allowed }: { loaded: boolean; allowed: boolean }) {
  const url = Linking.useLinkingURL();
  const pending = useRef<string | null>(null);
  const seen = useRef<string | null>(null); // the same URL stays current after it's handled

  useEffect(() => {
    // signed in already: Expo Router opens the link itself
    if (!url || !loaded || allowed || url === seen.current) return;
    seen.current = url;
    pending.current = url;
  }, [url, loaded, allowed]);

  useEffect(() => {
    if (!allowed || !pending.current) return;
    const { path } = Linking.parse(pending.current);
    pending.current = null;
    const href = path ? routeFromLink(`rideready://${path}`) : null;
    if (href) router.push(href);
  }, [allowed]);
}
