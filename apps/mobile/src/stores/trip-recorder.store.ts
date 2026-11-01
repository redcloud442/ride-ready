import { haversineKm, type GeoPoint, type TripPurpose } from '@ride-ready/core';
import * as Location from 'expo-location';
import { create } from 'zustand';

// GPS trip recording. App-wide so a recording keeps running while the user switches tabs.
// shortcut: foreground only (keep the app open); background recording needs a dev build with
// expo-task-manager + "always" location permission (roadmap 03).

type Recording = { vehicleId: string; startedAt: Date; points: GeoPoint[]; km: number };
export type FinishedTrip = Recording & { endedAt: Date; purpose: TripPurpose };

type TripRecorderState = {
  status: 'idle' | 'starting' | 'recording';
  recording: Recording | null;
  purpose: TripPurpose;
  error: string | null;
  /** location permission refused: the card offers to open Settings */
  permissionDenied: boolean;
  start: (vehicleId: string) => Promise<void>;
  finish: () => FinishedTrip | null;
  discard: () => void;
  setPurpose: (purpose: TripPurpose) => void;
};

// Not state: nothing renders it, it only needs removing on stop.
let subscription: Location.LocationSubscription | null = null;
const MAX_ACCURACY_M = 50; // coarser fixes add zig-zag distance

function stopWatching() {
  subscription?.remove();
  subscription = null;
}

export const useTripRecorder = create<TripRecorderState>((set, get) => ({
  status: 'idle',
  recording: null,
  purpose: 'personal',
  error: null,
  permissionDenied: false,

  async start(vehicleId) {
    if (get().status !== 'idle') return;
    set({ status: 'starting', error: null, permissionDenied: false });
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      set({ status: 'idle', error: 'Allow location access to record trips.', permissionDenied: true });
      return;
    }
    set({ status: 'recording', recording: { vehicleId, startedAt: new Date(), points: [], km: 0 } });
    subscription = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, distanceInterval: 15, timeInterval: 5000 },
      ({ coords }) => {
        if ((coords.accuracy ?? Infinity) > MAX_ACCURACY_M) return;
        const point = { lat: coords.latitude, lng: coords.longitude };
        set((s) => {
          if (!s.recording) return s;
          const last = s.recording.points[s.recording.points.length - 1];
          return {
            recording: {
              ...s.recording,
              points: [...s.recording.points, point],
              km: s.recording.km + (last ? haversineKm(last, point) : 0),
            },
          };
        });
      },
    );
  },

  finish() {
    stopWatching();
    const { recording, purpose } = get();
    set({ status: 'idle', recording: null });
    return recording ? { ...recording, endedAt: new Date(), purpose } : null;
  },

  discard() {
    stopWatching();
    set({ status: 'idle', recording: null, error: null });
  },

  setPurpose: (purpose) => set({ purpose }),
}));
