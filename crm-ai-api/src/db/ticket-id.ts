export async function nextTicketId(db: D1Database): Promise<string> {
  const [_, result] = await db.batch([
    db.prepare("UPDATE ticket_counter SET next_id = next_id + 1 WHERE id = 1"),
    db.prepare("SELECT next_id - 1 AS seq FROM ticket_counter WHERE id = 1"),
  ]);

  const seq = (result as any).results[0].seq as number;
  return `TKT-${String(seq).padStart(4, "0")}`;
}
