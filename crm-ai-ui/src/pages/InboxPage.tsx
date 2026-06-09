import { ChatTeardropDots } from "@phosphor-icons/react";
import { useAuth } from "../hooks/useAuth";
import { useInbox } from "../hooks/useInbox";
import CustomerCard from "../components/CustomerCard";
import { Button, Skeleton } from "../components/ui";

export default function InboxPage() {
  const { logout } = useAuth();
  const { customers, loading, error, retry } = useInbox();

  function handleLogout() {
    logout();
    window.location.href = "/login";
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-zinc-100">Inbox</h1>
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          Logout
        </Button>
      </div>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} shape="card" />
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-900/50 p-4 text-sm text-red-300">
          <p>{error}</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={retry}
            className="mt-2 text-red-300"
          >
            Retry
          </Button>
        </div>
      )}

      {!loading && !error && customers.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <ChatTeardropDots size={40} className="text-zinc-700" />
          <div>
            <p className="text-lg text-zinc-500">No conversations yet</p>
            <p className="mt-1 text-sm text-zinc-600">
              New conversations will appear here
            </p>
          </div>
        </div>
      )}

      {!loading && !error && customers.length > 0 && (
        <div className="space-y-2">
          {customers.map((c) => (
            <CustomerCard key={c.customerId} customer={c} />
          ))}
        </div>
      )}
    </div>
  );
}
