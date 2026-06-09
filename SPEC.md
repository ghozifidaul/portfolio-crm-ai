# AI-Powered CRM System Design

## Overview

A human-centered CRM where the AI silently manages all ticket operations — creation, updates, and closure — so human agents can focus entirely on helping the customer. Agents never touch a ticket form; everything is inferred and maintained automatically from the conversation.

---

## Core Philosophy

- **AI is the operator, human is the communicator.** The agent's only job is to reply to the customer well.
- **Tickets are a byproduct of conversation**, not a task the agent manages.
- **Every message triggers an AI evaluation** — the AI decides whether to create, update, or do nothing with tickets.
- **The agent sees the ticket as context**, not as a form to fill.

---

## System Layers

### 1. Customer Layer (Inbound Channels)
Customers reach the system through the web chat widget, which funnels into the message router.

- **Web chat widget** — embedded on product/website

Each inbound message is normalized into a standard `Message` object before reaching the AI engine.

---

### 2. AI Engine Layer

The brain of the system. Runs on every inbound and outbound message.

#### 2a. Message Router
- Receives normalized message
- Identifies the customer (`customer_id`)
- Looks up open tickets for that customer
- Passes message + ticket context to the Ticket AI

#### 2b. Ticket AI
The core decision engine. On every message it receives:
- Full conversation history
- Current open tickets for the customer
- The latest message (customer or agent)

It returns a structured JSON action:

```json
{
  "action": "create" | "update" | "no_action",
  "ticket_id": "existing ID if updating, else null",
  "match_confidence": 0.0,
  "reasoning": "brief explanation of why this ticket was matched or created",
  "fields": {
    "category": "billing | technical | general | shipping | ...",
    "priority": "low | medium | high | urgent",
    "status": "open | pending | resolved | closed",
    "summary": "AI-generated summary of the issue",
    "entities": ["INV-2024-0892", "order #4421"],
    "tags": ["double-charge", "refund-request"]
  }
}
```

**Decision logic for create vs update:**
- `create` — no open ticket exists, OR new message is clearly a different topic from any open ticket
- `update` — message continues an existing open ticket (same topic, same session, customer adding details)
- `no_action` — purely conversational, no ticket-relevant content ("ok thanks", "one moment")

**Multi-ticket handling (customer with multiple open tickets):**

When a customer has 2+ open tickets, the AI evaluates the new message against each open ticket and returns a confidence score per ticket alongside its action:

```json
{
  "action": "update",
  "ticket_id": "TKT-3847",
  "match_confidence": 0.91,
  "reasoning": "Customer mentions invoice number previously logged in TKT-3847",
  "fields": { ... }
}
```

Confidence thresholds determine the outcome:

- **High confidence (>0.85)** → update that ticket silently, no agent interruption
- **Ambiguous (0.4–0.85 against multiple tickets)** → AI flags it; agent sees a one-tap prompt: *"This message could relate to TKT-3847 (billing) or TKT-3851 (account access). Which ticket should I attach this to?"*
- **No match, clearly new issue** → create a new ticket
- **No match, vague message** → hold as unattached; AI suggests a clarifying question for the agent to send

Signals the AI uses to determine the correct match:
- **Entities** — invoice number, order ID, or product name already logged in a ticket is a near-certain match
- **Topic similarity** — semantic closeness between the new message and each ticket's summary
- **Recency** — ticket with the most recent activity gets a slight score boost
- **Explicit customer reference** — "following up on my login issue" maps directly to an open ticket by topic

In the agent UI, all open tickets for the customer are stacked in the sidebar. The currently matched ticket is highlighted. The agent can manually reassign a message to a different ticket with one click if the AI got it wrong — that correction is logged as a training signal.

**Resolution detection:**
The AI monitors for resolution signals:
- Customer says "solved", "thank you, it's fixed", "terima kasih sudah beres", etc.
- Agent sends a closing message pattern
- No reply from customer for N hours (configurable, triggers auto-close prompt)

