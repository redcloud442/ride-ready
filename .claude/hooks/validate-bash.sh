#!/usr/bin/env bash
# PreToolUse guard: blocks pushes, store/OTA releases and destructive shell commands.
# Exit 2 blocks the call and returns stderr to Claude. Exit 0 allows.

input=$(cat)

# Extract the command string from the hook payload without requiring jq.
cmd=$(printf '%s' "$input" | sed -n 's/.*"command"[[:space:]]*:[[:space:]]*"\(.*\)".*/\1/p' | head -1)
[ -z "$cmd" ] && exit 0

# The greedy capture runs into later JSON fields; cut at the next key.
cmd=${cmd%%\",\"*}
# Match the first command line only; heredoc bodies and file content must not trip the guards.
esc_nl='\n'
cmd=${cmd%%"$esc_nl"*}

block() {
  echo "BLOCKED by .claude/hooks/validate-bash.sh: $1" >&2
  echo "Ask the user for explicit permission; they can run it themselves with the ! prefix." >&2
  exit 2
}

# --- core guards: keep in every repo -------------------------------------
case "$cmd" in
  *"git push --force"*|*"git push -f"*|*"push --force-with-lease"*)
    block "force push." ;;
  *"git push"*)
    block "push. Repo rule: never push." ;;
  *"git reset --hard"*|*"git clean -fd"*|*"git checkout -- "*)
    block "destructive git operation that discards uncommitted work." ;;
  *"rm -rf /"*|*"rm -rf ~"*|*"rm -fr /"*|*"rm -rf src"*|*"rm -rf apps"*|*"rm -rf packages"*)
    block "recursive delete of a root, home or source path." ;;
  *"Remove-Item"*"-Recurse"*"src"*|*"Remove-Item"*"-Recurse"*"apps"*|*"Remove-Item"*"-Recurse"*"packages"*)
    block "recursive delete of a source path." ;;
esac

# --- stack-specific guards ---------------------------------------------------
case "$cmd" in
  # app store / OTA releases reach real users
  *"eas submit"*|*"eas update"*|*"eas build"*"production"*|*"eas-cli"*" submit"*|*"eas-cli"*" update"*|*"eas-cli"*" build"*"production"*)
    block "EAS store submit, OTA update or production build." ;;
  # databases
  *"prisma migrate deploy"*|*"prisma migrate reset"*|*"prisma db push"*)
    block "schema push / migration reset against a database. Use db:migrate (migrate dev)." ;;
  *"DROP TABLE"*|*"DROP DATABASE"*|*"TRUNCATE "*)
    block "destructive SQL." ;;
  # docker volumes hold the local database, redis and uploaded files
  *"docker compose down"*"-v"*|*"docker-compose down"*"-v"*|*"docker volume rm"*|*"docker volume prune"*|*"docker system prune"*)
    block "deletes docker volumes (local Postgres/Redis/MinIO data)." ;;
esac

exit 0
