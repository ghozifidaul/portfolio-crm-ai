import pool from "./connection";
import type { DbMessage } from "./schema";

export async function addMessage(
  customerId: string,
  ticketId: string | null,
  sender: string,
  content: string,
  aiAction: string | null
): Promise<DbMessage> {
  const { rows } = await pool.query(
    `INSERT INTO messages (customer_id, ticket_id, sender, content, ai_action_taken)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [customerId, ticketId, sender, content, aiAction]
  );
  return rows[0];
}

export async function updateMessageTicket(
  messageId: string,
  ticketId: string | null,
  aiAction: string
): Promise<DbMessage | null> {
  const { rows } = await pool.query(
    `UPDATE messages SET ticket_id = $2, ai_action_taken = $3
     WHERE message_id = $1 RETURNING *`,
    [messageId, ticketId, aiAction]
  );
  return rows[0] ?? null;
}

export async function getConversationHistory(
  customerId: string,
  limit = 50
): Promise<DbMessage[]> {
  const { rows } = await pool.query(
    "SELECT * FROM messages WHERE customer_id = $1 ORDER BY timestamp ASC LIMIT $2",
    [customerId, limit]
  );
  return rows;
}

export async function getMessagesSince(
  customerId: string,
  since: string
): Promise<DbMessage[]> {
  const { rows } = await pool.query(
    "SELECT * FROM messages WHERE customer_id = $1 AND timestamp > $2 ORDER BY timestamp ASC",
    [customerId, since]
  );
  return rows;
}

export async function getMessagesByTicket(ticketId: string): Promise<DbMessage[]> {
  const { rows } = await pool.query(
    "SELECT * FROM messages WHERE ticket_id = $1 ORDER BY timestamp ASC",
    [ticketId]
  );
  return rows;
}

export async function getConversations() {
  const { rows } = await pool.query(`
    WITH last_messages AS (
      SELECT DISTINCT ON (customer_id)
        customer_id,
        content AS last_message,
        timestamp AS last_activity,
        sender AS last_sender
      FROM messages
      ORDER BY customer_id, timestamp DESC
    ),
    ticket_stats AS (
      SELECT
        customer_id,
        COUNT(*) AS open_ticket_count,
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
      lm.customer_id,
      u.name AS customer_name,
      lm.last_message,
      lm.last_activity,
      lm.last_sender,
      COALESCE(ts.open_ticket_count, 0) AS open_ticket_count,
      CASE ts.priority_weight
        WHEN 1 THEN 'urgent'
        WHEN 2 THEN 'high'
        WHEN 3 THEN 'medium'
        WHEN 4 THEN 'low'
        ELSE NULL
      END AS worst_priority
    FROM last_messages lm
    JOIN users u ON u.id = lm.customer_id
    LEFT JOIN ticket_stats ts ON ts.customer_id = lm.customer_id
    ORDER BY
      CASE WHEN ts.priority_weight IS NOT NULL THEN 0 ELSE 1 END,
      ts.priority_weight NULLS LAST,
      lm.last_activity DESC
  `);
  return rows;
}
