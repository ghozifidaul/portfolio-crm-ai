import { TicketIcon } from "@phosphor-icons/react";
import type { Ticket as TicketType } from "../api/types";
import { Skeleton } from "./ui";
import TicketCard from "./TicketCard";

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
