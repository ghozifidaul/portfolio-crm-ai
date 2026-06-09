CREATE SEQUENCE IF NOT EXISTS ticket_seq START 1000;

CREATE TABLE IF NOT EXISTS users (
  id        TEXT PRIMARY KEY,
  username  TEXT UNIQUE NOT NULL,
  password  TEXT NOT NULL,
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
