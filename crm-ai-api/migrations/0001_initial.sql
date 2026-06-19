-- D1 / SQLite migration — replaces PG sequence with counter table
-- arrays stored as JSON strings

CREATE TABLE IF NOT EXISTS ticket_counter (
  id INTEGER PRIMARY KEY,
  next_id INTEGER NOT NULL
);

INSERT INTO ticket_counter (id, next_id) VALUES (1, 1000);

CREATE TABLE IF NOT EXISTS users (
  id        TEXT PRIMARY KEY,
  username  TEXT UNIQUE NOT NULL,
  password  TEXT NOT NULL,
  name      TEXT NOT NULL,
  role      TEXT NOT NULL DEFAULT 'agent'
);

CREATE TABLE IF NOT EXISTS tickets (
  ticket_id   TEXT PRIMARY KEY,
  customer_id TEXT NOT NULL REFERENCES users(id),
  channel     TEXT NOT NULL DEFAULT 'chat',
  category    TEXT NOT NULL DEFAULT 'general',
  priority    TEXT NOT NULL DEFAULT 'medium',
  status      TEXT NOT NULL DEFAULT 'open',
  assigned_to TEXT REFERENCES users(id),
  summary     TEXT NOT NULL DEFAULT '',
  entities    TEXT NOT NULL DEFAULT '[]',
  tags        TEXT NOT NULL DEFAULT '[]',
  csat_score  INTEGER,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now')),
  resolved_at TEXT
);

CREATE TABLE IF NOT EXISTS messages (
  message_id      TEXT PRIMARY KEY,
  customer_id     TEXT NOT NULL REFERENCES users(id),
  ticket_id       TEXT REFERENCES tickets(ticket_id),
  sender          TEXT NOT NULL,
  content         TEXT NOT NULL,
  channel         TEXT NOT NULL DEFAULT 'chat',
  timestamp       TEXT NOT NULL DEFAULT (datetime('now')),
  ai_action_taken TEXT
);

CREATE INDEX idx_messages_customer ON messages(customer_id, timestamp);
CREATE INDEX idx_messages_ticket ON messages(ticket_id, timestamp);
CREATE INDEX idx_tickets_customer_status ON tickets(customer_id, status);
