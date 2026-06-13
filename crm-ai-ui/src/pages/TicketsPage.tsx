import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Ticket } from "@phosphor-icons/react";
import { getTicketsByStatus } from "../api/requests";
import type { Ticket as TicketType } from "../api/types";
import { Card, Badge, Skeleton } from "../components/ui";

const statusFilters = ["all", "open", "pending", "resolved"] as const;

const priorityVariant: Record<string, "urgent" | "high" | "medium" | "low" | "default"> = {
  urgent: "urgent",
  high: "high",
  medium: "medium",
  low: "low",
};

const statusVariant: Record<string, "default" | "urgent" | "medium" | "low"> = {
  open: "default",
  pending: "medium",
  resolved: "low",
};

export default function TicketsPage() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("open");

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await getTicketsByStatus(filter === "all" ? undefined : filter);
        setTickets(data);
      } catch {
        /* silent */
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [filter]);

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <h1 className="mb-4 text-lg font-semibold text-zinc-100">Tickets</h1>

      <div className="mb-4 flex gap-2">
        {statusFilters.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === s
                ? "bg-blue-600/10 text-blue-400"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200"
            }`}
          >
            {s === "all" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} shape="card" />
          ))}
        </div>
      )}

      {!loading && tickets.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <Ticket size={40} className="text-zinc-700" />
          <p className="text-sm text-zinc-500">{filter === "all" ? "No tickets" : `No ${filter} tickets`}</p>
        </div>
      )}

      {!loading && tickets.length > 0 && (
        <div className="space-y-2">
          {tickets.map((t) => (
            <Card
              key={t.ticket_id}
              hover
              tabIndex={0}
              role="button"
              onClick={() => navigate(`/inbox/${t.customer_id}`)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  navigate(`/inbox/${t.customer_id}`);
                }
              }}
              className="cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-zinc-100">
                    {t.ticket_id}
                  </span>
                  <span className="text-xs text-zinc-500">
                    {t.customer_name ?? t.customer_id}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={statusVariant[t.status] ?? "default"}
                    size="sm"
                  >
                    {t.status}
                  </Badge>
                  <Badge
                    variant={priorityVariant[t.priority] ?? "default"}
                    size="sm"
                  >
                    {t.priority}
                  </Badge>
                </div>
              </div>
              <p className="mt-1 line-clamp-1 text-sm text-zinc-400">
                {t.summary || "-"}
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                {t.category} · Updated {new Date(t.updated_at).toLocaleDateString()}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
