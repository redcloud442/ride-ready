import { usePreferences, useUpdatePreferences } from '@/hooks/use-preferences';
import { useToastStore } from '@/stores/toast.store';
import { useTripRecorder } from '@/stores/trip-recorder.store';

// Turns GPS trip tracking on/off on the account; refuses to turn it off mid-recording.
export function useTripsToggle() {
  const enabled = !!usePreferences().tripsEnabled;
  const update = useUpdatePreferences();
  const recording = useTripRecorder((s) => s.status !== 'idle');
  const show = useToastStore((s) => s.show);

  function toggle() {
    if (enabled && recording) {
      show('Finish or discard the trip you are recording first.');
      return;
    }
    update.mutate(
      { tripsEnabled: !enabled },
      {
        onSuccess: () => show(enabled ? 'Trip tracking is off. Saved trips are kept.' : 'Trip tracking is on. Find it on Home and in Garage.'),
        onError: (e) => show(e.message),
      },
    );
  }

  return { enabled, toggle, saving: update.isPending };
}
