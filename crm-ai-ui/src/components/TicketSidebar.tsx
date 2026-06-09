import type { Ticket } from "../api/types";

const priorityLabel: Record<string, string> = {
  urgent: "Urgent",
  high: "High",
  medium: "Medium",
  low: "Low",
};

function Badge({
  children,
  className,
}: {
  children: React.ReactNode;
  className: string;
}) {
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${className}`}
    >
      {children}
    </span>
  );
}

export default function TicketSidebar({
  ticket,
  loading,
}: {
  ticket: Ticket | null;
  loading: boolean;
}) {
  if (loading) {
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

  if (!ticket) {
    return (
      <div className="w-72 border-l border-gray-200 bg-gray-50 p-4">
        <p className="text-sm text-gray-400">No open tickets</p>
      </div>
    );
  }

  return (
    <div className="w-72 border-l border-gray-200 bg-gray-50 p-4 text-sm">
      <h3 className="mb-3 font-semibold text-gray-900">
        {ticket.ticket_id}
      </h3>

      <div className="space-y-3">
        <div>
          <p className="text-xs text-gray-500">Status</p>
          <Badge
            className={
              ticket.status === "open"
                ? "bg-green-100 text-green-800"
                : ticket.status === "pending"
                  ? "bg-amber-100 text-amber-800"
                  : "bg-gray-200 text-gray-600"
            }
          >
            {ticket.status}
          </Badge>
        </div>

        <div>
          <p className="text-xs text-gray-500">Priority</p>
          <p className="font-medium text-gray-900">
            {priorityLabel[ticket.priority] || ticket.priority}
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-500">Category</p>
          <p className="font-medium text-gray-900 capitalize">
            {ticket.category}
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-500">Summary</p>
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
    </div>
  );
}
