import { MagnifyingGlass, ArrowUp, ArrowDown } from "@phosphor-icons/react";

export type FilterValue = "all" | "urgent" | "open";
export type SortValue = "newest" | "oldest";

const filters: { label: string; value: FilterValue }[] = [
  { label: "All", value: "all" },
  { label: "Urgent", value: "urgent" },
  { label: "Open tickets", value: "open" },
];

interface InboxToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  filter: FilterValue;
  onFilterChange: (value: FilterValue) => void;
  sort: SortValue;
  onSortToggle: () => void;
  resultCount: number;
}

export default function InboxToolbar({
  search,
  onSearchChange,
  filter,
  onFilterChange,
  sort,
  onSortToggle,
  resultCount,
}: InboxToolbarProps) {
  return (
    <div className="space-y-3 border-b border-zinc-800 px-4 py-3">
      <div className="relative">
        <MagnifyingGlass
          size={14}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search conversations..."
          className="w-full rounded-lg border border-zinc-800 bg-zinc-900 py-1.5 pl-9 pr-3 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-colors focus:border-zinc-600"
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => onFilterChange(f.value)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                filter === f.value
                  ? "bg-blue-600/15 text-blue-400"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs text-zinc-600">
            {resultCount} conversation{resultCount !== 1 ? "s" : ""}
          </span>
          <button
            onClick={onSortToggle}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-zinc-500 transition-colors hover:text-zinc-300"
            title={sort === "newest" ? "Newest first" : "Oldest first"}
          >
            {sort === "newest" ? <ArrowUp size={12} weight="bold" /> : <ArrowDown size={12} weight="bold" />}
            {sort === "newest" ? "Newest" : "Oldest"}
          </button>
        </div>
      </div>
    </div>
  );
}
