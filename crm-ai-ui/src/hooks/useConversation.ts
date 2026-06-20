import { useState, useEffect, useCallback, useRef } from "react";
import {
  getMessages,
  getMessagesSince,
  getTicketsByCustomerId,
  sendMessage,
  sendDirectMessage,
  getTicket,
} from "../api/requests";
import type { Message, Ticket } from "../api/types";

export function useConversation(
  customerId: string,
  sender: "agent" | "customer" = "agent",
  direct = false,
) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastTimestampRef = useRef<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [msgs, tkts] = await Promise.all([
        getMessages(customerId),
        getTicketsByCustomerId(customerId),
      ]);
      setMessages(msgs);
      setTickets(tkts);
      if (msgs.length > 0) {
        lastTimestampRef.current = msgs[msgs.length - 1].timestamp;
      }
      const firstOpen = tkts.find(
        (t) => t.status === "open" || t.status === "pending",
      );
      setActiveTicket(firstOpen || tkts[0] || null);
    } catch (err: any) {
      setError(err.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [customerId]);

  useEffect(() => {
    if (!direct) return;
    const interval = setInterval(async () => {
      if (!lastTimestampRef.current) return;
      try {
        const [newMsgs, tkts] = await Promise.all([
          getMessagesSince(customerId, lastTimestampRef.current),
          getTicketsByCustomerId(customerId),
        ]);
        if (newMsgs.length > 0) {
          lastTimestampRef.current = newMsgs[newMsgs.length - 1].timestamp;
          setMessages((prev) => {
            const existing = new Set(prev.map((m) => m.message_id));
            const unique = newMsgs.filter((m) => !existing.has(m.message_id));
            return unique.length > 0 ? [...prev, ...unique] : prev;
          });
        }
        setTickets(tkts);
      } catch {
        // polling errors silently ignored
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [direct, customerId]);

  const send = useCallback(
    async (content: string) => {
      if (direct) {
        const res = await sendDirectMessage(customerId, content, sender);
        setMessages((prev) => [...prev, res.message]);
        lastTimestampRef.current = res.message.timestamp;
      } else {
        const res = await sendMessage(customerId, content, sender);
        const msg = await getMessages(customerId, 1);
        setMessages((prev) => [...prev, ...msg]);
        if (res.ticket) {
          setActiveTicket(res.ticket);
          const refreshed = await getTicket(res.ticket.ticket_id);
          setTickets((prev) =>
            prev.map((t) =>
              t.ticket_id === refreshed.ticket_id ? refreshed : t,
            ),
          );
        }
      }
    },
    [customerId, sender, direct],
  );

  const customerName =
    tickets.find((t) => t.customer_name)?.customer_name || customerId;

  return {
    messages,
    tickets,
    activeTicket,
    loading,
    error,
    retry: load,
    send,
    customerName,
    ownSender: sender,
  };
}
