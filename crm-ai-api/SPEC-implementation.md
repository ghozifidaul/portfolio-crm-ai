# Implementation Plan: Database Layer + Message Router

## Overview

Building persistent storage (PostgreSQL) and the orchestration layer ("Message Router") for the CRM AI system. The AI engine (`src/ai-service.ts`) stays untouched — all 10/10 tests must continue passing.

---

## Project Structure

```
crm-ai-api/
  src/
    index.ts              ← REFACTOR
    ai-service.ts         ← UNCHANGED
    test-ai.ts            ← UNCHANGED
    message-router.ts     ← NEW
    users.json            ← DELETED (moved to DB seed)
    db/
      connection.ts       ← NEW
      schema.ts           ← NEW
      users.ts            ← NEW
      tickets.ts          ← NEW
      messages.ts         ← NEW
      index.ts            ← NEW
  migrations/
    001_initial.sql       ← NEW
  scripts/
    migrate.ts            ← NEW
    seed.ts               ← NEW
  package.json            ← MODIFIED
  .env.example            ← REWRITTEN
  .env                    ← UPDATED
```

---

## Phase 1 — Database Layer

### 1.1 Install dependencies

- [ ] `bun add pg`
- [ ] `bun add -d @types/pg`

### 1.2 Update config files

- [ ] `.env.example` — add `DATABASE_URL`, update `JWT_SECRET`
- [ ] `.env` — add `DATABASE_URL`

### 1.3 Create migration: `migrations/001_initial.sql`

```sql
CREATE SEQUENCE IF NOT EXISTS ticket_seq START 1000;

CREATE TABLE IF NOT EXISTS users (
  id        TEXT PRIMARY KEY,
  username  TEXT UNIQUE NOT NULL,
  password  TEXT NOT NULL,                   -- hashed with Bun.password.hash
  name      TEXT NOT NULL,
  role      TEXT NOT NULL DEFAULT 'agent'
);

CREATE TABLE IF NOT EXISTS tickets (
  ticket_id   TEXT PRIMARY KEY DEFAULT 'TKT-' || LPAD(nextval('ticket_seq')::TEXT, 4, '0'),
  customer_id TEXT NOT NULL REFERENCES users(id),
  channel     TEXT NOT NULL DEFAULT 'chat',
  category    TEXT NOT NULL DEFAULT 'general',
  priority    TEXT NOT NULL DEFAULT 'medium',
  status      TEXT NOT NULL DEFAULT 'open',
  assigned_to TEXT REFERENCES users(id),
  summary     TEXT NOT NULL DEFAULT '',
  entities    TEXT[] NOT NULL DEFAULT '{}',
  tags        TEXT[] NOT NULL DEFAULT '{}',
  csat_score  INTEGER,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS messages (
  message_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id     TEXT NOT NULL REFERENCES users(id),
  ticket_id       TEXT REFERENCES tickets(ticket_id),
  sender          TEXT NOT NULL CHECK (sender IN ('customer', 'agent', 'system')),
  content         TEXT NOT NULL,
  channel         TEXT NOT NULL DEFAULT 'chat',
  timestamp       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ai_action_taken TEXT CHECK (ai_action_taken IN ('create', 'update', 'no_action'))
);

CREATE INDEX IF NOT EXISTS idx_messages_customer ON messages(customer_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_messages_ticket  ON messages(ticket_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_tickets_customer_status ON tickets(customer_id, status);
```

### 1.4 Create migration runner: `scripts/migrate.ts`

- [ ] Reads `DATABASE_URL`, connects via pg Pool
- [ ] Checks if `tickets` table exists — skip if already migrated
- [ ] Runs `001_initial.sql` if fresh

### 1.5 Create seed script: `scripts/seed.ts`

- [ ] Insert 4 users from `users.json` with `Bun.password.hash()` for passwords
- [ ] Insert TKT-3847 (billing, open) for customer `budi` with 2 messages
- [ ] Insert TKT-3851 (technical, open) for customer `budi` with 1 message

### 1.6 Create DB connection: `src/db/connection.ts`

```
Pool from pg, reads DATABASE_URL from env
Exports single pool instance
```

### 1.7 Create schema types: `src/db/schema.ts`

| Type | Fields | Purpose |
|---|---|---|
| `DbUser` | id, username, password, name, role | Full row from users table |
| `DbTicket` | ticket_id, customer_id, channel, category, priority, status, assigned_to, summary, entities, tags, csat_score, created_at, updated_at, resolved_at | Full row from tickets table |
| `DbMessage` | message_id, customer_id, ticket_id, sender, content, channel, timestamp, ai_action_taken | Full row from messages table |
| `AITicket` | ticket_id, category, priority, status, summary, entities, tags, created_at | Subset passed to ai-service.ts |
| `ConversationEntry` | role, content, timestamp | Format expected by ai-service.ts |

### 1.8 Create user queries: `src/db/users.ts`

| Function | SQL | Returns |
|---|---|---|
| `findByUsername(username)` | `SELECT * FROM users WHERE username = $1` | `DbUser \| null` |
| `findById(id)` | `SELECT * FROM users WHERE id = $1` | `DbUser \| null` |
| `createUser(data)` | `INSERT INTO users ... RETURNING *` | `DbUser` |

### 1.9 Create ticket queries: `src/db/tickets.ts`

