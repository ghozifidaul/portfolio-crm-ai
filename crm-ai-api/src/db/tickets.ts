import pool from "./connection";
import type { DbTicket } from "./schema";

export async function createTicket(
  customerId: string,
  fields: {
    category: string;
    priority: string;
    status: string;
    summary: string;
    entities: string[];
    tags: string[];
  }
): Promise<DbTicket> {
  const { rows } = await pool.query(
    `INSERT INTO tickets (customer_id, category, priority, status, summary, entities, tags)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      customerId,
      fields.category,
      fields.priority,
      fields.status,
      fields.summary,
      fields.entities,
      fields.tags,
    ]
  );
  return rows[0];
}

export async function updateTicket(
  ticketId: string,
  fields: {
    category?: string;
    priority?: string;
    status?: string;
    summary?: string;
    entities?: string[];
    tags?: string[];
  }
): Promise<DbTicket | null> {
  const sets: string[] = [];
  const params: unknown[] = [];
  let i = 1;

  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined) {
      sets.push(`${key} = $${i++}`);
      params.push(value);
    }
  }

  if (sets.length === 0) {
    return getTicketById(ticketId);
  }

  sets.push(`updated_at = NOW()`);
  params.push(ticketId);

  const { rows } = await pool.query(
    `UPDATE tickets SET ${sets.join(", ")} WHERE ticket_id = $${i} RETURNING *`,
    params
  );
  return rows[0] ?? null;
}

export async function getTicketById(ticketId: string): Promise<DbTicket | null> {
  const { rows } = await pool.query(
    `${TICKET_SELECT} WHERE t.ticket_id = $1`,
    [ticketId]
  );
  return rows[0] ?? null;
}

export async function getTicketsByCustomer(
  customerId: string,
  status?: string
): Promise<DbTicket[]> {
  if (status) {
    const { rows } = await pool.query(
      `${TICKET_SELECT} WHERE t.customer_id = $1 AND t.status = $2 ORDER BY t.created_at DESC`,
      [customerId, status]
    );
    return rows;
  }
  const { rows } = await pool.query(
    `${TICKET_SELECT} WHERE t.customer_id = $1 ORDER BY t.created_at DESC`,
    [customerId]
  );
  return rows;
}

export async function getOpenTickets(customerId: string): Promise<DbTicket[]> {
  const { rows } = await pool.query(
    `${TICKET_SELECT} WHERE t.customer_id = $1 AND t.status IN ('open', 'pending') ORDER BY t.created_at DESC`,
    [customerId]
  );
  return rows;
}

const TICKET_SELECT = `
  SELECT t.*, u.name AS customer_name
  FROM tickets t
  JOIN users u ON u.id = t.customer_id
`

export async function getAllTickets(status?: string): Promise<DbTicket[]> {
  if (status) {
    const { rows } = await pool.query(
      `${TICKET_SELECT} WHERE t.status = $1 ORDER BY t.priority DESC, t.created_at DESC`,
      [status]
    );
    return rows;
  }
  const { rows } = await pool.query(
    `${TICKET_SELECT} ORDER BY t.priority DESC, t.created_at DESC`
  );
  return rows;
}

export async function resolveTicket(ticketId: string): Promise<DbTicket | null> {
  const { rows } = await pool.query(
    `UPDATE tickets SET status = 'resolved', resolved_at = NOW(), updated_at = NOW()
     WHERE ticket_id = $1 RETURNING *`,
    [ticketId]
  );
  return rows[0] ?? null;
}
