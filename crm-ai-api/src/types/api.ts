import type { AIResponse } from "./domain";

export interface CreateTicketFields {
  category: string;
  priority: string;
  status: string;
  summary: string;
  entities: string[];
  tags: string[];
}

export interface UpdateTicketFields {
  category?: string;
  priority?: string;
  status?: string;
  summary?: string;
  entities?: string[];
  tags?: string[];
}

export interface TicketResponse {
  ticket_id: string;
  customer_id: string;
  category: string;
  priority: string;
  status: string;
  summary: string;
  entities: string[];
  tags: string[];
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
}

export interface MessageRouterResult {
  action: string;
  ticket: TicketResponse | null;
  ai_response: AIResponse;
}
