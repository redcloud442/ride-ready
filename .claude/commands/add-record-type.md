---
description: Add or extend a synced vehicle record type (Prisma model + migration + shared core types)
argument-hint: <record name and fields, e.g. "TirePressureReading: psi per wheel, measuredAt">
---

Add the record type described in `$ARGUMENTS`, end to end.

1. Read `.claude/rules/api.md` and `.claude/rules/code-style.md`, and the plan's §6 data model in
   `docs/RideReady_Product_Plan.docx` if the record is from the plan.
2. `apps/api/prisma/schema/<feature>.prisma`: add the model in its feature file (new feature → new file). Copy the shape of
   `FuelTransaction`: `vehicleId` relation, event time, `createdAt`/`updatedAt`/`deletedAt`,
   `@@index([vehicleId, <event time>])`, `Decimal` + `currency Char(3)` for money. Add the back-relation
   on `Vehicle`. Ask before making a field required on an existing model with data.
3. `pnpm --filter api db:migrate` — name the migration after the change. Never edit the SQL by hand.
4. If the mobile app or a calculation needs the shape or its allowed values, add `as const` arrays /
   types to `packages/core/src/index.ts` (no enums), and tests for any new calculation.
5. Verify: `pnpm typecheck`, `pnpm test`; confirm the table exists with
   `docker compose exec -T postgres psql -U postgres -d ride_ready -c '\d "<Model>"'`.
6. Report: model diff, migration folder name, core additions, verification output.
