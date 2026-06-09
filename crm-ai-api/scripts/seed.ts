import pool from "../src/db/connection";

const users = [
  { id: "usr-001", username: "agent1", password: "password123", name: "Agus Setiawan", role: "agent" },
  { id: "usr-002", username: "budi", password: "password123", name: "Budi Santoso", role: "customer" },
  { id: "usr-003", username: "sari", password: "password123", name: "Sari Dewi", role: "customer" },
  { id: "usr-004", username: "dimas", password: "password123", name: "Dimas Prayogo", role: "customer" },
];

async function main() {
  for (const u of users) {
    const hash = await Bun.password.hash(u.password);
    await pool.query(
      `INSERT INTO users (id, username, password, name, role)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO UPDATE SET password = $3`,
      [u.id, u.username, hash, u.name, u.role]
    );
  }
  console.log("Users seeded");

  const budi = await pool.query("SELECT id FROM users WHERE username = 'budi'");
  const customerId = budi.rows[0].id;

  const agent = await pool.query("SELECT id FROM users WHERE username = 'agent1'");
  const agentId = agent.rows[0].id;

  const ticket1 = await pool.query(
    `INSERT INTO tickets (customer_id, category, priority, status, summary, entities, tags, assigned_to)
     VALUES ($1, 'billing', 'high', 'open', 'Customer reports possible double charge on their account.', '{}', '{double-charge}', $2)
     ON CONFLICT (ticket_id) DO NOTHING
     RETURNING ticket_id`,
    [customerId, agentId]
  );

  if (ticket1.rows.length > 0) {
    const tktId = ticket1.rows[0].ticket_id;
    await pool.query(
      `INSERT INTO messages (customer_id, ticket_id, sender, content, ai_action_taken)
       VALUES ($1, $2, 'customer', 'Halo, saya ada masalah dengan tagihan bulan ini. Sepertinya ada double charge.', 'create')`,
      [customerId, tktId]
    );
    await pool.query(
      `INSERT INTO messages (customer_id, ticket_id, sender, content, ai_action_taken)
       VALUES ($1, $2, 'agent', 'Halo! Saya bantu cek sekarang ya. Boleh saya tahu invoice nomor berapa yang dimaksud?', 'update')`,
      [customerId, tktId]
    );
    console.log(`Ticket ${tktId} created with 2 messages`);
  }

  const ticket2 = await pool.query(
    `INSERT INTO tickets (customer_id, category, priority, status, summary, entities, tags, assigned_to)
     VALUES ($1, 'technical', 'medium', 'open', 'Customer unable to log in after password reset.', '{}', '{login,password-reset}', $2)
     ON CONFLICT (ticket_id) DO NOTHING
     RETURNING ticket_id`,
    [customerId, agentId]
  );

  if (ticket2.rows.length > 0) {
    const tktId = ticket2.rows[0].ticket_id;
    await pool.query(
      `INSERT INTO messages (customer_id, ticket_id, sender, content, ai_action_taken)
       VALUES ($1, $2, 'customer', 'Saya tidak bisa login setelah reset password.', 'create')`,
      [customerId, tktId]
    );
    console.log(`Ticket ${tktId} created with 1 message`);
  }

  console.log("Seed completed");
  await pool.end();
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
