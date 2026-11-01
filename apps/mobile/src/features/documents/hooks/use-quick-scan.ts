import type { VehicleSummary } from '@ride-ready/core';

import { useUploadDocument } from '@/hooks/use-documents';
import { canReadText } from '@/lib/ocr';
import { useToastStore } from '@/stores/toast.store';

import { usePickFile } from '@/hooks/use-pick-file';
import { useScanReceipt } from './use-scan-receipt';

// One tap from Home or the quick-add sheet: photo → saved as a receipt document → read → prefilled log form to confirm.
export function useQuickScan(vehicle: VehicleSummary | undefined) {
  const pick = usePickFile();
  const upload = useUploadDocument();
  const scanner = useScanReceipt(vehicle);
  const show = useToastStore((s) => s.show);

  return {
    busy: upload.isPending || scanner.scanning,
    stage: upload.isPending ? 'Saving photo…' : scanner.scanning ? 'Reading receipt…' : null,
    /** `replace`: swap the current screen (e.g. the quick-add sheet) for the prefilled form */
    async scan(source: 'camera' | 'library' = 'camera', { replace = false } = {}) {
      if (!vehicle) {
        show('Add a vehicle first.');
        return;
      }
      // before the camera opens: in Expo Go the photo would upload and then fail to read
      if (!canReadText()) {
        show('Scanning needs the RideReady development build. Use + to type it in for now.');
        return;
      }
      const file = await (source === 'camera' ? pick.fromImage('camera') : pick.fromImage('library'));
      if (!file) return;
      upload.mutate(
        { vehicleId: vehicle.id, file, meta: { kind: 'receipt', title: null, expiresAt: null } },
        {
          // if reading fails the photo stays under the vehicle's Documents
          onSuccess: (doc) => scanner.scan(doc.id, { uri: file.uri, replace }),
          onError: (e) => show(e.message),
        },
      );
    },
  };
}
