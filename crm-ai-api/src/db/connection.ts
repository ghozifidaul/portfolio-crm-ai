import type { Context } from "hono";

export function getDb(c: Context): D1Database {
  return c.env.DB;
}
