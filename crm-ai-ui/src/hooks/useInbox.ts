import { useState, useEffect } from "react";
import { getConversations } from "../api/requests";

export interface CustomerInbox {
  customerId: string;
  customerName: string;
  ticketCount: number;
  priority: string | null;
  preview: string;
  lastActivityAt: string;
}

export function useInbox() {
  const [customers, setCustomers] = useState<CustomerInbox[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await getConversations();
      setCustomers(
        data.map((c) => ({
          customerId: c.customer_id,
          customerName: c.customer_name,
          ticketCount: c.open_ticket_count,
          priority: c.worst_priority,
          preview: c.last_message,
          lastActivityAt: c.last_activity,
        })),
      );
    } catch (err: any) {
      setError(err.message || "Failed to load conversations");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return { customers, loading, error, retry: load };
}
