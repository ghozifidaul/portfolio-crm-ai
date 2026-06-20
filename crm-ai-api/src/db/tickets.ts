import { nextTicketId } from "./ticket-id";
import type { DbTicket } from "../types/db";
import type { CreateTicketFields, UpdateTicketFields } from "../types/api";

function parseTicket(row: Record<string, unknown>): DbTicket {
  return {
    ticket_id: row.ticket_id as string,
    customer_id: row.customer_id as string,
    customer_name: row.customer_name as string | undefined,
    channel: row.channel as string,
    category: row.category as string,
    priority: row.priority as string,
    status: row.status as string,
    assigned_to: (row.assigned_to as string | null) ?? null,
    summary: row.summary as string,
    entities: JSON.parse((row.entities as string) ?? "[]"),
    tags: JSON.parse((row.tags as string) ?? "[]"),
    csat_score: (row.csat_score as number | null) ?? null,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
    resolved_at: (row.resolved_at as string | null) ?? null,
  };
}

const TICKET_SELECT = `
  SELECT t.*, u.name AS customer_name
  FROM tickets t
  JOIN users u ON u.id = t.customer_id
`;

export async function createTicket(
  db: D1Database,
  customerId: string,
  fields: CreateTicketFields
): Promise<DbTicket> {
  const ticketId = await nextTicketId(db);
  const entities = JSON.stringify(fields.entities);
  const tags = JSON.stringify(fields.tags);

  await db
    .prepare(
      "INSERT INTO tickets (ticket_id, customer_id, category, priority, status, summary, entities, tags) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)"
    )
    .bind(ticketId, customerId, fields.category, fields.priority, fields.status, fields.summary, entities, tags)
    .run();

  const row = await db
    .prepare(`${TICKET_SELECT} WHERE t.ticket_id = ?1`)
    .bind(ticketId)
    .first<Record<string, unknown>>();

  return parseTicket(row!);
}

export async function updateTicket(
  db: D1Database,
  ticketId: string,
  fields: UpdateTicketFields
): Promise<DbTicket | null> {
  const sets: string[] = [];
  const params: unknown[] = [];
  let i = 1;

  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined) {
      sets.push(`${key} = ?${i++}`);
      params.push(key === "entities" || key === "tags" ? JSON.stringify(value) : value);
    }
  }

  if (sets.length === 0) {
    return getTicketById(db, ticketId);
  }

  sets.push("updated_at = datetime('now')");
  params.push(ticketId);

  await db.prepare(`UPDATE tickets SET ${sets.join(", ")} WHERE ticket_id = ?${i}`).bind(...params).run();

  const row = await db
    .prepare(`${TICKET_SELECT} WHERE t.ticket_id = ?1`)
    .bind(ticketId)
    .first<Record<string, unknown>>();

  return row ? parseTicket(row) : null;
}

export async function getTicketById(db: D1Database, ticketId: string): Promise<DbTicket | null> {
  const row = await db.prepare(`${TICKET_SELECT} WHERE t.ticket_id = ?1`).bind(ticketId).first<Record<string, unknown>>();
  return row ? parseTicket(row) : null;
}

export async function getTicketsByCustomer(
  db: D1Database,
  customerId: string,
  status?: string
): Promise<DbTicket[]> {
  let rows: Record<string, unknown>[];
  if (status) {
    rows = (await db
      .prepare(`${TICKET_SELECT} WHERE t.customer_id = ?1 AND t.status = ?2 ORDER BY t.created_at DESC`)
      .bind(customerId, status)
      .all()).results as Record<string, unknown>[];
  } else {
    rows = (await db
      .prepare(`${TICKET_SELECT} WHERE t.customer_id = ?1 ORDER BY t.created_at DESC`)
      .bind(customerId)
      .all()).results as Record<string, unknown>[];
  }
  return rows.map(parseTicket);
}

export async function getOpenTickets(db: D1Database, customerId: string): Promise<DbTicket[]> {
  const rows = (await db
    .prepare(
      `${TICKET_SELECT} WHERE t.customer_id = ?1 AND t.status IN ('open', 'pending') ORDER BY t.created_at DESC`
    )
    .bind(customerId)
    .all()).results as Record<string, unknown>[];
  return rows.map(parseTicket);
}

export async function getAllTickets(db: D1Database, status?: string): Promise<DbTicket[]> {
  let rows: Record<string, unknown>[];
  if (status) {
    rows = (await db
      .prepare(`${TICKET_SELECT} WHERE t.status = ?1 ORDER BY t.priority DESC, t.created_at DESC`)
      .bind(status)
      .all()).results as Record<string, unknown>[];
  } else {
    rows = (await db
      .prepare(`${TICKET_SELECT} ORDER BY t.priority DESC, t.created_at DESC`)
      .all()).results as Record<string, unknown>[];
  }
  return rows.map(parseTicket);
}

export async function getDashboardStats(db: D1Database) {
  const byStatus = (await db.prepare("SELECT status, COUNT(*) AS count FROM tickets GROUP BY status").all()).results;
  const byPriority = (
    await db
      .prepare("SELECT priority, COUNT(*) AS count FROM tickets WHERE status IN ('open', 'pending') GROUP BY priority")
      .all()
  ).results;

  const recentRows = (await db.prepare(`${TICKET_SELECT} ORDER BY t.updated_at DESC LIMIT 10`).all())
    .results as Record<string, unknown>[];
  const recentTickets = recentRows.map(parseTicket);

  const msgCountResult = (await db.prepare("SELECT COUNT(*) AS count FROM messages").first()) as { count: number } | null;
  const activeResult = (await db
    .prepare(
      "SELECT COUNT(DISTINCT customer_id) AS count FROM messages WHERE timestamp > datetime('now', '-24 hours')"
    )
    .first()) as { count: number } | null;

  return {
    byStatus,
    byPriority,
    recentTickets,
    totalMessages: msgCountResult?.count ?? 0,
    activeConversations: activeResult?.count ?? 0,
  };
}

export async function resolveTicket(db: D1Database, ticketId: string): Promise<DbTicket | null> {
  await db
    .prepare(
      "UPDATE tickets SET status = 'resolved', resolved_at = datetime('now'), updated_at = datetime('now') WHERE ticket_id = ?1"
    )
    .bind(ticketId)
    .run();

  const row = await db
    .prepare(`${TICKET_SELECT} WHERE t.ticket_id = ?1`)
    .bind(ticketId)
    .first<Record<string, unknown>>();

  return row ? parseTicket(row) : null;
}
