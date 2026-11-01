import { encodePolyline } from '@ride-ready/core';

import { useCreateRecord } from '@/hooks/use-vehicle-records';
import { useToastStore } from '@/stores/toast.store';
import { useTripRecorder } from '@/stores/trip-recorder.store';

// Recorder state + saving the finished trip to the API.
export function useRecordTrip() {
  const recorder = useTripRecorder();
  const create = useCreateRecord('trips');
  const show = useToastStore((s) => s.show);

  return {
    ...recorder,
    saving: create.isPending,
    saveError: create.error?.message,
    finishAndSave() {
      const trip = recorder.finish();
      if (!trip) return;
      create.mutate(
        {
          vehicleId: trip.vehicleId,
          input: {
            startedAt: trip.startedAt.toISOString(),
            endedAt: trip.endedAt.toISOString(),
            gpsKm: Math.round(trip.km * 100) / 100,
            ...(trip.points.length >= 2 ? { route: encodePolyline(trip.points) } : {}),
            purpose: trip.purpose,
          },
        },
        { onSuccess: () => show(`Trip saved · ${trip.km.toFixed(1)} km`) },
      );
    },
  };
}
