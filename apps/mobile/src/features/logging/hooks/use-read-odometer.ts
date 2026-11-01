import { useMutation } from '@tanstack/react-query';

import { usePickFile } from '@/hooks/use-pick-file';
import { canReadText, readOdometerImage } from '@/lib/ocr';
import { useToastStore } from '@/stores/toast.store';

// Dashboard photo → odometer value in the form, read on the phone. The user checks it before saving.
export function useReadOdometer(onRead: (km: number) => void) {
  const pick = usePickFile();
  const show = useToastStore((s) => s.show);
  const reader = useMutation({ mutationFn: readOdometerImage });

  return {
    reading: reader.isPending,
    /** the last value read from a photo, to label the saved reading as `photo_ocr` when it's unchanged */
    readKm: reader.data ?? null,
    async read() {
      if (!canReadText()) {
        show('Reading photos needs the RideReady development build. Type the number in for now.');
        return;
      }
      const file = await pick.fromImage('camera');
      if (!file) return;
      reader.mutate(file.uri, {
        onSuccess: (km) => {
          if (km == null) {
            show("Couldn't find the odometer in that photo. Type it in instead.");
            return;
          }
          onRead(km);
          show('Check the number against your dashboard.');
        },
        onError: (e) => show(e.message),
      });
    },
  };
}
