import { fromNodeHeaders, toNodeHandler } from "better-auth/node";
import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { auth, type SessionUser } from "../lib/auth.ts";

declare module "fastify" {
  interface FastifyRequest {
    user: SessionUser | null;
  }
}

const authHandler = toNodeHandler(auth);

// Mounts Better Auth at /api/auth/*.
export async function authRoutes(scope: FastifyInstance) {
  // Better Auth reads the raw request body itself, so Fastify must not consume it in this scope.
  scope.removeAllContentTypeParsers();
  scope.addContentTypeParser("*", (_req, _payload, done) => done(null));
  scope.all("/api/auth/*", async (req, reply) => {
    // hijack bypasses Fastify's reply, so copy headers set by hooks (helmet, cors) onto the raw response
    for (const [key, value] of Object.entries(reply.getHeaders())) {
      if (value !== undefined) reply.raw.setHeader(key, value);
    }
    reply.hijack();
    try {
      await authHandler(req.raw, reply.raw);
    } catch (err) {
      // hijacked: Fastify won't answer for us, so close the request instead of hanging it
      req.log.error(err);
      if (!reply.raw.headersSent) reply.raw.statusCode = 500;
      reply.raw.end();
    }
  });
}

// preHandler for protected routes: sets req.user or answers 401.
export async function requireAuth(req: FastifyRequest, reply: FastifyReply) {
  const session = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
  if (!session) return reply.code(401).send({ error: "Unauthorized" });
  req.user = session.user;
}

// Narrows req.user inside handlers that run after requireAuth.
export function currentUser(req: FastifyRequest): SessionUser {
  if (!req.user) throw new Error("currentUser() used on a route without requireAuth");
  return req.user;
}
