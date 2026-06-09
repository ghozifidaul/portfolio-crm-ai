import { readFileSync } from "fs";
import { resolve } from "path";
import pool from "../src/db/connection";

async function main() {
  const { rows } = await pool.query(
    `SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'tickets')`
  );

  if (rows[0].exists) {
    console.log("Tables already exist, skipping migration");
    await pool.end();
    return;
  }

  const sql = readFileSync(resolve("migrations/001_initial.sql"), "utf8");
  await pool.query(sql);
  console.log("Migration completed");
  await pool.end();
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
