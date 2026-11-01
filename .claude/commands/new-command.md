---
description: Create or update a /slash command in .claude/commands from a described workflow
argument-hint: <command-name> <what it should do>
---

Create (or update, if it exists) the slash command described in `$ARGUMENTS`.

1. Parse the name: kebab-case, no leading slash. The file is
   `.claude/commands/<name>.md` and the command becomes `/<name>`. If a file
   with that name exists, read it and update it instead of overwriting blindly.
2. Ground it in the repo before writing. Read `CLAUDE.md`, the relevant
   `.claude/rules/*.md`, and the actual files/scripts the workflow touches.
   Every path, script and command you write must exist (check with Glob/Grep
   or `package.json`). Do not invent scripts — the repo has only:
   root `mobile`, `api`, `typecheck`, `lint`, `test`; `apps/mobile` `start`, `android`, `ios`,
   `lint`, `typecheck`; `apps/api` `dev`, `typecheck`, `db:generate`, `db:migrate`, `auth:generate`;
   `packages/core` `typecheck`, `test`.
3. Write the file in this shape:

   ```markdown
   ---
   description: <one line, says what it does — shown in the / menu>
   argument-hint: <optional, what to type after the command>
   ---

   <one sentence: what to do with `$ARGUMENTS`>

   1. Read <the rules files that apply> — point at them, don't restate them.
   2. <numbered, concrete steps with real paths>
   3. Verify: `pnpm typecheck` / `pnpm test` / `pnpm lint` (or the narrower check that fits).
   4. Report: <fixed output shape>.

   $ARGUMENTS
   ```

   - `$ARGUMENTS` interpolates everything typed after the command. Use it
     once in the opening sentence; keep a trailing `$ARGUMENTS` line only for
     review-style commands where extra free-form instructions make sense.
   - Use `$1`, `$2` only if the command needs positional args.
   - Add `allowed-tools:` in frontmatter only if the command must be limited
     (e.g. read-only reviews: `allowed-tools: Read, Grep, Glob, Bash(git diff:*)`).
   - If a step needs a specialised checklist, reference
     `.claude/agents/<agent>.md` rather than copying it.
   - Never include steps that push, release (`eas submit`/`eas update`), reset the database, or touch
     `.env*` — the hook in `.claude/hooks/validate-bash.sh` blocks them anyway.
4. Keep it short: a command is a procedure, not documentation. Under ~40 lines.
5. Add the command to the "Commands" list in `CLAUDE.md` only if it is a
   daily workflow; otherwise leave CLAUDE.md alone.
6. Report the file path, the final content, and tell the user to type
   `/<name>` to try it (new commands are picked up without restart; if it
   does not appear, restart the session).
