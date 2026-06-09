import { useNavigate } from "react-router";
import type { Ticket } from "../api/types";

const priorityColors: Record<string, string> = {
  urgent: "border-red-500 bg-red-50",
  high: "border-orange-400 bg-orange-50",
  medium: "border-yellow-400 bg-yellow-50",
  low: "border-gray-300 bg-gray-50",
};

const priorityLabel: Record<string, string> = {
  urgent: "Urgent",
  high: "High",
  medium: "Medium",
  low: "Low",
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function TicketCard({ ticket }: { ticket: Ticket }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/conversation/${ticket.customer_id}`)}
      className={`cursor-pointer rounded-lg border-l-4 bg-white p-4 shadow-sm transition-colors hover:bg-gray-100 ${priorityColors[ticket.priority] || "border-gray-300"}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-medium text-gray-900">
            {ticket.customer_name || ticket.customer_id}
          </h3>
          <p className="mt-0.5 text-xs text-gray-500">
            {ticket.category} &middot; {ticket.ticket_id}
          </p>
        </div>
        <span className="text-xs font-medium text-gray-600">
          {priorityLabel[ticket.priority] || ticket.priority}
        </span>
      </div>
      <p className="mt-2 line-clamp-1 text-sm text-gray-600">
        {ticket.summary || "No summary"}
      </p>
      <p className="mt-1 text-xs text-gray-400">{timeAgo(ticket.created_at)}</p>
    </div>
  );
}
