import { useNavigate } from "react-router";
import { useReducedMotion, motion } from "motion/react";
import type { CustomerInbox } from "../hooks/useInbox";
import { Avatar, Badge } from "./ui";

const priorityBorder: Record<string, string> = {
  urgent: "border-l-red-500",
  high: "border-l-orange-500",
  medium: "border-l-yellow-500",
};

const priorityBadgeVariant: Record<string, "urgent" | "high" | "medium" | "low" | "default"> = {
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

function badgeText(priority: string | null, ticketCount: number): string | null {
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
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  if (hours < 48) return "yesterday";
  return `${Math.floor(hours / 24)}d`;
}

export default function InboxRow({ customer }: { customer: CustomerInbox }) {
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const hasUnread = customer.ticketCount > 0;
  const border = priorityBorder[customer.priority ?? ""] ?? "border-l-transparent";
  const badge = badgeText(customer.priority, customer.ticketCount);

  return (
    <motion.div
      role="button"
      tabIndex={0}
      whileHover={reduce ? {} : { backgroundColor: "rgba(39,39,42,0.5)" }}
      transition={{ duration: 0.15 }}
      onClick={() => navigate(`/inbox/${customer.customerId}`)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          navigate(`/inbox/${customer.customerId}`);
        }
      }}
      className={`grid cursor-pointer grid-cols-[auto_1fr_auto] gap-x-3 gap-y-0.5 border-l-2 border-b border-zinc-800 px-4 py-2.5 focus-visible:bg-zinc-800 focus-visible:outline-none ${border}`}
    >
      <div className="col-span-1 row-span-2 flex h-8 items-center self-center">
        {hasUnread && <div className="h-2 w-2 rounded-full bg-blue-500" title="Open tickets" />}
      </div>

      <div className="flex min-w-0 items-center gap-2">
        <Avatar name={customer.customerName} size="sm" />
        <span
          className={`truncate text-sm ${hasUnread ? "font-semibold text-zinc-100" : "font-medium text-zinc-200"}`}
        >
          {customer.customerName}
        </span>
      </div>

      <div className="flex items-center gap-2 justify-self-end">
        {badge && (
          <Badge variant={priorityBadgeVariant[customer.priority ?? ""] ?? "default"} size="sm">
            {badge}
          </Badge>
        )}
        <span className="shrink-0 text-xs tabular-nums text-zinc-500">
          {timeAgo(customer.lastActivityAt)}
        </span>
      </div>

      <p className="col-span-2 col-start-2 truncate text-xs text-zinc-500">
        {customer.preview}
      </p>
    </motion.div>
  );
}
