import { useOfflineStatus } from '@/hooks/use-offline-status';

import { InfoCard } from './info-card';

const entries = (n: number) => `${n} ${n === 1 ? 'entry' : 'entries'}`;

// Numbers on screen leave out entries that haven't synced, so say so instead of looking complete.
export function OfflineBanner() {
  const { online, pending } = useOfflineStatus();
  if (online && !pending) return null;
  return online ? (
    <InfoCard icon="cloud-sync-outline" title="Syncing" body={`Sending ${entries(pending)} saved offline.`} />
  ) : (
    <InfoCard
      icon="cloud-off-outline"
      title="You're offline"
      body={
        pending
          ? `Showing saved data. ${entries(pending)} will sync when you're back online.`
          : "Showing saved data. New entries sync when you're back online."
      }
    />
  );
}
