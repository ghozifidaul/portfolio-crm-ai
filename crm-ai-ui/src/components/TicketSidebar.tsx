import type { Ticket } from "../api/types";

const priorityColors: Record<string, string> = {
  urgent: "text-red-600 bg-red-50",
  high: "text-orange-600 bg-orange-50",
  medium: "text-yellow-600 bg-yellow-50",
  low: "text-gray-500 bg-gray-100",
};

const priorityLabel: Record<string, string> = {
  urgent: "Urgent",
  high: "High",
  medium: "Medium",
  low: "Low",
};

function StatusBadge({ status }: { status: string }) {
  const cls =
    status === "open"
      ? "bg-green-100 text-green-800"
      : status === "pending"
        ? "bg-amber-100 text-amber-800"
        : "bg-gray-200 text-gray-600";
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${cls}`}>
      {status}
    </span>
  );
}

function TicketCard({
  ticket,
  expanded,
  onToggle,
}: {
  ticket: Ticket;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      onClick={onToggle}
      className={`cursor-pointer rounded-lg border p-3 text-xs transition-colors ${
        expanded
          ? "border-blue-300 bg-blue-50"
          : "border-gray-200 bg-white hover:bg-gray-100"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="font-semibold text-gray-900">{ticket.ticket_id}</span>
        <span className={priorityColors[ticket.priority] || ""}>
          {priorityLabel[ticket.priority] || ticket.priority}
        </span>
      </div>

      <div className="mt-1 flex items-center gap-2">
        <StatusBadge status={ticket.status} />
        <span className="text-gray-500 capitalize">{ticket.category}</span>
      </div>

      {expanded ? (
        <div className="mt-2 space-y-3 border-t border-blue-200 pt-2">
          <div>
            <p className="text-gray-500">Summary</p>
            <p className="text-gray-700">{ticket.summary || "—"}</p>
          </div>
          {ticket.entities.length > 0 && (
            <div>
              <p className="text-xs text-gray-500">Entities</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {ticket.entities.map((e) => (
                  <span
                    key={e}
                    className="rounded bg-purple-100 px-2 py-0.5 text-xs text-purple-800"
                  >
                    {e}
                  </span>
                ))}
              </div>
            </div>
          )}
          {ticket.tags.length > 0 && (
            <div>
              <p className="text-xs text-gray-500">Tags</p>
              <div className="mt-1 flex flex-wrap gap-1">
                {ticket.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded bg-gray-200 px-2 py-0.5 text-xs text-gray-700"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="mt-1 line-clamp-1 text-gray-600">{ticket.summary || "—"}</p>
      )}
    </div>
  );
}

function Skeleton() {
  return (
    <div className="w-72 border-l border-gray-200 bg-gray-50 p-4">
      <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
      <div className="mt-4 space-y-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-3 animate-pulse rounded bg-gray-200" />
        ))}
      </div>
    </div>
  );
}

export default function TicketSidebar({
  tickets,
  activeTicketId,
  onSelectTicket,
  loading,
}: {
  tickets: Ticket[];
  activeTicketId: string | null;
  onSelectTicket: (ticketId: string) => void;
  loading: boolean;
}) {
  if (loading) return <Skeleton />;

  return (
    <div className="w-72 overflow-y-auto border-l border-gray-200 bg-gray-50 p-4 text-sm">
      <h3 className="mb-3 font-semibold text-gray-900">
        Tickets ({tickets.length})
      </h3>

      {tickets.length === 0 && (
        <p className="text-sm text-gray-400">No open tickets</p>
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
