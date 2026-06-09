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

export async function getMessagesByTicket(ticketId: string): Promise<DbMessage[]> {
  const { rows } = await pool.query(
    "SELECT * FROM messages WHERE ticket_id = $1 ORDER BY timestamp ASC",
    [ticketId]
  );
  return rows;
}
