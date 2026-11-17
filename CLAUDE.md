# CLAUDE.md

Guidance for Claude Code when working in the WorkshopHub repository.

## Project context

WorkshopHub is a workshop/training-session booking system, organised as a **pnpm monorepo** (`pnpm-workspace.yaml`) with two packages:

| Package | Path | Stack |
|---|---|---|
| `@workshophub/api` | `api/` | Express + Prisma (SQLite), TypeScript, Jest |
| `@workshophub/app` | `app/` | React + TypeScript, Vite |

### API layout (`api/`)
- `src/app.ts` / `src/server.ts` — Express app setup and entry point
- `src/routes/` — HTTP route handlers (`training-sessions.ts`, `admin.ts`, `health.ts`)
- `src/services/` — business logic and data access (e.g. `trainingSessionService.ts`)
- `src/lib/prisma.ts` — the shared Prisma client instance
- `prisma/` — `schema.prisma` and `seed.ts`
- `tests/unit/` and `tests/integration/` — Jest suites

### App layout (`app/`)
- `src/pages/`, `src/components/`, `src/types/`

### Common commands
Run from the repo root:

```bash
make setup         # install deps, generate Prisma client, push schema, seed DB
make dev           # run app + api concurrently
make test          # all tests (unit + integration)
make test-unit     # unit tests only, no DB required
make lint          # ESLint across both packages
make format-check  # Prettier check
make build         # build app + api
make reset-db      # force-reset schema and re-seed
```

Every `make` target wraps a `pnpm` script, so `pnpm run <script>` works where `make` is unavailable (e.g. the `node:24-slim` CI runners).

## Team norms

- **No `any`.** Do not use `any`, either written out or implied. Use precise types, generics, or `unknown` with narrowing. Put shared frontend types in `app/src/types/`.
- **No direct Prisma in routes.** Route handlers in `api/src/routes/` must not import `prisma` or `@prisma/client`. All database access goes through a service in `api/src/services/`, which uses the shared client from `src/lib/prisma.ts`. Routes handle HTTP concerns only: parsing input, calling services, and shaping responses and status codes.
- **All code must pass `make test` and `make lint`.** Run both before calling a change done, and don't present work as complete while either is failing. Add or update tests alongside behaviour changes.
- Keep formatting consistent with `.prettierrc`; `make format-check` should pass.

## MCP permissions

<!-- TODO: Define which MCP servers (see .mcp.json) Claude may use in this repo,
     which tools are allowed/denied, and any actions that require explicit
     human approval. -->

_Placeholder — to be completed._

## AGENT_BOUNDARY

<!-- TODO: Define the boundaries for autonomous agent work: which paths may be
     modified, which are off-limits (e.g. .env, security/, CI config, prod
     compose files), and which operations (commits, pushes, DB resets,
     deployments) require human sign-off. -->

_Placeholder — to be completed._
