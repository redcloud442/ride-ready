import type { VehicleSummary } from '@ride-ready/core';
import { useMutation } from '@tanstack/react-query';
import { router } from 'expo-router';

import { documentsApi } from '@/api/documents.api';
import { routes } from '@/constants/routes';
import { readReceiptImage, readRemoteImage } from '@/lib/ocr';
import { useLogDraftStore } from '@/stores/log-draft.store';
import { useToastStore } from '@/stores/toast.store';

import { draftFromExtraction } from '../utils/draft-from-extraction';

type ScanInput = { vehicleId: string; id: string; uri?: string };

// Reads a receipt/photo on the phone and opens the matching log form prefilled. Nothing is saved
// until the user confirms the form.
export function useScanReceipt(vehicle: VehicleSummary | undefined) {
  const read = useMutation({
    // a just-picked photo is read from its local uri; a stored document is downloaded first
    mutationFn: async ({ vehicleId, id, uri }: ScanInput) =>
      uri ? readReceiptImage(uri) : readRemoteImage((await documentsApi.get(vehicleId, id)).downloadUrl),
  });
  const setDraft = useLogDraftStore((s) => s.setDraft);
  const show = useToastStore((s) => s.show);

  return {
    scanning: read.isPending,
    scanningId: read.isPending ? read.variables?.id : undefined,
    /** `uri`: the local photo, when there is one. `replace`: swap the current screen for the log form */
    scan(documentId: string, { uri, replace = false }: { uri?: string; replace?: boolean } = {}) {
      if (!vehicle) return;
      read.mutate(
        { vehicleId: vehicle.id, id: documentId, uri },
        {
          onSuccess: (result) => {
            const draft = draftFromExtraction({ ...result, documentId }, vehicle.propulsion);
            if (!draft) {
              show("Couldn't find fuel, charging, service or odometer details in this photo.");
              return;
            }
            setDraft({ kind: draft.kind, source: 'receipt', values: draft.values, unclear: draft.unclear, receiptId: documentId });
            const href = routes.logFor(draft.screen, vehicle.id);
            if (replace) router.replace(href);
            else router.push(href);
          },
          onError: (e) => show(e.message),
        },
      );
    },
  };
}
