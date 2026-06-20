import bcrypt from "bcryptjs";
import type { DbUser } from "../types/db";

export async function findByUsername(db: D1Database, username: string): Promise<DbUser | null> {
  return db.prepare("SELECT * FROM users WHERE username = ?1").bind(username).first<DbUser>();
}

export async function findById(db: D1Database, id: string): Promise<DbUser | null> {
  return db.prepare("SELECT * FROM users WHERE id = ?1").bind(id).first<DbUser>();
}

export async function createUser(
  db: D1Database,
  data: {
    id: string;
    username: string;
    password: string;
    name: string;
    role: string;
  }
): Promise<DbUser> {
  const hash = await bcrypt.hash(data.password, 10);
  await db
    .prepare("INSERT INTO users (id, username, password, name, role) VALUES (?1, ?2, ?3, ?4, ?5)")
    .bind(data.id, data.username, hash, data.name, data.role)
    .run();
  return (await findById(db, data.id))!;
}