On resolution: sets `status: "resolved"`, logs `resolved_at`, optionally triggers CSAT survey.

#### 2c. Context Summarizer
Runs in parallel to Ticket AI. Maintains a live, human-readable summary of the conversation shown in the agent sidebar. Updated on every new message turn.

---

### 3. Ticket Store

Persistent storage layer. All ticket data lives here.

#### Ticket Schema

```typescript
interface Ticket {
  ticket_id: string;           // e.g. "TKT-3847"
  customer_id: string;
  channel: "chat";
  category: string;            // billing, technical, general, etc.
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "pending" | "resolved" | "closed";
  assigned_to: string;         // agent user ID
  created_at: ISO8601;
  updated_at: ISO8601;
  resolved_at: ISO8601 | null;
  summary: string;             // AI-generated, updated live
  entities: string[];          // extracted refs: invoice IDs, order IDs, etc.
  tags: string[];
  conversation_log: Message[]; // full history
  csat_score: number | null;   // 1-5, collected post-resolution
}
```

#### Message Schema

```typescript
interface Message {
  message_id: string;
  ticket_id: string;
  sender: "customer" | "agent" | "system";
  content: string;
  channel: string;
  timestamp: ISO8601;
  ai_action_taken: "create" | "update" | "no_action" | null;
}
```

#### Storage Components
- **Ticket database** — primary store for all ticket records (PostgreSQL recommended)
- **Conversation log** — append-only log of all messages per ticket
- **Status tracker** — real-time status index for fast lookups (Redis or similar)

---

### 4. Human Agent Layer

The agent interface. Designed to keep agents in conversation flow, never in ticket management mode.

#### Agent Inbox
- Lists all open tickets assigned to the agent
- Sorted by priority (urgent first)
- Each item shows: customer name, category, priority badge, last message preview, time since last message

#### Auto Ticket Sidebar
Shown alongside every conversation. Automatically populated by the Ticket AI — agent never edits this manually.

If the customer has multiple open tickets, all are stacked in the sidebar. The ticket matched to the current message turn is highlighted. The agent can manually reassign a message to a different ticket with one click — that correction is logged as a training signal for prompt improvement.

Displays per ticket:
- Ticket ID, status, priority, category
- Assigned agent
- Created at / updated at
- AI-generated summary (updates live)
- Extracted entities (invoice numbers, order IDs, etc.)

#### AI Reply Suggestions
Optional feature. On each customer message, the AI suggests 1-3 reply options the agent can use, edit, or ignore. Agent always has final say on what gets sent.

#### Suggested Actions
Context-aware action buttons injected by the AI based on ticket category:
- "Look up invoice" (billing tickets)
- "Check order status" (shipping tickets)
- "Escalate to tier 2"
- "Mark resolved"

---

### 5. Analytics & Reports Layer

Passive layer — reads from the ticket store, never writes.

- **Resolution reports** — average resolution time by category and agent
- **CSAT tracking** — customer satisfaction scores over time
- **Ticket trend analysis** — volume by category, spike detection, common issues
- **Agent performance** — tickets resolved per agent, avg response time
- **AI accuracy audit** — how often AI category/priority classification was later corrected by an agent (feedback loop for prompt improvement)

---

## Data Flow: Step by Step

```
1. Customer sends message via web chat widget
        ↓
2. Chat adapter normalizes to Message object
        ↓
3. Message Router identifies customer, fetches open tickets
        ↓
4. Ticket AI receives: [conversation history] + [open tickets] + [new message]
        ↓
5. Ticket AI returns JSON action: create | update | no_action
        ↓
6. Ticket Store is written (new ticket created or existing ticket patched)
        ↓
7. Context Summarizer updates live summary in sidebar
        ↓
8. Agent sees: conversation on left, auto-updated ticket sidebar on right
        ↓
9. Agent replies (no ticket work needed)
        ↓
10. Agent reply triggers step 3 again (AI monitors agent messages too)
        ↓
11. On resolution signal → ticket closed, CSAT triggered
```

---

## AI Prompt Template (Ticket Engine)

