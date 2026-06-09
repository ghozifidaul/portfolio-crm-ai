import { Ticket as TicketIcon } from "@phosphor-icons/react";
import type { Ticket as TicketType } from "../api/types";
import { Badge, Card, Skeleton, Separator } from "./ui";

const priorityVariant: Record<string, "urgent" | "high" | "medium" | "low" | "default"> = {
  urgent: "urgent",
  high: "high",
  medium: "medium",
  low: "low",
};

const priorityLabel: Record<string, string> = {
  urgent: "Urgent",
  high: "High",
  medium: "Medium",
  low: "Low",
};

const statusVariant: Record<string, "default" | "urgent" | "medium" | "low"> = {
  open: "default",
  pending: "medium",
  closed: "low",
};

function TicketCard({
  ticket,
  expanded,
  onToggle,
}: {
  ticket: TicketType;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <Card
      hover
      tabIndex={0}
      role="button"
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle();
        }
      }}
      className={`cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 ${
        expanded ? "border-blue-600" : ""
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-semibold text-zinc-100">{ticket.ticket_id}</span>
        <Badge variant={priorityVariant[ticket.priority] ?? "default"} size="sm">
          {priorityLabel[ticket.priority] || ticket.priority}
        </Badge>
      </div>

      <div className="mt-1.5 flex items-center gap-2">
        <Badge variant={statusVariant[ticket.status] ?? "default"} size="sm">
          {ticket.status}
        </Badge>
        <span className="text-xs capitalize text-zinc-500">{ticket.category}</span>
      </div>

      {expanded && (
        <div className="mt-3 space-y-3 pt-3">
          <Separator />
          <div>
            <p className="text-xs text-zinc-500">Summary</p>
            <p className="mt-0.5 text-sm text-zinc-300">{ticket.summary || "-"}</p>
          </div>
          {ticket.entities.length > 0 && (
            <div>
              <p className="text-xs text-zinc-500">Entities</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {ticket.entities.map((e) => (
                  <span
                    key={e}
                    className="rounded-md bg-zinc-800 px-2 py-0.5 text-xs text-zinc-300"
                  >
                    {e}
                  </span>
                ))}
              </div>
            </div>
          )}
          {ticket.tags.length > 0 && (
            <div>
              <p className="text-xs text-zinc-500">Tags</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {ticket.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-md bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!expanded && (
        <p className="mt-1 line-clamp-1 text-sm text-zinc-500">{ticket.summary || "-"}</p>
      )}
    </Card>
  );
}

export default function TicketSidebar({
  tickets,
  activeTicketId,
  onSelectTicket,
  loading,
}: {
  tickets: TicketType[];
  activeTicketId: string | null;
  onSelectTicket: (ticketId: string) => void;
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="flex w-72 flex-col gap-3 border-l border-zinc-800 bg-zinc-950 p-4">
        <Skeleton shape="text" width="60%" />
        <Skeleton shape="card" />
        <Skeleton shape="card" />
      </div>
    );
  }

  return (
    <div className="flex w-72 flex-col gap-3 overflow-y-auto border-l border-zinc-800 bg-zinc-950 p-4 text-sm">
      <h3 className="text-sm font-semibold text-zinc-100">
        Tickets ({tickets.length})
      </h3>

      {tickets.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-8 text-sm text-zinc-500">
          <TicketIcon size={28} className="text-zinc-700" />
          <p>No open tickets</p>
        </div>
      )}

      <div className="space-y-2">
        {tickets.map((t) => (
          <TicketCard
            key={t.ticket_id}
            ticket={t}
            expanded={t.ticket_id === activeTicketId}
            onToggle={() => onSelectTicket(t.ticket_id)}
          />
        ))}
      </div>
    </div>
  );
}
