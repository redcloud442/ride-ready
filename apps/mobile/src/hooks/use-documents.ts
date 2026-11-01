import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as WebBrowser from 'expo-web-browser';

import { documentsApi, type CreateDocumentInput, type LocalFile } from '@/api/documents.api';
import { queryKeys } from '@/api/query-keys';

export function useDocuments(vehicleId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.documents(vehicleId),
    queryFn: () => documentsApi.list(vehicleId!),
    enabled: !!vehicleId,
    select: (page) => page.items,
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ vehicleId, file, meta }: { vehicleId: string; file: LocalFile; meta: Pick<CreateDocumentInput, 'kind' | 'title' | 'expiresAt'> }) =>
      documentsApi.upload(vehicleId, file, meta),
    onSuccess: (_doc, { vehicleId }) => queryClient.invalidateQueries({ queryKey: queryKeys.documents(vehicleId) }),
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ vehicleId, id }: { vehicleId: string; id: string }) => documentsApi.remove(vehicleId, id),
    onSuccess: (_void, { vehicleId }) => queryClient.invalidateQueries({ queryKey: queryKeys.documents(vehicleId) }),
  });
}

// Fetches a fresh short-lived URL and opens the file in the in-app browser (images and PDFs render there).
export function useOpenDocument() {
  return useMutation({
    mutationFn: async ({ vehicleId, id }: { vehicleId: string; id: string }) => {
      const doc = await documentsApi.get(vehicleId, id);
      await WebBrowser.openBrowserAsync(doc.downloadUrl);
    },
  });
}
