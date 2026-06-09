export interface DbUser {
  id: string;
  username: string;
  password: string;
  name: string;
  role: string;
}

export interface DbTicket {
  ticket_id: string;
  customer_id: string;
  customer_name?: string;
  channel: string;
  category: string;
  priority: string;
  status: string;
  assigned_to: string | null;
  summary: string;
  entities: string[];
  tags: string[];
  csat_score: number | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
}

export interface DbMessage {
  message_id: string;
  customer_id: string;
  ticket_id: string | null;
  sender: string;
  content: string;
  channel: string;
  timestamp: string;
  ai_action_taken: string | null;
}

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
