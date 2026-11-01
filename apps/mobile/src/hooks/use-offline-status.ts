import { onlineManager, useMutationState } from '@tanstack/react-query';
import { useSyncExternalStore } from 'react';

import { isOfflineSave } from '@/lib/query-client';

/** Whether the phone is online, and how many record saves are still waiting to reach the server. */
export function useOfflineStatus() {
  const online = useSyncExternalStore(onlineManager.subscribe.bind(onlineManager), () => onlineManager.isOnline());
  const pending = useMutationState({ filters: { predicate: isOfflineSave } }).length;
  return { online, pending };
}
