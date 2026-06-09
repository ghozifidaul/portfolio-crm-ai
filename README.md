# Portfolio CRM AI

AI-powered CRM where the AI silently manages tickets (creation, updates, closure) from conversation — agents focus on helping customers, not filling forms.

**Stack:** Bun + Hono + PostgreSQL + React + TypeScript + Tailwind CSS

## Quick start

```sh
# API
cd crm-ai-api
bun install
createdb crm_ai
bun run setup
bun run dev              # :3000

# UI (new terminal)
cd crm-ai-ui
bun install
bun run dev              # :5173 (proxies /api/* to :3000)
```

Login with `agent1` / `password123`.

## Structure

```
crm-ai-api/     Bun + Hono + PostgreSQL backend
crm-ai-ui/      React + Vite + Tailwind frontend
AGENTS.md       Developer guidance for AI agents
SPEC.md         Full system design spec
```

## Seeded users

| Username | Role | Password |
|---|---|---|
| `agent1` | agent | `password123` |
| `budi` | customer | `password123` |
| `sari` | customer | `password123` |
| `dimas` | customer | `password123` |

## AI engine

Connects to Ollama (`nemotron-3-ultra:cloud`) for ticket classification. AI runs in background — messages are stored immediately, classification is async. See `crm-ai-api/README.md` for test setup.

## Docs

- [AGENTS.md](./AGENTS.md) — developer guidance
- [SPEC.md](./SPEC.md) — system design
- `crm-ai-api/README.md` — API docs
- `crm-ai-ui/README.md` — UI setup
