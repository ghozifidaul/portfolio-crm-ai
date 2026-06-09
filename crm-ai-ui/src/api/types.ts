export interface LoginResponse {
  token: string
  user: { id: string; username: string; name: string; role: string }
}

export interface Ticket {
  ticket_id: string
  customer_id: string
  channel: string
  category: string
  priority: string
  status: string
  assigned_to: string | null
  summary: string
  entities: string[]
  tags: string[]
  csat_score: number | null
  created_at: string
  updated_at: string
  resolved_at: string | null
  messages?: Message[]
}

export interface Message {
  message_id: string
  customer_id: string
  ticket_id: string | null
  sender: string
  content: string
  channel: string
  timestamp: string
  ai_action_taken: string | null
}

export interface SendMessageResponse {
  action: string
  ticket: Ticket | null
  ai_response: unknown
}
