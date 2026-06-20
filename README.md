# Portfolio CRM AI

AI-powered CRM where the AI silently manages tickets (creation, updates, closure) from conversation — agents focus on helping customers, not filling forms.

**Stack:** Bun + Hono + Cloudflare D1 (SQLite) + React 19 + TypeScript + Tailwind CSS v4

## Quick start

```sh
# API
cd crm-ai-api
bun install && bun run setup
bun run dev                        # :8787 (wrangler dev)

# UI (new terminal)
cd crm-ai-ui
bun install
bun run dev                        # :5173 (proxies /api/* to :8787)
```

Login with `agent1` / `password123`.

## Structure

```
crm-ai-api/     Hono + Cloudflare Workers + D1 backend
crm-ai-ui/      React 19 + Vite + Tailwind CSS v4 frontend
AGENTS.md       Developer guidance for AI agents
SPEC.md         System design specification
docs/           Additional documentation
```

## Seeded users

All share password `password123`.

| Username | Role |
|---|---|
| `agent1` | agent |
| `budi` | customer |
| `sari` | customer |
| `dimas` | customer |

## AI engine

Connects to Ollama (`nemotron-3-ultra:cloud`) for ticket classification. Two message paths:

- **Sync** (`POST /api/messages`) — AI classifies inline, returns ticket immediately
- **Async** (`POST /api/messages/direct`) — message stored immediately, AI runs in background via `c.executionCtx.waitUntil()`

## Commands

### API (`crm-ai-api`)

| Command | Description |
|---|---|
| `bun run dev` | Start wrangler dev server on `:8787` |
| `bun run db:migrate:local` | Apply D1 migrations locally |
| `bun run db:seed:local` | Regenerate + apply seed data |
| `bun run db:migrate` | Apply migrations to remote D1 |
| `bun run db:seed` | Seed remote D1 |
| `bun run src/test-ai.ts` | Run AI classification tests (requires Ollama) |

### UI (`crm-ai-ui`)

| Command | Description |
|---|---|
| `bun run dev` | Vite dev server on `:5173` |
| `bun run build` | TypeScript check + Vite build |
| `bun run lint` | ESLint check |

## Deployment

### API
```sh
cd crm-ai-api
bun run db:migrate          # apply migrations to production D1
bun run db:seed             # (optional) seed production data
bun run deploy              # wrangler deploy → Cloudflare Workers
```

### UI
```sh
cd crm-ai-ui
VITE_API_BASE=https://crm-ai-api.<your-worker>.workers.dev bun run build
npx wrangler pages deploy dist/ --project-name=crm-ai-ui
```

## Docs

- [AGENTS.md](./AGENTS.md) — developer guidance
- [SPEC.md](./SPEC.md) — system design
- `crm-ai-api/README.md` — API internals & test setup
- `docs/UI-REDESIGN.md` — UI design notes
