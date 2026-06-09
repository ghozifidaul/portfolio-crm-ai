import { useNavigate } from "react-router";
import type { CustomerInbox } from "../hooks/useInbox";

const priorityColors: Record<string, string> = {
  urgent: "text-red-600",
  high: "text-orange-500",
  medium: "text-yellow-600",
  low: "text-gray-400",
};

const priorityLabel: Record<string, string> = {
  urgent: "Urgent",
  high: "High",
  medium: "Medium",
  low: "Low",
};

function badgeText(priority: string | null, ticketCount: number): string | null {
  if (priority && ticketCount > 0) {
    return `${priorityLabel[priority] || priority} · ${ticketCount} open ticket${ticketCount === 1 ? "" : "s"}`;
  }
  if (ticketCount > 0) {
    return `${ticketCount} open ticket${ticketCount === 1 ? "" : "s"}`;
  }
  return null;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function CustomerCard({
  customer,
}: {
  customer: CustomerInbox;
}) {
  const navigate = useNavigate();
  const badge = badgeText(customer.priority, customer.ticketCount);

  return (
    <div
      onClick={() => navigate(`/conversation/${customer.customerId}`)}
      className="cursor-pointer rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-colors hover:bg-gray-50"
    >
      <div className="flex items-start justify-between">
        <h3 className="font-medium text-gray-900">{customer.customerName}</h3>
        {badge && (
          <span
            className={`text-xs font-medium ${customer.priority ? priorityColors[customer.priority] : "text-gray-400"}`}
          >
            {badge}
          </span>
        )}
      </div>
      <p className="mt-2 line-clamp-1 text-sm text-gray-500">
        {customer.preview}
      </p>
      <p className="mt-1 text-xs text-gray-400">
        {timeAgo(customer.lastActivityAt)}
      </p>
    </div>
  );
}
