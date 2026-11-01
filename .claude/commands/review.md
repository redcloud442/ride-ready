---
description: Review the current working diff against repo conventions
---

1. Run `git status`, `git diff`, and `git diff --staged` to get the actual change set.
2. Read `.claude/rules/*.md`.
3. Apply the checklist in `.claude/agents/code-reviewer.md`.
4. If the diff touches `apps/api/src/`, `apps/api/prisma/`, `apps/mobile/src/lib/auth-client.ts`,
   trips/GPS, uploads, or any `.env.example`, also apply `.claude/agents/security-auditor.md`.
5. Run `pnpm typecheck`, `pnpm test`, `pnpm lint`.
6. Verify each finding against the file. Drop what you cannot reproduce.
7. Report severity-ordered `path:line — problem — fix`, quote the verification
   result, and give a verdict. Fix nothing unless asked.

$ARGUMENTS
