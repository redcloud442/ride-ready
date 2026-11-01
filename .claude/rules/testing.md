# Testing

- Only `packages/core` has tests: Node's built-in runner, `*.test.ts` next to the code,
  `node:test` + `node:assert/strict`. No Jest/Vitest. Run `pnpm test`.
- Every calculation in core gets a test, including the "not enough data → null" case.
- Done means: `pnpm typecheck`, `pnpm test` and `pnpm lint` pass. For mobile dependency changes also
  `npx expo-doctor` in `apps/mobile`.
- API changes: start infra (`docker compose up -d`) and hit the endpoint with curl. Auth endpoints need
  `-H 'origin: rideready://'`. Delete any test users you create.
