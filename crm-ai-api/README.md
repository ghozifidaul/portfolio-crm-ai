# CRM AI API

AI-powered CRM backend where the AI silently manages tickets (creation, updates, closure) from conversation — agents focus on helping customers, not filling forms.

**Stack:** Bun + Hono + PostgreSQL + Ollama

## Prerequisites

- [Bun](https://bun.sh) (runtime)
- PostgreSQL (database)
- Ollama with `nemotron-3-ultra:cloud` (AI engine, optional for API-only work)

## Setup

```sh
bun install                              # install dependencies
createdb crm_ai                          # create the database (one-time)
bun run setup                            # run migrations + seed data
bun run dev                              # start dev server on :3000
```

## Commands

| Command | What it does |
|---|---|
| `bun run dev` | Start dev server with hot reload on :3000 |
| `bun run migrate` | Run database migrations |
| `bun run seed` | Seed users + test tickets |
| `bun run setup` | Run migration then seed |
| `bun run src/test-ai.ts` | Run AI classification tests (requires Ollama) |

## API

All endpoints except `/api/login` require a JWT token in the `Authorization: Bearer <token>` header.

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/login` | No | Authenticate and get JWT token |
| `POST` | `/api/messages` | JWT | Send a message → AI classifies → ticket created/updated |
| `GET` | `/api/messages` | JWT | Full conversation history for a customer |
| `GET` | `/api/tickets` | JWT | List tickets for a customer |
| `GET` | `/api/tickets/:id` | JWT | Single ticket with all messages |

## Seeded credentials

| Username | Role | Password |
|---|---|---|
| `agent1` | agent | `password123` |
| `budi` | customer | `password123` |
| `sari` | customer | `password123` |
| `dimas` | customer | `password123` |

## Testing

```sh
bun run src/test-ai.ts
```

The AI test suite calls `classifyMessage()` directly (no HTTP, no DB dependency). Tests read from `TEST.json` and write results to `TEST_RESULT.json`. Ollama must be running locally with the configured model for tests to pass.

## Architecture

| Directory | Purpose |
|---|---|
| `src/ai-service.ts` | Prompt-based classification engine (read-only, 10/10 tests pass) |
| `src/message-router.ts` | Orchestration: inbound message → AI → DB |
| `src/db/` | Raw PostgreSQL queries (no ORM) |
| `migrations/` | SQL schema files |
| `scripts/` | Migration and seed runners |

See `AGENTS.md` at the repo root for detailed developer guidance.
