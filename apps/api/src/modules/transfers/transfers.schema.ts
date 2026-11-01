import { z } from "zod";

export const createTransferSchema = z.object({
  vehicleId: z.uuid(),
  // receipts can show the seller's name, address or card digits, so the seller may keep them out
  includeReceipts: z.boolean().default(true),
  // what the seller paid (fill-ups, charges, expenses, service costs); receipts show it too
  includeCosts: z.boolean().default(true),
});

export const transferParamsSchema = z.object({ id: z.uuid() });

export type CreateTransferInput = z.infer<typeof createTransferSchema>;
export type TransferParams = z.infer<typeof transferParamsSchema>;
