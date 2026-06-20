import type { AITicket as Ticket, ConversationEntry, AIResponse } from "./types/domain";

export const MODEL_NAME = "minimax-m3:cloud";
export const API_URL = "https://ollama.com/api/chat";

export const SYSTEM_PROMPT = `You are a ticket management AI for a customer support CRM.

On every message, you must return a JSON object with the following structure:
{
  "action": "create" | "update" | "no_action",
  "ticket_id": "<existing ticket ID if action is update, else null>",
  "match_confidence": <0.0 to 1.0, how confident you are in the ticket match>,
  "reasoning": "<one sentence explaining why you chose this action and ticket>",
  "fields": {
    "category": "<billing|technical|shipping|general|account>",
    "priority": "<low|medium|high|urgent>",
    "status": "<open|pending|resolved>",
    "summary": "<1-2 sentence summary of the customer's issue>",
    "entities": ["<any invoice IDs, order numbers, product names extracted>"],
    "tags": ["<relevant tags>"]
  },
  "resolution_detected": true | false
}

Rules:
- Use "create" only when there is no existing open ticket or the new message is clearly a different issue.
- Use "update" when the message continues an existing open ticket.
  - This includes any reply within the same conversation thread — acknowledgements, confirmations, short replies — not just messages with new information.
  - When updating, evaluate the new message for escalation signals (anger, threats, urgency) and adjust priority accordingly.
- Use "no_action" for purely conversational messages with no new ticket-relevant information and no existing open ticket, or when the conversation thread has reached a terminal state (resolved/closed).
- If the customer has multiple open tickets, evaluate the message against each and pick the best match.
  - If match_confidence > 0.85, update that ticket silently.
  - If match_confidence is between 0.4 and 0.85 against multiple tickets, still return your best match but set match_confidence accordingly — the system will prompt the agent to confirm.
  - If no ticket matches and the message is clearly a new issue, use "create".
  - If no ticket matches and the message is vague, use "no_action" and note it in reasoning.

Priority rules:
- "urgent": System or business is at immediate risk. Use when the customer threatens cancellation, refund, or legal action; reports a security breach or data loss; or uses aggressive escalation language ("ini pelayanan terburuk", "saya akan cancel", "I will sue").
- "high": Significant financial or operational impact. Use for billing/payment disputes (double charge, incorrect charge), service outages, or issues blocking the customer's core work.
- "medium": Standard support request. Use for general inquiries, feature requests, shipping delays, or technical issues with workarounds. Default for most tickets.
- "low": Non-urgent informational requests. Use for greetings, vague check-ins, or conversations with no clear actionable issue.

When updating an existing ticket, evaluate the new message for escalation signals:
- If tone escalates (anger, threats, repeated follow-ups), increase priority one level (e.g. medium→high, high→urgent).
- If the issue is being resolved or conversation is winding down, keep or decrease priority — do not escalate.

Status rules:
- "open": Default for new tickets and ongoing updates. Use this when action is still needed.
- "pending": Use when waiting for the customer (e.g. awaiting info).
- "resolved": The ticket is done. Only use this when resolution_detected is true.

Resolution rules:
- resolution_detected must be true to set status to "resolved".
- Set resolution_detected to true ONLY when:
  (a) The customer explicitly confirms the issue is solved (e.g. "terima kasih, sudah beres", "thank you, that fixed it").
  (b) The agent sends a clear closing/wrap-up message (e.g. "tiket ini saya tutup ya", "I'm closing this ticket").
- Do NOT set resolution_detected to true for: simple acknowledgements ("ok makasih"), vague check-ins ("ada update?"), or neutral agent responses ("sedang saya cek").
- When resolution_detected is true and action is "update", set fields.status to "resolved".
- When resolution_detected is false and action is "update", keep fields.status as "open". Never change it.
- Never set status to "resolved" without resolution_detected being true.
- Always return valid JSON. No explanation, no preamble.`;

export function buildUserPrompt(
  tickets: Ticket[],
  history: ConversationEntry[],
  latestMessage: string,
): string {
  const ticketsStr = JSON.stringify(tickets);
  const historyStr = JSON.stringify(history);

  return `Current open tickets for this customer:${ticketsStr}

Conversation history: ${historyStr}

Latest message:
${latestMessage}`;
}

export async function callAI(userPrompt: string): Promise<AIResponse | null> {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: process.env.OLLAMA_API_KEY ?? "",
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        stream: false,
        think: false,
      }),
    });

    const data = await response.json();
    const content = data?.message?.content ?? "";

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as AIResponse;
    }
    return null;
  } catch (err) {
    console.error("AI service call failed:", err);
    return null;
  }
}

export async function classifyMessage(
  tickets: Ticket[],
  history: ConversationEntry[],
  latestMessage: string,
): Promise<AIResponse | null> {
  const prompt = buildUserPrompt(tickets, history, latestMessage);
  return callAI(prompt);
}
