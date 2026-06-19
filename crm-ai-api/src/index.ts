import { Hono } from "hono";
import { cors } from "hono/cors";
import { sign, jwt } from "hono/jwt";
import bcrypt from "bcryptjs";
import { getDb } from "./db/connection";
import {
  findByUsername,
  getTicketsByCustomer,
  getAllTickets,
  getTicketById,
  getMessagesByTicket,
  getConversationHistory,
  getMessagesSince,
  getConversations,
  getDashboardStats,
} from "./db";
import { storeMessage, processInBackground, processMessage } from "./message-router";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-in-production";

const app = new Hono();

app.use("/api/*", cors());
const authenticate = jwt({ secret: JWT_SECRET, alg: "HS256" });

app.get("/", (c) => c.text("Hello Hono!"));

app.post("/api/login", async (c) => {
  const { username, password } = await c.req.json();

  if (!username || !password) {
    return c.json({ error: "Username and password are required" }, 400);
  }

  const db = getDb(c);
  const user = await findByUsername(db, username);
  if (!user) {
    return c.json({ error: "Invalid username or password" }, 401);
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return c.json({ error: "Invalid username or password" }, 401);
  }

  const payload = {
    sub: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
  };

  const token = await sign(payload, JWT_SECRET);

  return c.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
    },
  });
});

app.post("/api/messages", authenticate, async (c) => {
  const { customer_id, content, sender } = await c.req.json();

  if (!customer_id || !content || !sender) {
    return c.json({ error: "customer_id, content, and sender are required" }, 400);
  }

  if (sender !== "customer" && sender !== "agent") {
    return c.json({ error: 'sender must be "customer" or "agent"' }, 400);
  }

  try {
    const result = await processMessage(getDb(c), customer_id, content, sender);
    return c.json(result);
  } catch (err: any) {
    return c.json({ error: err.message }, err.status || 500);
  }
});

app.post("/api/messages/direct", authenticate, async (c) => {
  const { customer_id, content, sender } = await c.req.json();
  const payload = c.get("jwtPayload") as { sub?: string; role?: string };

  if (!customer_id || !content || !sender) {
    return c.json({ error: "customer_id, content, and sender are required" }, 400);
  }

  if (sender !== "customer" && sender !== "agent") {
    return c.json({ error: 'sender must be "customer" or "agent"' }, 400);
  }

  if (sender === "customer" && payload.sub !== customer_id) {
    return c.json({ error: "Customers can only send messages as themselves" }, 403);
  }

  if (sender === "agent" && payload.role !== "agent") {
    return c.json({ error: "Only agents can send messages as agent" }, 403);
  }

  try {
    const db = getDb(c);
    const message = await storeMessage(db, customer_id, content, sender);
    c.executionCtx.waitUntil(
      processInBackground(db, customer_id, message.message_id, content)
    );
    return c.json({ message });
  } catch (err: any) {
    return c.json({ error: err.message }, err.status || 500);
  }
});

app.get("/api/messages", authenticate, async (c) => {
  const customerId = c.req.query("customer_id");
  const limit = parseInt(c.req.query("limit") || "50", 10);
  const since = c.req.query("since");

  if (!customerId) {
    return c.json({ error: "customer_id query parameter is required" }, 400);
  }

  const db = getDb(c);
  const messages = since
    ? await getMessagesSince(db, customerId, since)
    : await getConversationHistory(db, customerId, limit);
  return c.json(messages);
});

app.get("/api/tickets", authenticate, async (c) => {
  const customerId = c.req.query("customer_id");
  const status = c.req.query("status");

  const db = getDb(c);
  const tickets = customerId
    ? await getTicketsByCustomer(db, customerId, status)
    : await getAllTickets(db, status);

  return c.json(tickets);
});

app.get("/api/conversations", authenticate, async (c) => {
  const payload = c.get("jwtPayload") as { role?: string };
  if (payload.role !== "agent") {
    return c.json({ error: "Forbidden" }, 403);
  }

  const conversations = await getConversations(getDb(c));
  return c.json(conversations);
});

app.get("/api/dashboard/stats", authenticate, async (c) => {
  const payload = c.get("jwtPayload") as { role?: string };
  if (payload.role !== "agent") {
    return c.json({ error: "Forbidden" }, 403);
  }

  const stats = await getDashboardStats(getDb(c));
  return c.json(stats);
});

app.get("/api/tickets/:id", authenticate, async (c) => {
  const ticketId = c.req.param("id");
  const db = getDb(c);
  const ticket = await getTicketById(db, ticketId);

  if (!ticket) {
    return c.json({ error: "Ticket not found" }, 404);
  }

  const messages = await getMessagesByTicket(db, ticketId);
  return c.json({ ...ticket, messages });
});

export default app;
