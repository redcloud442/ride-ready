import type { Propulsion, VehicleSummary } from "@ride-ready/core";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { z, type ZodType } from "zod";
import { db } from "../lib/db.ts";
import { garageOwnerIds } from "../lib/family.ts";
import { currentUser, requireAuth } from "./auth.ts";

// Plumbing for records that belong to one vehicle, served at /api/vehicles/:vehicleId/<feature>.
// Each feature module supplies its schemas and service; ownership, paging and status codes live here.

declare module "fastify" {
  interface FastifyRequest {
    vehicle: Pick<VehicleSummary, "id" | "propulsion"> | null;
  }
}

export const listQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  cursor: z.uuid().optional(), // nextCursor from the previous page
});
export type ListQuery = z.infer<typeof listQuerySchema>;

const scopeParamsSchema = z.object({ vehicleId: z.uuid() });
const recordParamsSchema = scopeParamsSchema.extend({ id: z.uuid() });
type RecordParams = z.infer<typeof recordParamsSchema>;

// findMany args for one page; one extra row tells whether another page exists.
export const pageArgs = ({ limit, cursor }: ListQuery) => ({
  take: limit + 1,
  ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
});

export function toPage<T extends { id: string }>(rows: T[], limit: number) {
  const items = rows.slice(0, limit);
  return { items, nextCursor: rows.length > limit ? items[items.length - 1].id : null };
}

// Services get a vehicleId the session user is already verified to access.
export type RecordService<Create, Update> = {
  list(vehicleId: string, query: ListQuery): Promise<unknown>;
  get(vehicleId: string, id: string): Promise<unknown>;
  create(vehicleId: string, input: Create): Promise<unknown>;
  update(vehicleId: string, id: string, input: Update): Promise<unknown>;
  remove(vehicleId: string, id: string): Promise<boolean>;
};

type RecordRoutesOptions<Create, Update> = {
  label: string;
  service: RecordService<Create, Update>;
  createSchema: ZodType<Create>;
  updateSchema: ZodType<Update>;
  // refuses records the vehicle can't have, e.g. fuel on an EV
  allowed?: { check: (propulsion: Propulsion) => boolean; error: string };
};

// preHandler: :vehicleId must be a live vehicle of the session user or of their family's owner
// (404 otherwise, so ids don't leak).
export async function requireVehicleAccess(req: FastifyRequest, reply: FastifyReply) {
  const { vehicleId } = req.params as { vehicleId: string };
  const vehicle = await db.vehicle.findFirst({
    where: { id: vehicleId, userId: { in: await garageOwnerIds(currentUser(req).id) }, deletedAt: null },
    select: { id: true, propulsion: true },
  });
  if (!vehicle) return reply.code(404).send({ error: "Vehicle not found" });
  req.vehicle = vehicle;
}

export function vehicleOf(req: FastifyRequest) {
  if (!req.vehicle) throw new Error("vehicleOf() used on a route without requireVehicleAccess");
  return req.vehicle;
}

export function recordRoutes<Create, Update>(options: RecordRoutesOptions<Create, Update>) {
  const { label, service, createSchema, updateSchema, allowed } = options;
  const notFound = (reply: FastifyReply) => reply.code(404).send({ error: `${label} not found` });

  return async (app: FastifyInstance) => {
    app.addHook("preHandler", requireAuth);
    app.addHook("preHandler", requireVehicleAccess);

    app.get<{ Querystring: ListQuery }>(
      "/",
      { schema: { params: scopeParamsSchema, querystring: listQuerySchema } },
      (req) => service.list(vehicleOf(req).id, req.query),
    );
    app.post<{ Body: Create }>(
      "/",
      { schema: { params: scopeParamsSchema, body: createSchema } },
      async (req, reply) => {
        const vehicle = vehicleOf(req);
        if (allowed && !allowed.check(vehicle.propulsion)) {
          return reply.code(422).send({ error: allowed.error });
        }
        return reply.code(201).send(await service.create(vehicle.id, req.body as Create));
      },
    );
    app.get<{ Params: RecordParams }>(
      "/:id",
      { schema: { params: recordParamsSchema } },
      async (req, reply) => (await service.get(vehicleOf(req).id, req.params.id)) ?? notFound(reply),
    );
    app.patch<{ Params: RecordParams; Body: Update }>(
      "/:id",
      { schema: { params: recordParamsSchema, body: updateSchema } },
      async (req, reply) =>
        (await service.update(vehicleOf(req).id, req.params.id, req.body as Update)) ?? notFound(reply),
    );
    // Soft delete: the tombstone lets offline clients sync the removal.
    app.delete<{ Params: RecordParams }>(
      "/:id",
      { schema: { params: recordParamsSchema } },
      async (req, reply) =>
        (await service.remove(vehicleOf(req).id, req.params.id)) ? reply.code(204).send() : notFound(reply),
    );
  };
}
