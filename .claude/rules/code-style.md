# Code style

- TypeScript strict everywhere. Single quotes, 2-space indent, trailing commas (match existing files).
- Kebab-case filenames (`auth-client.ts`, `placeholder.tsx`); Expo Router route files follow route names.
- `packages/core` and `apps/api` run TS directly (Node type stripping / tsx): relative imports use the
  `.ts` extension, and only erasable syntax (`erasableSyntaxOnly`) — no `enum`, no `namespace`.
  Use `as const` arrays + derived union types like `PROPULSIONS` / `Propulsion` in core.
- Shared domain types and any calculation used by more than one app go in `packages/core/src/index.ts`,
  imported as `@ride-ready/core`. Don't duplicate them in mobile or api.
- Money and quantities: `Decimal` in Prisma. Every amount carries a `currency` (ISO 4217, `Char(3)`).
- Comments explain *why* only. A known limitation gets `// shortcut: <limit>, <when to upgrade>`.