| Function | Key SQL |
|---|---|
| `createTicket(customerId, fields)` | `INSERT INTO tickets ... RETURNING *` |
| `updateTicket(ticketId, fields)` | Dynamic UPDATE of category/priority/status/summary/entities/tags + `updated_at = NOW()` |
| `getTicketById(ticketId)` | `SELECT * FROM tickets WHERE ticket_id = $1` |
| `getTicketsByCustomer(customerId, status?)` | Filterable by status |
| `getOpenTickets(customerId)` | `WHERE customer_id = $1 AND status IN ('open','pending')` |
| `resolveTicket(ticketId)` | `SET status='resolved', resolved_at=NOW() ...` |

All functions take plain parameters and return typed objects. No ORM, just parameterized SQL.

### 1.10 Create message queries: `src/db/messages.ts`

| Function | Key SQL |
|---|---|
| `addMessage(customerId, ticketId, sender, content, aiAction)` | `INSERT INTO messages ... RETURNING *` |
| `getConversationHistory(customerId, limit)` | `SELECT * FROM messages WHERE customer_id = $1 ORDER BY timestamp ASC LIMIT $2` — cross-ticket, full session view |

### 1.11 Create barrel: `src/db/index.ts`

- [ ] Re-export all functions from users.ts, tickets.ts, messages.ts
- [ ] Re-export all types from schema.ts

---

## Phase 2 — Message Router

### 2.1 Create `src/message-router.ts`

```
function processMessage(customerId, content, sender)
```

**Flow:**

```
1. Lookup customer via findById() → abort with 404 if missing
2. Fetch conversation history via getConversationHistory(customerId)
   → transform to ConversationEntry[] (role, content, timestamp)
3. Fetch open tickets via getOpenTickets(customerId)
   → transform to AITicket[]
4. Call classifyMessage(openTickets, conversationHistory, content)
5. Switch on AI response.action:
```

**Action handlers:**

| Action | DB operations | Return |
|---|---|---|
| `"create"` | `createTicket()` + `addMessage()` | `{ action, ticket, ai_response }` |
| `"update"` | `updateTicket()` + `addMessage()` + optionally `resolveTicket()` | `{ action, ticket, ai_response }` |
| `"no_action"` | `addMessage()` with `ticket_id = NULL` | `{ action, ticket: null, ai_response }` |

**Edge cases:**
- AI returns `null` → return 503 error
- `update` with invalid `ticket_id` → return 400 error
- `create` while existing open tickets exist → still creates (AI decided it's a new topic)

---

## Phase 3 — API Routes Refactor

### 3.1 Rewrite `src/index.ts`

**Auth middleware:**
```typescript
import { jwt } from 'hono/jwt'
const authenticate = jwt({ secret: JWT_SECRET })
```

**Routes:**

| Method | Path | Auth | Body / Query | Returns |
|---|---|---|---|---|
| `GET` | `/` | No | — | `"Hello Hono!"` |
| `POST` | `/api/login` | No | `{ username, password }` | `{ token, user }` |
| `POST` | `/api/messages` | Yes | `{ customer_id, content, sender }` | MessageRouter result |
| `GET` | `/api/tickets` | Yes | `?customer_id=X&status=open` | `DbTicket[]` |
| `GET` | `/api/tickets/:id` | Yes | — | `DbTicket` + `messages[]` |

**Login** uses `Bun.password.verify()` against DB instead of users.json.

**Remove** `/api/chat` endpoint (replaced by `/api/messages`).

---

## Phase 4 — Finalize

- [ ] Delete `src/users.json`
- [ ] Update package.json scripts:
  ```json
  {
    "dev": "bun run --hot src/index.ts",
    "migrate": "bun run scripts/migrate.ts",
    "seed": "bun run scripts/seed.ts",
    "setup": "bun run migrate && bun run seed"
  }
  ```
- [ ] Run `bun run migrate`
- [ ] Run `bun run seed`
- [ ] Run `bun run src/test-ai.ts` — verify 10/10 still pass
- [ ] Run `bun run dev` — verify server starts

---

## Execution order

```
1. Install deps                          → bun add pg + @types/pg
2. Write config files                    → .env.example, .env
3. Write migration                       → migrations/001_initial.sql
4. Write migration runner                → scripts/migrate.ts
5. Write seed script                     → scripts/seed.ts
6. Write src/db/connection.ts
7. Write src/db/schema.ts
8. Write src/db/users.ts
9. Write src/db/tickets.ts
10. Write src/db/messages.ts
11. Write src/db/index.ts
12. Write src/message-router.ts
13. Rewrite src/index.ts
14. Delete src/users.json
15. bun run migrate + bun run seed
16. bun run test-ai.ts                   → verify 10/10
17. bun run dev                          → smoke test
```

---

## Notes

- `ai-service.ts` is **read-only** — zero modifications
- `test-ai.ts` calls `classifyMessage()` directly, no DB dependency — tests remain independent
- Passwords hashed with `Bun.password.hash()` at seed time, verified with `Bun.password.verify()` at login
- `ticket_id` auto-generated by PostgreSQL sequence: `TKT-1000`, `TKT-1001`, ...
- `message_id` auto-generated as UUID via `gen_random_uuid()`
- Messages keyed on `customer_id` for full-session history across all tickets
