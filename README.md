# Portfolio CRM AI

AI-powered CRM where the AI silently manages tickets (creation, updates, closure) from conversation — agents focus on helping customers, not filling forms.

**Stack:** Bun + Hono + Cloudflare D1 (SQLite) + React 19 + TypeScript + Tailwind CSS v4

## Prerequisites

- [Bun](https://bun.sh) — install via one of:

  **macOS / Linux:**
  ```sh
  curl -fsSL https://bun.sh/install | bash
  ```
  **Windows:** Use PowerShell (requires [WSL](https://learn.microsoft.com/en-us/windows/wsl/install)):
  ```powershell
  powershell -c "irm bun.sh/install.ps1 | iex"
  ```
  **Package managers:**
  ```sh
  brew install oven-sh/bun/bun    # macOS (Homebrew)
  npm install -g bun               # via npm
  dnf install bun                  # Fedora
  ```
- [Wrangler](https://developers.cloudflare.com/workers/wrangler/) (comes with the API package via `bun install`)

## Setup

Copy the environment files:

```sh
cp crm-ai-api/.env.example crm-ai-api/.env
cp crm-ai-ui/.env.example crm-ai-ui/.env
```

Then configure the variables:

### `crm-ai-api/.env`

| Variable | Description |
|---|---|
| `JWT_SECRET` | Secret key for signing auth tokens. Generate one with `openssl rand -hex 32`. |
| `OLLAMA_API_KEY` | API key for Ollama (required for AI ticket classification). Get one at [ollama.com](https://ollama.com). |

### `crm-ai-ui/.env`

| Variable | Description |
|---|---|
| `VITE_API_BASE` | API base URL. Defaults to `http://localhost:8787` for local dev. Leave empty if using the Vite proxy. |

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

## Who it's for

Made for customer agents and companies that want real relationships with their customers through human interaction, while still managing tickets efficiently. The one job: autonomous ticket management.

## Why this problem

My wife is a customer service agent. Handling customers is hard, but managing tickets and filling forms is harder. Half her day is spent on tickets instead of customers. Everybody tries to automate human interaction — that's wrong. Ticket management is the real problem.

## What's already out there

Mekari Qontak has AI, but they use it to automate human interaction. AI can't handle that well — it damages brand-customer relationships. Instead, AI should handle ticket management and summarize conversations.

## Scope

**In scope:** Autonomous ticket management (create, update, resolve), conversation summarization.

**Left out:** Human review of AI-created tickets. Current Gen AI is good enough; adding a human review step adds complexity without solving the real problem.

## Three questions

- Will this help you manage your day-to-day work better?
- Will this help you build better relationships with customers?
- Will this help you solve customer problems faster?

## What I'd do next

- **Action recommendations on tickets** — helps agents decide what to do next faster.
- **Autonomous reminder creation** — agents never miss a customer follow-up.
