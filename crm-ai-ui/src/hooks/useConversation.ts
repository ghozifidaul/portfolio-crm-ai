import { useState, useEffect, useCallback } from "react";
import { getMessages, getTicketsByCustomerId, sendMessage, getTicket } from "../api/requests";
import type { Message, Ticket } from "../api/types";

export function useConversation(customerId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const send = useCallback(
    async (content: string) => {
      const res = await sendMessage(customerId, content, "agent");
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
    },
    [customerId],
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
  };
}
