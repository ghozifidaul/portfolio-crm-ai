import { api } from "./client";
import type {
  LoginResponse,
  Ticket,
  Message,
  SendMessageResponse,
  DirectMessageResponse,
  ConversationSummary,
  DashboardStats,
} from "./types";

export async function login(
  username: string,
  password: string,
): Promise<LoginResponse> {
  return api("/api/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export async function getTicketsByStatus(status?: string): Promise<Ticket[]> {
  const qs = status ? `?status=${status}` : "";
  return api(`/api/tickets${qs}`);
}

export async function getTicketsByCustomerId(
  customerId: string,
): Promise<Ticket[]> {
  return api(`/api/tickets?customer_id=${customerId}`);
}

export async function getTicket(ticketId: string): Promise<Ticket> {
  return api(`/api/tickets/${ticketId}`);
}

export async function getMessages(
  customerId: string,
  limit = 50,
): Promise<Message[]> {
  return api(`/api/messages?customer_id=${customerId}&limit=${limit}`);
}

export async function getConversations(): Promise<ConversationSummary[]> {
  return api("/api/conversations");
}

export async function sendDirectMessage(
  customerId: string,
  content: string,
  sender: "customer" | "agent",
): Promise<DirectMessageResponse> {
  return api("/api/messages/direct", {
    method: "POST",
    body: JSON.stringify({ customer_id: customerId, content, sender }),
  });
}

export async function getMessagesSince(
  customerId: string,
  since: string,
): Promise<Message[]> {
  return api(`/api/messages?customer_id=${customerId}&since=${encodeURIComponent(since)}`);
}

export async function getDashboardStats(): Promise<DashboardStats> {
  return api("/api/dashboard/stats");
}

export async function sendMessage(
  customerId: string,
  content: string,
  sender: "customer" | "agent",
): Promise<SendMessageResponse> {
  return api("/api/messages", {
    method: "POST",
    body: JSON.stringify({ customer_id: customerId, content, sender }),
  });
}
