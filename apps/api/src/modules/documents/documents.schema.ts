import { z } from "zod";
import { optionalText } from "../../lib/schemas.ts";

export const DOCUMENT_KINDS = ["manual", "receipt", "warranty", "insurance", "registration", "photo"] as const;
const MIME_TYPES = ["image/jpeg", "image/png", "image/heic", "image/webp", "application/pdf"] as const;
const MAX_BYTES = 20 * 1024 * 1024;

const fields = {
  kind: z.enum(DOCUMENT_KINDS),
  title: optionalText(120),
  expiresAt: z.coerce.date().nullable().optional(), // warranty/insurance/registration end
};

// The file itself goes straight to storage with the returned upload URL; the API never handles its bytes.
export const createDocumentSchema = z.object({
  ...fields,
  mimeType: z.enum(MIME_TYPES),
  sizeBytes: z.int().positive().max(MAX_BYTES),
});

export const updateDocumentSchema = z.object(fields).partial();

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;
