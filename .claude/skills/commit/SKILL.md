---
name: commit
description: Create a local conventional commit for WorkshopHub, prefixed with the Jira card (e.g. LATC-2) taken from the branch name. Refuses on main, shows status and a diff summary, confirms the message with the user, stages relevant files, commits, and stops without pushing. Use when the user asks to commit their changes or runs /commit.
---

# Commit (WorkshopHub)

Create one local commit for the current changes. Follow these steps in order. Stop as soon as a step says to stop.

## Hard rules

- **Never commit on `main`.** If the current branch is `main`, refuse and stop.
- **Never use `--no-verify`** (or `-n`), `--no-gpg-sign`, or any other flag that skips hooks. If a hook (e.g. Husky in `.husky/`) fails, show the output, fix the cause or ask the user, then create a **new** commit attempt. Do not `--amend` to work around a failed hook.
- **Never commit secrets.** Do not stage `.env`, `.env.*` (except `.env.example`), `*.pem`, `*.key`, `*.p12`, credential/token files, `api/database/*.sqlite*`, or `database/*.sqlite*`. If a staged or changed file contains something that looks like a secret (API keys, tokens, passwords, private keys, connection strings with credentials), stop and tell the user instead of committing it.
- **Never push.** Do not run `git push` or open a PR. The skill ends after `git commit`.
- Do not change git config, and do not use `git add -A` / `git add .` blindly.

## Step 1 — Check the branch

```bash
git branch --show-current
```

- If the output is `main`, reply: "Refusing to commit: you're on `main`. Create or switch to a feature branch first (e.g. `git switch -c LATC-123-short-description`)." Then **stop**.
- If the output is empty (detached HEAD), tell the user and stop.

## Step 2 — Find the Jira card

Extract the Jira key from the branch name with the pattern `[A-Z][A-Z0-9]+-[0-9]+` (case-insensitive, then uppercase it). Examples:

| Branch | Jira key |
|---|---|
| `LATC-2-add-booking-cancel` | `LATC-2` |
| `feature/latc-14-waitlist` | `LATC-14` |
| `fix-typo` | _(none)_ |

If no key is found, **ask the user** for the Jira card number (e.g. `LATC-2`). Do not invent one. If the user says there is no card, ask whether to commit without a prefix before continuing.

## Step 3 — Show what changed

Run and show the user:

```bash
git status --short
git diff --stat
git diff --cached --stat
```

Then give a short summary (a few bullets) of what the changes do, based on reading the actual diff (`git diff` and `git diff --cached`). If there are no changes at all, say "Nothing to commit" and stop.

## Step 4 — Decide what to stage

- If files are already staged, commit only those unless the user says otherwise.
- If nothing is staged, propose the list of files that belong together for this change (exclude secrets, generated output like `dist/`, `build/`, `api/generated/`, stray `.DS_Store`, and unrelated edits). Mention any untracked or changed files you are leaving out and why.
- If the changes clearly cover unrelated concerns, suggest splitting them into separate commits.

## Step 5 — Suggest the commit message and confirm

Format: `<JIRA-KEY> <type>(<optional scope>): <summary>`

- `type`: one of `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `ci`, `build`, `perf`, `style`.
- `scope`: optional; use the area touched, e.g. `api`, `app`, `prisma`, `ci`, or a feature like `training-sessions`.
- `summary`: imperative mood, lower case, no trailing period, ≤ 72 characters for the whole first line.
- Add a short body (wrapped at ~72 chars) only when the "why" isn't obvious from the subject.

Example:

```
LATC-2 feat(api): add cancel endpoint for training session bookings
```

Show the user the proposed message **and** the exact list of files to be staged, then ask them to confirm, edit, or cancel. Do not commit until they confirm.

## Step 6 — Stage and commit

After confirmation:

1. Stage only the agreed files by explicit path:
   ```bash
   git add -- <file1> <file2> ...
   ```
2. Re-check `git diff --cached --name-only` and make sure no secret/excluded file slipped in.
3. Commit using a heredoc so formatting is preserved:
   ```bash
   git commit -F - <<'EOF'
   LATC-2 feat(api): add cancel endpoint for training session bookings

   Optional body.
   EOF
   ```
4. If the commit fails because of a hook, show the error, fix or ask the user, re-stage, and run a new `git commit` (never `--no-verify`, never `--amend` to paper over it).

## Step 7 — Report and stop

Run `git log --oneline -1` and `git status --short`, show the result, and stop. Do **not** push. Remind the user that pushing is up to them, and per CLAUDE.md that `make test` and `make lint` should pass before the work is called done.
