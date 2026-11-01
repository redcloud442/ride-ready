# RideReady

Vehicle ownership app: garage, fuel/charging logs, trips, maintenance, costs, AI insights.
Cars + motorcycles; gasoline, diesel, hybrid, PHEV, EV. Mobile only (iOS/Android), no web.
Product plan: `docs/RideReady_Product_Plan.docx` (§ references in code point at it).
Brand: `docs/brand-guidelines.md` (violet-gray primary, teal secondary, Plus Jakarta Sans).

## Layout (pnpm workspaces, hoisted node_modules)

- `apps/mobile` — Expo SDK 58, Expo Router (`src/app/`), React Native Paper (MD3), Better Auth client, zod forms
- `apps/api` — Fastify 5 feature modules (routes/controller/service/schema) + Better Auth + Prisma 7, helmet/cors/rate-limit
- `packages/core` — shared domain types and calculations, pure TS, no deps
- `docker-compose.yml` — Postgres (PostGIS) 5432, Redis 6379, MinIO 9000/9001

## Commands (repo root)

```bash
docker compose up -d          # infra
pnpm api                      # API on :3000 (apps/api/.env from .env.example)
pnpm mobile                   # Expo dev server
pnpm typecheck                # all workspaces
pnpm test                     # packages/core node:test
pnpm lint                     # expo lint
pnpm --filter api db:migrate --name <change>  # generate + migrate dev
```

## Principles (from the plan — non-negotiable)

- Accuracy over impressive numbers: missing data → `null`/"unavailable", never a guess. Label metrics
  `measured | calculated | estimated` (`MetricQuality` in core).
- Calculations live in `packages/core` as application logic; AI only explains results.
- Fuel and charging stay separate records; PHEVs have both. Charging kWh purchased ≠ kWh consumed.
- GPS distance never overwrites odometer readings; flag discrepancies.
- Privacy: location history, receipts and documents are private per user. Never log them.

## Version control

Never push, never deploy, never `eas submit`/`eas update`. Commit only when asked, on a branch.

## Restrictions

- Never read or print `.env*` (use `.env.example`). Never edit `apps/api/src/generated/` or
  `apps/api/prisma/migrations/*` by hand. No `ios/`/`android/` folders (CNG).

## Rules

@.claude/rules/code-style.md
@.claude/rules/mobile.md
@.claude/rules/api.md
@.claude/rules/testing.md
@apps/mobile/AGENTS.md
