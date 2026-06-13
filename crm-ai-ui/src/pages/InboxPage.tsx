import { ChatTeardropDots } from "@phosphor-icons/react";
import { useInbox } from "../hooks/useInbox";
import CustomerCard from "../components/CustomerCard";
import { Button, Skeleton } from "../components/ui";

export default function InboxPage() {
  const { customers, loading, error, retry } = useInbox();

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <h1 className="mb-6 text-lg font-semibold text-zinc-100">Inbox</h1>

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
