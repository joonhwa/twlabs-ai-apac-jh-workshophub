---
name: tdd
description: Run ONE red-green TDD loop for WorkshopHub by delegating to the project agents. Asks the navigator for exactly one slice (one acceptance criterion or one Operation), builds a packet, has the test-writer agent write failing tests, runs `make test` and pauses for the navigator to confirm RED, then has the implementer agent make them pass, confirms green, and stops. Never starts a second slice. Use when the user asks to TDD a criterion/operation or runs /tdd.
argument-hint: "[AC text, Operation, or canvas excerpt for ONE slice]"
allowed-tools: Agent, AskUserQuestion, Bash, Read
---

# TDD — one slice, red → green (WorkshopHub)

Drive a single red-green loop for **one** acceptance criterion or **one** Operation. You orchestrate; the `test-writer` and `implementer` agents do the writing. Follow the steps in order. Stop as soon as a step says to stop.

## Hard rules

- **ONE slice per run, then stop.** One acceptance criterion *or* one Operation. Never batch several, never roll into the next one, never offer to "keep going" automatically.
- **Do not invent a whole-story suite.** If the navigator gives a story key or a full story with no single slice picked, ask them to pick one. Do not pick for them.
- **You do not write tests or implementation yourself.** Tests come only from the `test-writer` agent; production code only from the `implementer` agent. Don't edit files under `api/` in this skill.
- **Keep the test-writer blind.** Do not read `api/src/` before or while building the packet, and never paste source code, source file listings, or existing export names from `api/src/` into the test-writer's packet. The packet carries only what the navigator gave you (plus pointers to `CLAUDE.md` / `schema.prisma` it may read itself).
- **No implementation before RED is confirmed** by the navigator in Step 4.
- Do not commit, push, touch Jira, or reset the DB. Those are separate commands.

## Step 1 — Get exactly ONE slice

If `$ARGUMENTS` contains a slice, use it. Otherwise ask the navigator, in plain text:

> Which **one** slice are we implementing? Paste a single acceptance criterion from the story, or a single Operation / canvas excerpt. Add any Requirements, Entities, Approach, Structure, Norms, Safeguards, out-of-scope do-nots, or intended module paths you want the agents to have.

Then check:

- **More than one AC / Operation** in what they gave → ask which ONE to do in this run (`AskUserQuestion`, listing the candidates as options). The rest stay out of scope for this run.
- **Only a story key or whole story, no slice chosen** → ask them to choose one. Do not fetch the story and decide yourself.
- **Clear single slice** → continue.

## Step 2 — Build the packet

Assemble a packet from what the navigator provided. Pass sections through **verbatim** where possible. Do not strip Approach or Operations, and do not add behaviour they didn't give. Include only the sections that are present:

```markdown
## Navigator packet — <one-line slice name>

### Acceptance criterion / Operation
<the ONE slice, verbatim>

### Requirements
### Entities
### Approach
### Structure / intended module paths
### Norms
### Safeguards
### Out-of-scope / do-nots
<always include: "All other acceptance criteria / Operations of this story.">
```

Show the packet to the navigator in one message before delegating, so they can see exactly what the agents get. Don't wait for approval unless something was ambiguous.

## Step 3 — RED: delegate to `test-writer`

Call the `Agent` tool with `subagent_type: "test-writer"` and a prompt containing:

- The full packet from Step 2.
- "Write failing tests for this ONE slice only. Do not read anything under `api/src/`. Write only under `api/tests/`. Do not run tests."

When it returns:

- If it reports the slice as **under-specified** or lists blocking gaps → relay them to the navigator and **stop**. Do not fill gaps yourself.
- Otherwise keep its report: files written, test → packet trace, expected red reason, assumptions/gaps. You'll need it for Steps 4 and 5.

## Step 4 — Run `make test` and PAUSE for RED confirmation

Run from the repo root (fall back to `pnpm run test` if `make` is unavailable):

```bash
make test 2>&1 | tail -n 120
```

Show the navigator:

1. The **failure output** — the failing test names and their error messages, quoted from the run (trim passing-suite noise, keep every failure).
2. The test-writer's **expected red reason** and **assumptions / gaps**.
3. A note if anything **pre-existing** also failed, or if any new test unexpectedly **passed** (a test that's green before implementation isn't proving anything).

Then **pause** with `AskUserQuestion`:

- **Question:** "Are these tests RED for the right reason for this slice?"
- **Options:**
  - "RED confirmed — implement" — failures are the expected missing-behaviour ones
  - "Wrong reason — stop" — e.g. syntax/type error in the test, wrong import path, setup/DB failure, pre-existing breakage
  - "Tests need changes — stop" — the tests don't match the slice

Only "RED confirmed" continues. For anything else, summarise what the navigator said and **stop**. They can fix the packet and re-run `/tdd`. Do not implement, and do not edit the tests yourself.

## Step 5 — GREEN: delegate to `implementer`

Only after RED is confirmed. Call the `Agent` tool with `subagent_type: "implementer"` and a prompt containing:

- The **same packet** from Step 2, unchanged.
- **Failing tests context:** the test file paths and test names from the test-writer, plus the failure output from Step 4.
- Anything the navigator added at the RED checkpoint.
- "Make these named failing tests pass for this ONE slice. Do not edit, weaken or skip tests. Do not start the next slice."

If the implementer stops early (thinks a test is wrong, needs out-of-scope behaviour, a new dependency, or a schema reset), relay its report to the navigator and **stop**.

## Step 6 — Confirm GREEN yourself

Don't rely on the implementer's word. From the repo root, run:

```bash
make test 2>&1 | tail -n 60
make lint
make format-check
```

(`pnpm run test` / `pnpm run lint` / `pnpm run format-check` if `make` is unavailable.)

Also run `git status --short` and `git diff --stat -- api/tests` to check the implementer didn't modify the test files written in Step 3. If it did, flag it clearly.

- **All green** → go to Step 7.
- **Anything failing** → show the output, say the slice is **not done**, and stop. Don't loop back into another implementation round without the navigator asking.

## Step 7 — STOP

Report briefly:

1. **Slice** — the one AC / Operation done
2. **Tests** — files and test names added (from the test-writer)
3. **Implementation** — files changed (from the implementer) and any deviation from the packet's Approach
4. **Gate** — `make test` counts, `make lint`, `make format-check` results
5. **Follow-ups** — gaps or concerns raised by either agent

Then stop. **Do not start the next slice**, don't propose running it, and don't commit. The navigator decides what's next and runs `/tdd` again.
