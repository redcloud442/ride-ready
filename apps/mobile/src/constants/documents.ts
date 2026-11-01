import type { DocumentKind } from '@ride-ready/core';

export const DOCUMENT_KIND_UI: Record<DocumentKind, { label: string; icon: string; expires: boolean }> = {
  receipt: { label: 'Receipt', icon: 'receipt-text-outline', expires: false },
  manual: { label: 'Manual', icon: 'book-open-variant', expires: false },
  warranty: { label: 'Warranty', icon: 'shield-check-outline', expires: true },
  insurance: { label: 'Insurance', icon: 'shield-car', expires: true },
  registration: { label: 'Registration', icon: 'card-account-details-outline', expires: true },
  photo: { label: 'Photo', icon: 'image-outline', expires: false },
};

// Photos the phone can read on-device (lib/ocr.ts); PDFs aren't read.
export const READABLE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
