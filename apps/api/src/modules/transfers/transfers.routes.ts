import type { FastifyInstance } from "fastify";
import { requireAuth } from "../../plugins/auth.ts";
import { transfersController } from "./transfers.controller.ts";
import {
  createTransferSchema,
  transferParamsSchema,
  type CreateTransferInput,
  type TransferParams,
} from "./transfers.schema.ts";

export async function transfersRoutes(app: FastifyInstance) {
  app.addHook("preHandler", requireAuth);

  app.post<{ Body: CreateTransferInput }>("/", { schema: { body: createTransferSchema } }, transfersController.create);
  app.get<{ Params: TransferParams }>("/:id", { schema: { params: transferParamsSchema } }, transfersController.get);
  app.post<{ Params: TransferParams }>(
    "/:id/accept",
    { schema: { params: transferParamsSchema } },
    transfersController.accept,
  );
  app.delete<{ Params: TransferParams }>("/:id", { schema: { params: transferParamsSchema } }, transfersController.cancel);
}

// Public, no auth: the https page a transfer QR code opens in any camera app (see linkPage).
export async function transferLinkRoutes(app: FastifyInstance) {
  app.get<{ Params: TransferParams }>("/:id", { schema: { params: transferParamsSchema } }, transfersController.linkPage);
}
