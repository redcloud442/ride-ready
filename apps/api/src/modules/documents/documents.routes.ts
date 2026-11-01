import { recordRoutes } from "../../plugins/vehicle-records.ts";
import { createDocumentSchema, updateDocumentSchema } from "./documents.schema.ts";
import { documentsService } from "./documents.service.ts";

// Receipts and photos are read on the phone (on-device OCR); the API only stores the file.
export const documentsRoutes = recordRoutes({
  label: "Document",
  service: documentsService,
  createSchema: createDocumentSchema,
  updateSchema: updateDocumentSchema,
});
