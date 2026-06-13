import { useState, useMemo } from "react";
import { ChatTeardropDots } from "@phosphor-icons/react";
import { useInbox } from "../hooks/useInbox";
import InboxRow from "../components/InboxRow";
import InboxToolbar, { type FilterValue, type SortValue } from "../components/InboxToolbar";
import { Button, Skeleton } from "../components/ui";

export default function InboxPage() {
  const { customers, loading, error, retry } = useInbox();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterValue>("all");
  const [sort, setSort] = useState<SortValue>("newest");

  const filtered = useMemo(() => {
    let result = customers;

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.customerName.toLowerCase().includes(q) ||
          c.preview.toLowerCase().includes(q),
      );
    }

    if (filter === "urgent") {
      result = result.filter((c) => c.priority === "urgent" || c.priority === "high");
    } else if (filter === "open") {
      result = result.filter((c) => c.ticketCount > 0);
    }

    result = [...result].sort((a, b) => {
      const diff = new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime();
      return sort === "newest" ? diff : -diff;
    });

    return result;
  }, [customers, search, filter, sort]);

  function handleSortToggle() {
    setSort((s) => (s === "newest" ? "oldest" : "newest"));
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="border-b border-zinc-800 px-4 py-3">
        <h1 className="text-base font-semibold text-zinc-100">Inbox</h1>
      </div>

      <InboxToolbar
        search={search}
        onSearchChange={setSearch}
        filter={filter}
        onFilterChange={setFilter}
        sort={sort}
        onSortToggle={handleSortToggle}
        resultCount={filtered.length}
      />

      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="space-y-0">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3 border-b border-zinc-800 px-4 py-3">
                <Skeleton shape="circle" width="24px" height="24px" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton shape="text" width="40%" />
                  <Skeleton shape="text" width="70%" />
                </div>
                <Skeleton shape="text" width="32px" />
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center p-8">
            <div className="rounded-lg bg-red-900/50 p-4 text-center text-sm text-red-300">
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
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <ChatTeardropDots size={40} className="text-zinc-700" />
            <div>
              <p className="text-lg text-zinc-500">No conversations yet</p>
              <p className="mt-1 text-sm text-zinc-600">
                {search || filter !== "all"
                  ? "Try adjusting your search or filters"
                  : "New conversations will appear here"}
              </p>
            </div>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div>
            <div className="grid grid-cols-[auto_1fr_auto] gap-x-3 border-b border-zinc-800 px-4 py-1.5 text-[11px] font-medium uppercase tracking-wider text-zinc-600">
              <div />
              <span>Sender</span>
              <span className="justify-self-end">Date</span>
            </div>
            {filtered.map((c) => (
              <InboxRow key={c.customerId} customer={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
