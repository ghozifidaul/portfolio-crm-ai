import pool from "./connection";
import type { DbUser } from "./schema";

export async function findByUsername(username: string): Promise<DbUser | null> {
  const { rows } = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
  return rows[0] ?? null;
}

export async function findById(id: string): Promise<DbUser | null> {
  const { rows } = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
  return rows[0] ?? null;
}

export async function createUser(data: {
  id: string;
  username: string;
  password: string;
  name: string;
  role: string;
}): Promise<DbUser> {
  const hash = await Bun.password.hash(data.password);
  const { rows } = await pool.query(
    `INSERT INTO users (id, username, password, name, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [data.id, data.username, hash, data.name, data.role]
  );
  return rows[0];
}
