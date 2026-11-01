import type { FastifyReply, FastifyRequest } from "fastify";
import { currentUser } from "../../plugins/auth.ts";
import type { CreateTransferInput, TransferParams } from "./transfers.schema.ts";
import { transfersService } from "./transfers.service.ts";

// Same answer for unknown, expired and used codes: a scanned code reveals nothing either way.
const notFound = (reply: FastifyReply) =>
  reply.code(404).send({ error: "This transfer code has expired or was already used." });

export const transfersController = {
  async create(req: FastifyRequest<{ Body: CreateTransferInput }>, reply: FastifyReply) {
    const transfer = await transfersService.create(currentUser(req).id, req.body);
    if (!transfer) return reply.code(404).send({ error: "Vehicle not found" });
    return reply.code(201).send(transfer);
  },

  async get(req: FastifyRequest<{ Params: TransferParams }>, reply: FastifyReply) {
    const transfer = await transfersService.preview(currentUser(req).id, req.params.id);
    return transfer ?? notFound(reply);
  },

  accept(req: FastifyRequest<{ Params: TransferParams }>) {
    return transfersService.accept(currentUser(req).id, req.params.id);
  },

  // What the QR code opens in any camera app: Android cameras often ignore custom schemes, an https link
  // always works. Hands over to the app without reading the transfer, so it reveals nothing.
  linkPage(req: FastifyRequest<{ Params: TransferParams }>, reply: FastifyReply) {
    const { id } = req.params; // validated uuid, safe in HTML
    const inApp = `rideready://transfer/${id}`;
    // Chrome opens the app from an intent link, or its Play Store page when missing (package = app.json android.package)
    const open = /android/i.test(req.headers["user-agent"] ?? "")
      ? `intent://transfer/${id}#Intent;scheme=rideready;package=com.rideready.app;end`
      : inApp;
    return reply
      .type("text/html; charset=utf-8")
      .header("cache-control", "no-store")
      .header("referrer-policy", "no-referrer")
      .send(`<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" />
<meta http-equiv="refresh" content="0;url=${inApp}" /><title>Vehicle transfer · RideReady</title>
<style>body{font-family:system-ui,sans-serif;max-width:420px;margin:15vh auto;padding:0 20px;text-align:center}
a{display:block;margin:24px 0;padding:14px;border-radius:12px;background:#5B4F86;color:#FFFFFF;text-decoration:none;font-weight:600}</style></head>
<body><h1>Vehicle transfer</h1><p>Open RideReady to take over this vehicle and its history.</p>
<a href="${open}">Open in RideReady</a>
<p>No app yet? Install RideReady, sign in, then scan the code again under Garage.</p></body></html>`);
  },

  async cancel(req: FastifyRequest<{ Params: TransferParams }>, reply: FastifyReply) {
    const done = await transfersService.cancel(currentUser(req).id, req.params.id);
    return done ? reply.code(204).send() : notFound(reply);
  },
};
