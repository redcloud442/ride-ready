---
description: Fix a described bug or GitHub issue end to end, with a root cause and verification
argument-hint: <issue number, URL, or description>
---

Fix the issue in `$ARGUMENTS`.

1. If it's an issue number or URL, read it with `gh issue view`. Restate the
   expected vs actual behaviour in one line.
2. Read `CLAUDE.md` and the `.claude/rules/*.md` that cover the affected area.
3. Reproduce it or locate it. Find the root cause and cite `path:line`. Don't
   patch symptoms.
4. Make the smallest fix that matches the surrounding code. No drive-by
   refactors. If the bug is in a calculation, fix it in `packages/core` and add a failing test first.
5. Verify with `pnpm typecheck`, `pnpm test`, `pnpm lint`; for API bugs also curl the endpoint
   against `docker compose up -d` infra; for UI bugs check it in the running app (`pnpm mobile`).
6. Apply the `.claude/agents/code-reviewer.md` checklist to your own diff.
7. Report the root cause, the files changed, the verification output, and
   anything left open. Don't commit unless asked.
