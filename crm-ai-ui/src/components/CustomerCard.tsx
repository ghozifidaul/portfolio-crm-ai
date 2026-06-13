import { useNavigate } from "react-router";
import type { CustomerInbox } from "../hooks/useInbox";
import { Card, Badge } from "./ui";

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

function badgeText(
  priority: string | null,
  ticketCount: number,
): string | null {
  if (priority && ticketCount > 0) {
    return `${priorityLabel[priority] || priority} · ${ticketCount} ticket${ticketCount === 1 ? "" : "s"}`;
  }
  if (ticketCount > 0) {
    return `${ticketCount} ticket${ticketCount === 1 ? "" : "s"}`;
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
    <Card
      hover
      tabIndex={0}
      role="button"
      onClick={() => navigate(`/inbox/${customer.customerId}`)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          navigate(`/inbox/${customer.customerId}`);
        }
      }}
      className="cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
    >
      <div className="flex items-start justify-between">
        <h3 className="text-sm font-medium text-zinc-100">{customer.customerName}</h3>
        {badge && (
          <Badge variant={priorityVariant[customer.priority ?? ""] ?? "default"} size="sm">
            {badge}
          </Badge>
        )}
      </div>
      <p className="mt-1.5 line-clamp-1 text-sm text-zinc-400">
        {customer.preview}
      </p>
      <p className="mt-1 text-xs text-zinc-500">
        {timeAgo(customer.lastActivityAt)}
      </p>
    </Card>
  );
}
