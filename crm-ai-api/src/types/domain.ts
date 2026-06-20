export interface AITicket {
  ticket_id: string;
  category: string;
  priority: string;
  status: string;
  summary: string;
  entities: string[];
  tags: string[];
  created_at: string;
}

export interface ConversationEntry {
  role: string;
  content: string;
  timestamp: string;
}

export interface ConversationSummary {
  customer_id: string;
  customer_name: string;
  last_message: string;
  last_activity: string;
  last_sender: string;
  open_ticket_count: number;
  worst_priority: string | null;
}

export interface AIResponse {
  action: string;
  ticket_id: string | null;
  match_confidence: number;
  reasoning: string;
  fields: {
    category: string;
    priority: string;
    status: string;
    summary: string;
    entities: string[];
    tags: string[];
  };
  resolution_detected: boolean;
}
