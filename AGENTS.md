# AGENTS.md

## Project structure

Monorepo root at `/portfolio-crm-ai/` — all code lives in `crm-ai-api/`.

## Essential commands

```sh
bun install                              # install deps
createdb crm_ai                          # one-time setup
bun run setup                            # migrate + seed
bun run dev                              # start dev server on :3000
bun run src/test-ai.ts                   # run AI test suite (requires Ollama)
```

## Architecture

- **`src/ai-service.ts`** — READ ONLY. The prompt-tuned AI engine. All 10/10 tests pass. Never modify without running the test suite.
- **`src/message-router.ts`** — Orchestration layer. Calls `ai-service.ts`, executes create/update/no_action against the DB.
- **`src/index.ts`** — API routes. All endpoints except `/api/login` require JWT auth.
- **`src/db/`** — Raw `pg` queries (no ORM). Parameterized SQL only.

## Database

- PostgreSQL via `pg` driver, connection from `DATABASE_URL` env var.
- Setup: `createdb crm_ai` → `bun run migrate` → `bun run seed`.
- Ticket IDs auto-generated as `TKT-1000`, `TKT-1001`, ... via DB sequence.
- Full conversation history is keyed on `customer_id`, not `ticket_id` — messages span across tickets.
- `messages.ticket_id` is nullable — `no_action` messages are stored without a ticket.
- `entities` and `tags` columns are PostgreSQL `TEXT[]` arrays.

## API routes

| Method | Path | Auth | Notes |
|---|---|---|---|
| `POST` | `/api/login` | No | `Bun.password.verify()` for hash check |
| `POST` | `/api/messages` | JWT | `{ customer_id, content, sender }` → AI → execute |
| `GET` | `/api/messages` | JWT | `?customer_id=X&limit=50` |
| `GET` | `/api/tickets` | JWT | `?customer_id=X&status=open` |
| `GET` | `/api/tickets/:id` | JWT | Returns ticket with `messages[]` |

## Auth

- JWT middleware needs both `{ secret, alg: 'HS256' }` — `alg` is mandatory in this Hono version.
- `hono/jwt` returns 401 with plain-text `"Unauthorized"` on failure (not JSON).
- Passwords hashed with `Bun.password.hash()`, verified with `Bun.password.verify()`.

## AI service

- Connects to Ollama at `http://localhost:11434/api/chat` with model `nemotron-3-ultra:cloud`.
- Returns `null` on network failure — `message-router.ts` converts to 503.
- System prompt in `SYSTEM_PROMPT` constant handles classification, resolution detection, escalation.
- Two type systems coexist: `src/db/schema.ts` (DB types) and `src/ai-service.ts` (AI-specific types like `AITicket` — a subset of `DbTicket`).

## Seeded users

| Username | Role |
|---|---|
| `agent1` | agent |
| `budi` | customer |
| `sari` | customer |
| `dimas` | customer |

All share password `password123`.

## Testing

- AI test suite: `bun run src/test-ai.ts` — custom runner, no Jest/Vitest. Reads `TEST.json`, writes `TEST_RESULT.json`.
- Tests call `classifyMessage()` directly (no HTTP, no DB dependency).
- Requires Ollama running locally to pass.
