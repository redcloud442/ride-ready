import type {
  CreatedDocument,
  DocumentKind,
  DocumentMimeType,
  Page,
  VehicleDocument,
  VehicleDocumentWithUrl,
} from '@ride-ready/core';

import { ApiError, request } from './client';

export type CreateDocumentInput = {
  kind: DocumentKind;
  title?: string | null;
  expiresAt?: string | null;
  mimeType: DocumentMimeType;
  sizeBytes: number;
};

export type LocalFile = { uri: string; mimeType: DocumentMimeType; sizeBytes: number };

const base = (vehicleId: string) => `/api/vehicles/${vehicleId}/documents`;

export const documentsApi = {
  list: (vehicleId: string) => request<Page<VehicleDocument>>(`${base(vehicleId)}?limit=100`),
  /** includes a 5-minute download URL */
  get: (vehicleId: string, id: string) => request<VehicleDocumentWithUrl>(`${base(vehicleId)}/${id}`),
  update: (vehicleId: string, id: string, input: Partial<Pick<CreateDocumentInput, 'kind' | 'title' | 'expiresAt'>>) =>
    request<VehicleDocument>(`${base(vehicleId)}/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),
  remove: (vehicleId: string, id: string) => request<void>(`${base(vehicleId)}/${id}`, { method: 'DELETE' }),

  /** Creates the record, then PUTs the file straight to private storage with the signed URL. */
  async upload(vehicleId: string, file: LocalFile, meta: Pick<CreateDocumentInput, 'kind' | 'title' | 'expiresAt'>) {
    // The URL is signed for an exact size, so declare the bytes we actually send: the picker's
    // fileSize can describe the original photo, not the compressed copy at `uri` (storage then answers 403).
    const body = await (await fetch(file.uri)).blob();
    const doc = await request<CreatedDocument>(base(vehicleId), {
      method: 'POST',
      body: JSON.stringify({ ...meta, mimeType: file.mimeType, sizeBytes: body.size }),
    });
    const res = await fetch(doc.upload.url, { method: doc.upload.method, headers: doc.upload.headers, body });
    if (!res.ok) {
      // don't leave a record pointing at nothing
      await documentsApi.remove(vehicleId, doc.id).catch(() => undefined);
      throw new ApiError(res.status, `Upload failed (${res.status}). Check your connection and try again.`);
    }
    const { upload: _signed, ...saved } = doc;
    return saved as VehicleDocument;
  },
};
