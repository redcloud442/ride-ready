import { create } from 'zustand';

import type { RecordKind } from '@/api/records.api';

// Prefill handed from "Scan receipt" to a log form. Consumed once, cleared when the form closes.
export type LogDraft = {
  kind: RecordKind;
  /** receipt: read from a photo on the phone, user must check; quick: carried over from the quick-add sheet */
  source: 'receipt' | 'quick';
  values: Record<string, unknown>;
  receiptId?: string;
  /** fields the reader flagged as not clearly legible */
  unclear?: string[];
};

type LogDraftState = {
  draft: LogDraft | null;
  setDraft: (draft: LogDraft) => void;
  clear: () => void;
};

export const useLogDraftStore = create<LogDraftState>((set) => ({
  draft: null,
  setDraft: (draft) => set({ draft }),
  clear: () => set({ draft: null }),
}));
