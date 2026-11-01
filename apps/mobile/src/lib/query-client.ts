import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { onlineManager, QueryClient, type Mutation } from '@tanstack/react-query';
import { File, Paths } from 'expo-file-system';
import * as Network from 'expo-network';

// How long the app can open offline on saved data.
export const OFFLINE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

export const queryClient = new QueryClient({
  defaultOptions: {
    // gcTime ≥ OFFLINE_MAX_AGE, or saved queries are dropped before they can be restored
    queries: { retry: 1, staleTime: 30_000, gcTime: OFFLINE_MAX_AGE },
  },
});

// While offline TanStack pauses queries (cached data stays on screen) and mutations (replayed when back).
const isOnline = (s: Network.NetworkState) => s.isConnected !== false && s.isInternetReachable !== false;
onlineManager.setEventListener((setOnline) => {
  void Network.getNetworkStateAsync().then((s) => setOnline(isOnline(s)));
  const sub = Network.addNetworkStateListener((s) => setOnline(isOnline(s)));
  return () => sub.remove();
});

/** Record saves waiting for a connection: only these have defaults that can replay them after a restart. */
export const isOfflineSave = (m: Mutation) => m.state.isPaused && m.options.mutationKey?.[0] === 'records';

// Last server data + record saves still waiting for a connection, in the app's private storage.
// Holds the user's own records (trips included), so it is deleted on sign-out and account deletion.
const cacheFile = new File(Paths.document, 'query-cache.json');
export const persister = createAsyncStoragePersister({
  storage: {
    getItem: async () => (cacheFile.exists ? cacheFile.text() : null),
    setItem: async (_key, value) => {
      if (!cacheFile.exists) cacheFile.create();
      await cacheFile.write(value);
    },
    removeItem: async () => {
      if (cacheFile.exists) cacheFile.delete();
    },
  },
});
