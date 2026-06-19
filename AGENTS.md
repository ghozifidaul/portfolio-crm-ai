# AGENTS.md

## Project structure

Monorepo with two packages:

| Package | Stack | Dev server |
|---|---|---|
| `crm-ai-api/` | Hono + Cloudflare Workers + D1 (SQLite) | `:8787` (via `wrangler dev`) |
| `crm-ai-ui/` | React 19 + Vite + Tailwind CSS v4 + React Router v7 | `:5173` (proxies `/api/*` → `:8787`) |

## Essential commands

```sh
# API setup (one-time)
cd crm-ai-api && bun install && bun run setup

# Dev servers
cd crm-ai-api && bun run dev          # :8787 (wrangler dev)
cd crm-ai-ui && bun run dev           # :5173

# UI build + lint
cd crm-ai-ui && bun run build         # tsc -b && vite build
cd crm-ai-ui && bun run lint          # eslint

# AI test suite (requires Ollama running locally)
cd crm-ai-api && bun run src/test-ai.ts

# DB commands (D1)
cd crm-ai-api && bun run db:migrate:local    # apply migrations locally
cd crm-ai-api && bun run db:seed:local       # (re)generate + apply seed data
cd crm-ai-api && bun run db:migrate          # apply to remote D1
cd crm-ai-api && bun run db:seed             # seed remote D1
```

## API endpoints

| Method | Path | Auth | Notes |
|---|---|---|---|
| `POST` | `/api/login` | No | `bcrypt.compare()` for hash check |
| `POST` | `/api/messages` | JWT | Sync — AI classifies inline, returns ticket |
| `POST` | `/api/messages/direct` | JWT | Async — stores message, AI runs in background via `c.executionCtx.waitUntil()` |
| `GET` | `/api/messages` | JWT | `?customer_id=X&limit=50&since=ISO` |
| `GET` | `/api/tickets` | JWT | `?customer_id=X&status=open` |
| `GET` | `/api/tickets/:id` | JWT | Returns ticket with `messages[]` |
| `GET` | `/api/conversations` | JWT | Agent-only — inbox summary with priority sort |
| `GET` | `/api/dashboard/stats` | JWT | Agent-only — byStatus, byPriority, recentTickets, totalMessages, activeConversations |

## Auth

- JWT middleware needs `{ secret, alg: 'HS256' }` — `alg` is mandatory in this Hono version.
- `hono/jwt` returns 401 with plain-text `"Unauthorized"` on failure (not JSON).
- UI stores JWT + user payload in `localStorage`; clears both on logout/401.

## Database (Cloudflare D1)

- D1 is SQLite-based — no sequences, no arrays, no `RETURNING`, no `CHECK`.
- **Ticket IDs**: auto-generated as `TKT-1000`, `TKT-1001`, ... via `ticket_counter` table + `db.batch()`.
- **Arrays** (`entities`, `tags`): stored as JSON strings (`TEXT`), parsed in app via `JSON.parse()`.
- **UUIDs**: generated in app via `crypto.randomUUID()`.
- **Timestamps**: stored as ISO 8601 `TEXT`, set via `datetime('now')`.
- Full conversation history keyed on `customer_id`, not `ticket_id` — messages span across tickets.
- `messages.ticket_id` is nullable — `no_action` messages are stored without a ticket.
- DB binding accessed via `c.env.DB` (not `process.env.DATABASE_URL`).
- All DB functions accept `db: D1Database` as first parameter.
- Secrets (JWT_SECRET, API keys) set via `wrangler secret put`.

## AI engine

- **`src/ai-service.ts`** — READ ONLY. Prompt-tuned classification engine. All 10/10 tests pass. Never modify without running the test suite.
- Connects to Ollama at `https://ollama.com/api/chat` with model `nemotron-3-ultra:cloud`.
- Returns `null` on network failure — `message-router.ts` converts to 503.
- `SYSTEM_PROMPT` constant handles classification, resolution detection, escalation.
- Two type systems coexist: `src/db/schema.ts` (DB types) and `src/ai-service.ts` (AI-specific `Ticket` / `AIResponse` — maintained separately, not shared).

## Testing

- **AI test suite**: `bun run src/test-ai.ts` — custom runner, no Jest/Vitest. Reads `TEST.json`, writes `TEST_RESULT.json`.
- Tests call `classifyMessage()` directly (no HTTP, no DB dependency).
- Requires Ollama running locally to pass.

## Seeded users

All share password `password123`.

| Username | Role |
|---|---|
| `agent1` | agent |
| `budi` | customer |
| `sari` | customer |
| `dimas` | customer |

## UI notes

- Tailwind CSS v4 is used via the `@tailwindcss/vite` plugin (not PostCSS). Class names are standard Tailwind.
- UI polls `GET /api/conversations` every 5 seconds for live inbox updates.
- Login redirects by role: agent → `/inbox`, customer → `/home`.
- Agent-facing pages: InboxPage (`/inbox`), ConversationPage (`/conversation/:customerId`).
- Customer-facing page: CustomerHomePage (`/home`).
