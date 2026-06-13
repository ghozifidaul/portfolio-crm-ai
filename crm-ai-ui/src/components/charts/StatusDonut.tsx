import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const STATUS_COLORS: Record<string, string> = {
  open: "#3b82f6",
  pending: "#eab308",
  resolved: "#22c55e",
};

const STATUS_LABELS: Record<string, string> = {
  open: "Open",
  pending: "Pending",
  resolved: "Resolved",
};

interface StatusDonutProps {
  data: { status: string; count: number }[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs shadow-lg">
      <span className="text-zinc-300">{STATUS_LABELS[d.name] ?? d.name}: </span>
      <span className="font-semibold text-zinc-100">{d.value}</span>
    </div>
  );
}

export default function StatusDonut({ data }: StatusDonutProps) {
  const total = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="relative flex items-center justify-center">
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="status"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={88}
            paddingAngle={3}
            strokeWidth={0}
          >
            {data.map((entry) => (
              <Cell key={entry.status} fill={STATUS_COLORS[entry.status] ?? "#52525b"} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <p className="text-2xl font-semibold text-zinc-100">{total}</p>
          <p className="text-[10px] uppercase tracking-wider text-zinc-500">Total</p>
        </div>
      </div>
      <div className="absolute bottom-0 flex gap-4 text-xs text-zinc-400">
        {data.map((d) => (
          <div key={d.status} className="flex items-center gap-1.5">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: STATUS_COLORS[d.status] ?? "#52525b" }}
            />
            {STATUS_LABELS[d.status] ?? d.status}
            <span className="font-medium text-zinc-300">{d.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
