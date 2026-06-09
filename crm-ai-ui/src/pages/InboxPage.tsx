import { useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { useInbox } from "../hooks/useInbox";
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

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function CustomerCard({ customer }: { customer: CustomerInbox }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/conversation/${customer.customerId}`)}
      className="cursor-pointer rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-colors hover:bg-gray-50"
    >
      <div className="flex items-start justify-between">
        <h3 className="font-medium text-gray-900">{customer.customerName}</h3>
        <span className={`text-xs font-medium ${priorityColors[customer.priority] || "text-gray-400"}`}>
          {priorityLabel[customer.priority] || customer.priority} &middot; {customer.ticketCount} open
        </span>
      </div>
      <p className="mt-2 line-clamp-1 text-sm text-gray-500">
        {customer.preview}
      </p>
      <p className="mt-1 text-xs text-gray-400">{timeAgo(customer.lastActivityAt)}</p>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-24 animate-pulse rounded-lg bg-gray-100" />
      ))}
    </div>
  );
}

export default function InboxPage() {
  const { logout } = useAuth();
  const { customers, loading, error, retry } = useInbox();

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Inbox</h1>
        <button
          onClick={() => {
            logout();
            window.location.href = "/login";
          }}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Logout
        </button>
      </div>

      {loading && <Skeleton />}

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
          <p>{error}</p>
          <button
            onClick={retry}
            className="mt-2 font-medium text-red-800 underline"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && customers.length === 0 && (
        <div className="py-12 text-center text-gray-400">
          <p className="text-lg">No open tickets</p>
        </div>
      )}

      {!loading && !error && customers.length > 0 && (
        <div className="space-y-3">
          {customers.map((c) => (
            <CustomerCard key={c.customerId} customer={c} />
          ))}
        </div>
      )}
    </div>
  );
}
