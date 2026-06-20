import type { DbMessage } from "../types/db";

export async function addMessage(
  db: D1Database,
  customerId: string,
  ticketId: string | null,
  sender: string,
  content: string,
  aiAction: string | null
): Promise<DbMessage> {
  const messageId = crypto.randomUUID();

  await db
    .prepare(
      "INSERT INTO messages (message_id, customer_id, ticket_id, sender, content, ai_action_taken) VALUES (?1, ?2, ?3, ?4, ?5, ?6)"
    )
    .bind(messageId, customerId, ticketId, sender, content, aiAction)
    .run();

  const row = await db
    .prepare("SELECT * FROM messages WHERE message_id = ?1")
    .bind(messageId)
    .first<DbMessage>();

  return row!;
}

export async function updateMessageTicket(
  db: D1Database,
  messageId: string,
  ticketId: string | null,
  aiAction: string
): Promise<DbMessage | null> {
  await db
    .prepare("UPDATE messages SET ticket_id = ?2, ai_action_taken = ?3 WHERE message_id = ?1")
    .bind(messageId, ticketId, aiAction)
    .run();

  return db.prepare("SELECT * FROM messages WHERE message_id = ?1").bind(messageId).first<DbMessage>();
}

export async function getConversationHistory(
  db: D1Database,
  customerId: string,
  limit = 50
): Promise<DbMessage[]> {
  const { results } = await db
    .prepare("SELECT * FROM messages WHERE customer_id = ?1 ORDER BY timestamp ASC LIMIT ?2")
    .bind(customerId, limit)
    .all();
  return results as unknown as DbMessage[];
}

export async function getMessagesSince(
  db: D1Database,
  customerId: string,
  since: string
): Promise<DbMessage[]> {
  const { results } = await db
    .prepare("SELECT * FROM messages WHERE customer_id = ?1 AND timestamp > ?2 ORDER BY timestamp ASC")
    .bind(customerId, since)
    .all();
  return results as unknown as DbMessage[];
}

export async function getMessagesByTicket(db: D1Database, ticketId: string): Promise<DbMessage[]> {
  const { results } = await db
    .prepare("SELECT * FROM messages WHERE ticket_id = ?1 ORDER BY timestamp ASC")
    .bind(ticketId)
    .all();
  return results as unknown as DbMessage[];
}

export async function getConversations(db: D1Database) {
  const { results } = await db
    .prepare(
      `WITH ranked_messages AS (
        SELECT customer_id, content AS last_message, timestamp AS last_activity, sender AS last_sender,
          ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY timestamp DESC, message_id DESC) AS rn
        FROM messages
      ),
      last_messages AS (
        SELECT customer_id, last_message, last_activity, last_sender
        FROM ranked_messages WHERE rn = 1
      ),
      ticket_stats AS (
        SELECT customer_id, COUNT(*) AS open_ticket_count,
          MIN(CASE
            WHEN priority = 'urgent' THEN 1
            WHEN priority = 'high' THEN 2
            WHEN priority = 'medium' THEN 3
            WHEN priority = 'low' THEN 4
            ELSE 5
          END) AS priority_weight
        FROM tickets
        WHERE status IN ('open', 'pending')
        GROUP BY customer_id
      )
      SELECT
        lm.customer_id, u.name AS customer_name, lm.last_message, lm.last_activity, lm.last_sender,
        COALESCE(ts.open_ticket_count, 0) AS open_ticket_count,
        CASE ts.priority_weight
          WHEN 1 THEN 'urgent' WHEN 2 THEN 'high' WHEN 3 THEN 'medium' WHEN 4 THEN 'low'
          ELSE NULL
        END AS worst_priority
      FROM last_messages lm
      JOIN users u ON u.id = lm.customer_id
      LEFT JOIN ticket_stats ts ON ts.customer_id = lm.customer_id
      ORDER BY
        CASE WHEN ts.priority_weight IS NOT NULL THEN 0 ELSE 1 END,
        ts.priority_weight,
        lm.last_activity DESC`
    )
    .all();

  return results;
}
