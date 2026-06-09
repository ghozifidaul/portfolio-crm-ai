import { useAuth } from "../hooks/useAuth";
import { useInbox } from "../hooks/useInbox";
import CustomerCard from "../components/CustomerCard";

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
          <p className="text-lg">No conversations yet</p>
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
