import bcrypt from "bcryptjs";

const users = [
  { id: "usr-001", username: "agent1", password: "password123", name: "Agus Setiawan", role: "agent" },
  { id: "usr-002", username: "budi", password: "password123", name: "Budi Santoso", role: "customer" },
  { id: "usr-003", username: "sari", password: "password123", name: "Sari Dewi", role: "customer" },
  { id: "usr-004", username: "dimas", password: "password123", name: "Dimas Prayogo", role: "customer" },
];

async function main() {
  const lines: string[] = [];

  for (const u of users) {
    const hash = await bcrypt.hash(u.password, 10);
    const escaped = hash.replace(/'/g, "''");
    lines.push(
      `INSERT INTO users (id, username, password, name, role) VALUES ('${u.id}', '${u.username}', '${escaped}', '${u.name}', '${u.role}');`
    );
  }

  lines.push("");
  lines.push("UPDATE ticket_counter SET next_id = 1002;");
  lines.push("");
  lines.push(
    `INSERT INTO tickets (ticket_id, customer_id, category, priority, status, summary, entities, tags, assigned_to) VALUES ('TKT-1000', 'usr-002', 'billing', 'high', 'open', 'Customer reports possible double charge on their account.', '[]', '["double-charge"]', 'usr-001');`
  );
  lines.push(
    `INSERT INTO messages (message_id, customer_id, ticket_id, sender, content, ai_action_taken) VALUES ('${crypto.randomUUID()}', 'usr-002', 'TKT-1000', 'customer', 'Halo, saya ada masalah dengan tagihan bulan ini. Sepertinya ada double charge.', 'create');`
  );
  lines.push(
    `INSERT INTO messages (message_id, customer_id, ticket_id, sender, content, ai_action_taken) VALUES ('${crypto.randomUUID()}', 'usr-002', 'TKT-1000', 'agent', 'Halo! Saya bantu cek sekarang ya. Boleh saya tahu invoice nomor berapa yang dimaksud?', 'update');`
  );
  lines.push("");
  lines.push(
    `INSERT INTO tickets (ticket_id, customer_id, category, priority, status, summary, entities, tags, assigned_to) VALUES ('TKT-1001', 'usr-002', 'technical', 'medium', 'open', 'Customer unable to log in after password reset.', '[]', '["login","password-reset"]', 'usr-001');`
  );
  lines.push(
    `INSERT INTO messages (message_id, customer_id, ticket_id, sender, content, ai_action_taken) VALUES ('${crypto.randomUUID()}', 'usr-002', 'TKT-1001', 'customer', 'Saya tidak bisa login setelah reset password.', 'create');`
  );

  await Bun.write("scripts/seed.sql", lines.join("\n"));
  console.log("Generated scripts/seed.sql");
}

main().catch((err) => {
  console.error("Seed generation failed:", err);
  process.exit(1);
});
