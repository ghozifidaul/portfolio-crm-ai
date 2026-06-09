import { useState, useEffect } from "react";
import { getTicketsByStatus } from "../api/requests";
import type { Ticket } from "../api/types";

export interface CustomerInbox {
  customerId: string;
  customerName: string;
  ticketCount: number;
  priority: string;
  preview: string;
  lastActivityAt: string;
  tickets: Ticket[];
}

const PRIORITY_WEIGHT: Record<string, number> = {
  urgent: 4,
  high: 3,
  medium: 2,
  low: 1,
};

function groupByCustomer(tickets: Ticket[]): CustomerInbox[] {
  const map = new Map<string, Ticket[]>();

  for (const t of tickets) {
    const key = t.customer_id;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(t);
  }

  const groups: CustomerInbox[] = [];

  for (const [customerId, customerTickets] of map) {
    const name = customerTickets.find((t) => t.customer_name)?.customer_name || customerId;
    const sorted = [...customerTickets].sort(
      (a, b) => (PRIORITY_WEIGHT[b.priority] || 0) - (PRIORITY_WEIGHT[a.priority] || 0),
    );
    const worst = sorted[0];
    const preview = worst.summary || "No summary";
    const lastActivityAt = sorted.reduce(
      (latest, t) => (t.updated_at > latest ? t.updated_at : latest),
      sorted[0].updated_at,
    );

    groups.push({
      customerId,
      customerName: name,
      ticketCount: customerTickets.length,
      priority: worst.priority,
      preview,
      lastActivityAt,
      tickets: customerTickets,
    });
  }

  groups.sort((a, b) => {
    const wDiff = (PRIORITY_WEIGHT[b.priority] || 0) - (PRIORITY_WEIGHT[a.priority] || 0);
    if (wDiff !== 0) return wDiff;
    return b.lastActivityAt.localeCompare(a.lastActivityAt);
  });

  return groups;
}

export function useInbox() {
  const [customers, setCustomers] = useState<CustomerInbox[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await getTicketsByStatus("open");
      setCustomers(groupByCustomer(data));
    } catch (err: any) {
      setError(err.message || "Failed to load tickets");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return { customers, loading, error, retry: load };
}
