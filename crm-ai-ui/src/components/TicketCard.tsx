import type { Ticket } from "../api/types";
import { Badge, Card, Separator } from "./ui";

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

export default function TicketCard({
  ticket,
  expanded,
  onToggle,
}: {
  ticket: Ticket;
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

      <div className="overflow-hidden">
        {!expanded && (
          <p className="mt-1 line-clamp-1 text-sm text-zinc-500">
            {ticket.summary || "-"}
          </p>
        )}
        {expanded && (
          <div className="mt-3 space-y-3 pt-3">
            <Separator />
            <div>
              <p className="text-xs text-zinc-500">Summary</p>
              <p className="mt-0.5 text-sm text-zinc-300">
                {ticket.summary || "-"}
              </p>
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
      </div>
    </Card>
  );
}