The system prompt sent to the AI on every message turn:

```
You are a ticket management AI for a customer support CRM.

On every message, you must return a JSON object with the following structure:
{
  "action": "create" | "update" | "no_action",
  "ticket_id": "<existing ticket ID if action is update, else null>",
  "match_confidence": <0.0 to 1.0, how confident you are in the ticket match>,
  "reasoning": "<one sentence explaining why you chose this action and ticket>",
  "fields": {
    "category": "<billing|technical|shipping|general|account>",
    "priority": "<low|medium|high|urgent>",
    "status": "<open|pending|resolved|closed>",
    "summary": "<1-2 sentence summary of the customer's issue>",
    "entities": ["<any invoice IDs, order numbers, product names extracted>"],
    "tags": ["<relevant tags>"]
  },
  "resolution_detected": true | false
}

Rules:
- Use "create" only when there is no existing open ticket or the new message is clearly a different issue.
- Use "update" when the message continues an existing open ticket.
- Use "no_action" for purely conversational messages with no new ticket-relevant information.
- If the customer has multiple open tickets, evaluate the message against each and pick the best match.
  - If match_confidence > 0.85, update that ticket silently.
  - If match_confidence is between 0.4 and 0.85 against multiple tickets, still return your best match but set match_confidence accordingly — the system will prompt the agent to confirm.
  - If no ticket matches and the message is clearly a new issue, use "create".
  - If no ticket matches and the message is vague, use "no_action" and note it in reasoning.
- Set resolution_detected: true when the customer confirms the issue is resolved, or the agent sends a clear closing message.
- Always return valid JSON. No explanation, no preamble.

Current open tickets for this customer:
{{open_tickets_json}}

Conversation history:
{{conversation_history}}

Latest message:
{{latest_message}}
```

---

## Tech Stack Recommendation

| Layer | Recommended Technology |
|---|---|
| Backend API | Node.js (Express) or Python (FastAPI) |
| Database | PostgreSQL (tickets) + Redis (status/sessions) |
| AI Engine | Anthropic Claude API (`claude-sonnet-4-20250514`) |
| Real-time updates | WebSockets (Socket.io) or Server-Sent Events |
| Agent frontend | React + TypeScript |
| Job queue | BullMQ or similar (for async AI calls) |
| Analytics | TimescaleDB or ClickHouse (time-series ticket data) |

---

## Key Design Decisions

**Why use confidence scoring instead of hard rules for multi-ticket matching?**
Hard rules (e.g. "match by topic keyword") break on ambiguous messages. Confidence scoring lets the AI communicate uncertainty explicitly — the system can act autonomously on high-confidence matches and gracefully fall back to a one-tap agent prompt on ambiguous ones, rather than silently guessing wrong.

**Why AI on every message, not just the first?**
Issues evolve. A customer who starts with a general inquiry may reveal a billing problem 3 messages in. The AI needs to re-evaluate on each turn to catch category changes, extract new entities, and detect resolution.

**Why does the agent not manually edit tickets?**
Manual ticket management is the friction point this system eliminates. If the AI misclassifies, agents can optionally correct via a simple override — but the default is AI-managed. Corrections feed back as examples to improve the prompt.

**Why append-only conversation log?**
Immutability ensures full audit trail. Nothing is overwritten — the ticket `summary` is updated, but the full message history is never modified.

**Why keep CSAT as a separate step?**
CSAT triggered immediately on resolution (not on ticket close) gives more accurate sentiment — it's sent while the experience is fresh, not days later when a batch job runs.

---

## Future Extensions

- **Auto-routing** — AI assigns ticket to the right agent/team based on category and agent specialization
- **Knowledge base integration** — AI surfaces relevant help articles in the sidebar based on ticket category
- **Proactive escalation** — AI alerts a supervisor when a high-priority ticket has been open too long without resolution
- **Multi-language support** — AI normalizes all tickets to a standard language internally while agents reply in the customer's language
- **Voice channel** — transcribe calls in real time, apply same ticket engine to the transcript
