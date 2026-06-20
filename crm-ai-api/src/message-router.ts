import { classifyMessage } from "./ai-service";
import { findById } from "./db/users";
import { createTicket, updateTicket, getOpenTickets, resolveTicket } from "./db/tickets";
import { addMessage, updateMessageTicket, getConversationHistory } from "./db/messages";
import type { AITicket, ConversationEntry } from "./types/domain";
import type { DbMessage } from "./types/db";
import type { MessageRouterResult, TicketResponse } from "./types/api";

export async function storeMessage(
  db: D1Database,
  customerId: string,
  content: string,
  sender: "customer" | "agent"
): Promise<DbMessage> {
  const customer = await findById(db, customerId);
  if (!customer) {
    throw Object.assign(new Error("Customer not found"), { status: 404 });
  }

  return await addMessage(db, customerId, null, sender, content, null);
}

export async function processInBackground(
  db: D1Database,
  customerId: string,
  messageId: string,
  content: string
): Promise<void> {
  try {
    const dbMessages = await getConversationHistory(db, customerId);
    const history: ConversationEntry[] = dbMessages.map((m) => ({
      role: m.sender === "system" ? "system" : m.sender,
      content: m.content,
      timestamp: m.timestamp,
    }));

    const openDbTickets = await getOpenTickets(db, customerId);
    const openTickets: AITicket[] = openDbTickets.map((t) => ({
      ticket_id: t.ticket_id,
      category: t.category,
      priority: t.priority,
      status: t.status,
      summary: t.summary,
      entities: t.entities,
      tags: t.tags,
      created_at: t.created_at,
    }));

    const aiResponse = await classifyMessage(openTickets, history, content);
    if (!aiResponse) {
      console.error("Background AI: classifyMessage returned null");
      return;
    }

    switch (aiResponse.action) {
      case "create": {
        const ticket = await createTicket(db, customerId, aiResponse.fields);
        await updateMessageTicket(db, messageId, ticket.ticket_id, "create");
        break;
      }

      case "update": {
        if (!aiResponse.ticket_id) {
          console.error("Background AI: update action without ticket_id");
          return;
        }
        await updateTicket(db, aiResponse.ticket_id, {
          category: aiResponse.fields.category,
          priority: aiResponse.fields.priority,
          status: aiResponse.fields.status,
          summary: aiResponse.fields.summary,
          entities: aiResponse.fields.entities,
          tags: aiResponse.fields.tags,
        });
        await updateMessageTicket(db, messageId, aiResponse.ticket_id, "update");

        if (aiResponse.resolution_detected) {
          await resolveTicket(db, aiResponse.ticket_id);
        }
        break;
      }

      case "no_action": {
        await updateMessageTicket(db, messageId, null, "no_action");
        break;
      }

      default:
        console.error(`Background AI: unknown action ${aiResponse.action}`);
    }
  } catch (err) {
    console.error("Background AI processing failed:", err);
  }
}

export async function processMessage(
  db: D1Database,
  customerId: string,
  content: string,
  sender: "customer" | "agent"
): Promise<MessageRouterResult> {
  const customer = await findById(db, customerId);
  if (!customer) {
    throw Object.assign(new Error("Customer not found"), { status: 404 });
  }

  const dbMessages = await getConversationHistory(db, customerId);
  const history: ConversationEntry[] = dbMessages.map((m) => ({
    role: m.sender === "system" ? "system" : m.sender,
    content: m.content,
    timestamp: m.timestamp,
  }));

  const openDbTickets = await getOpenTickets(db, customerId);
  const openTickets: AITicket[] = openDbTickets.map((t) => ({
    ticket_id: t.ticket_id,
    category: t.category,
    priority: t.priority,
    status: t.status,
    summary: t.summary,
    entities: t.entities,
    tags: t.tags,
    created_at: t.created_at,
  }));

  const aiResponse = await classifyMessage(openTickets, history, content);
  if (!aiResponse) {
    throw Object.assign(new Error("AI service returned no response"), { status: 503 });
  }

  switch (aiResponse.action) {
    case "create": {
      const ticket = await createTicket(db, customerId, aiResponse.fields);
      await addMessage(db, customerId, ticket.ticket_id, sender, content, "create");
      return { action: "create", ticket: serializeTicket(ticket), ai_response: aiResponse };
    }

    case "update": {
      if (!aiResponse.ticket_id) {
        throw Object.assign(new Error("AI returned update action without ticket_id"), { status: 400 });
      }
      const updated = await updateTicket(db, aiResponse.ticket_id, {
        category: aiResponse.fields.category,
        priority: aiResponse.fields.priority,
        status: aiResponse.fields.status,
        summary: aiResponse.fields.summary,
        entities: aiResponse.fields.entities,
        tags: aiResponse.fields.tags,
      });
      if (!updated) {
        throw Object.assign(new Error(`Ticket ${aiResponse.ticket_id} not found`), { status: 400 });
      }
      await addMessage(db, customerId, aiResponse.ticket_id, sender, content, "update");

      if (aiResponse.resolution_detected) {
        const resolved = await resolveTicket(db, aiResponse.ticket_id);
        return { action: "update", ticket: serializeTicket(resolved!), ai_response: aiResponse };
      }

      return { action: "update", ticket: serializeTicket(updated), ai_response: aiResponse };
    }

    case "no_action": {
      await addMessage(db, customerId, null, sender, content, "no_action");
      return { action: "no_action", ticket: null, ai_response: aiResponse };
    }

    default:
      throw Object.assign(new Error(`Unknown AI action: ${aiResponse.action}`), { status: 500 });
  }
}

function serializeTicket(t: TicketResponse) {
  return {
    ticket_id: t.ticket_id,
    customer_id: t.customer_id,
    category: t.category,
    priority: t.priority,
    status: t.status,
    summary: t.summary,
    entities: t.entities,
    tags: t.tags,
    created_at: t.created_at,
    updated_at: t.updated_at,
    resolved_at: t.resolved_at,
  };
}
