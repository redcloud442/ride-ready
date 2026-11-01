# API (apps/api)

Fastify 5 modular monolith. Double quotes in this package.

## Layout

```
src/
  server.ts            entry: buildApp() + listen
  app.ts               builds Fastify: security plugins, then each module with its prefix
  config/env.ts        the only place that reads process.env (fails fast on missing vars)
  lib/db.ts            Prisma client     lib/auth.ts  Better Auth instance
  lib/schemas.ts       shared zod fields (currency, money, odometerKm, pastDate, text)
  lib/storage.ts       private S3/MinIO: ensureBucket, presigned upload/download URLs, deleteObjects
  lib/family.ts        garageOwnerIds(userId): own id + owners of every family the user is in
  plugins/security.ts  helmet, cors (CORS_ORIGINS), rate-limit
  plugins/auth.ts      /api/auth/* handler, requireAuth preHandler, currentUser(req)
  plugins/vehicle-records.ts  recordRoutes() for /api/vehicles/:vehicleId/<feature>, requireVehicleAccess,
                       vehicleOf(req), listQuerySchema + pageArgs/toPage cursor paging
  modules/<feature>/
    <feature>.routes.ts      paths + schemas + hooks only; registered in app.ts with a prefix
    <feature>.controller.ts  req/reply in, calls service, shapes the HTTP response (status codes)
    <feature>.service.ts     business logic + Prisma; no Fastify types
    <feature>.schema.ts      zod schemas for bodies/params + `z.infer` input types
```

- New feature = new `modules/<feature>/` folder with those four files, registered in `app.ts`.
- A record that belongs to a vehicle (fuel, trips, documents, ...) skips the controller: its routes file
  is `recordRoutes({ label, service, createSchema, updateSchema, allowed? })`, which adds auth, the
  vehicle-access check (owner or family member; 404 otherwise), list/get/create/patch/soft-delete and
  status codes. Its service gets an already-verified `vehicleId` and filters `deletedAt: null`.
- Services take the user id (or verified vehicle id) as an argument; they never read the request.
- Shared domain values/types come from `@ride-ready/core` (e.g. `VEHICLE_TYPES`, `VehicleSummary`).
- Decimal columns serialize as strings (`DecimalString` in core); stats arithmetic happens in core
  (`vehicleStats`), never in services.
- No server-side AI model. Insight text is core `describeStats`; receipts and odometer photos are read
  on the phone (on-device OCR + core `readReceiptText`), so the API only stores files.
- `receiptId` on fuel/charging must be a live `receipt` document of the same vehicle (422 otherwise).
- Services signal client errors with `httpError(status, message)` from `lib/errors.ts`.

## Auth

- Better Auth handles `/api/auth/*` in its own scope with body parsing disabled — it reads the raw
  body. Don't add JSON parsers to that scope. The reply is hijacked, so headers set by hooks are copied
  to the raw response there.
- Protected modules add `app.addHook("preHandler", requireAuth)`; handlers get the user with
  `currentUser(req)`.
- Every query on user data is scoped by the session user (`userId`, or through `vehicle.userId`).
  Never trust a `userId`/`vehicleId` from the client alone.
- Custom user fields go in `user.additionalFields` (`lib/auth.ts`) with `input: false` unless the
  client may set them, and are mirrored in the mobile `inferAdditionalFields`.
- Google sign-in turns on only when `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` are set.
- Profile = Better Auth endpoints: `/update-user` (name, `preferences` validated by `preferencesSchema`;
  `image` is refused), `/change-email` (unverified emails only until an email sender exists),
  `/change-password`, `/delete-user` (`beforeDelete` removes stored files and the user's own family;
  rows go by `onDelete: Cascade`). The photo is `modules/profile` (`/api/profile/avatar`): `User.image`
  holds a private `avatars/<userId>/…` key, or Google's picture URL.
- Family sharing = Better Auth `organization` plugin. One owned family per user; invites are always
  role `member` (hook refuses others, role changes are blocked) and only the invited email can accept.
  A member sees and edits the owner's whole garage (records, trips, documents) through
  `garageOwnerIds`; vehicle edit/delete stays owner-only (`VehicleSummary.shared`).

## Validation and security

- Every body/params has a zod schema in `<feature>.schema.ts` (unknown keys stripped), passed as route `schema.body`/`params`
  (validator compiler in `app.ts` runs it before the handler; invalid → 400, handler gets the parsed value).
- helmet + rate-limit (100/min/IP, in-memory) apply globally. CORS is off unless `CORS_ORIGINS` lists
  browser origins; native apps don't need it.

## Database (Prisma 7)

- Schema is split per feature in `prisma/schema/*.prisma` (generator + datasource in `main.prisma`),
  config `prisma.config.ts` (loads `.env` itself).
- Workflow: edit schema → `pnpm --filter api db:migrate --name <change>` (generate + migrate dev).
  Never `db push`, never edit migration SQL or `src/generated/` by hand.
- Better Auth owns `User`, `Session`, `Account`, `Verification` (tables named like every other: `@@map("<Model>")`, PascalCase; `auth:generate` writes lowercase maps, put them back). After changing
  auth plugins run `pnpm --filter api auth:generate`, then `db:migrate`. Extra `User` fields are ours
  (`preferences`, `onboardedAt`, `vehicles`).
- Synced user records carry `createdAt`, `updatedAt`, `deletedAt` (tombstone for offline sync — soft
  delete only) and an index on `(vehicleId, <event time>)`.
- Fuel (`FuelTransaction`) and charging (`ChargingSession`) stay separate models.

## Infra

Postgres/Redis/MinIO from `docker-compose.yml`; connection values in `apps/api/.env.example`.
Redis is for BullMQ jobs, MinIO for private receipt/document storage (store keys, never public URLs).
