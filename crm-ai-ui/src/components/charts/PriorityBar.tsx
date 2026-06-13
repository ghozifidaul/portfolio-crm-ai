import { BarChart, Bar, Cell, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

const PRIORITY_COLORS: Record<string, string> = {
  urgent: "#ef4444",
  high: "#f97316",
  medium: "#eab308",
  low: "#52525b",
};

const PRIORITY_LABELS: Record<string, string> = {
  urgent: "Urgent",
  high: "High",
  medium: "Medium",
  low: "Low",
};

const PRIORITY_ORDER = ["urgent", "high", "medium", "low"];

interface PriorityBarProps {
  data: { priority: string; count: number }[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs shadow-lg">
      <span className="text-zinc-300">{PRIORITY_LABELS[d.payload.priority] ?? d.payload.priority}: </span>
      <span className="font-semibold text-zinc-100">{d.value} active</span>
    </div>
  );
}

export default function PriorityBar({ data }: PriorityBarProps) {
  const sorted = [...data].sort(
    (a, b) => PRIORITY_ORDER.indexOf(a.priority) - PRIORITY_ORDER.indexOf(b.priority),
  );

  return (
    <div className="flex items-center justify-center">
      <ResponsiveContainer width="100%" height={220}>
        <BarChart
          data={sorted}
          layout="vertical"
          margin={{ top: 4, right: 16, bottom: 4, left: 56 }}
          barCategoryGap={8}
        >
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="priority"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#a1a1aa", fontSize: 12 }}
            tickFormatter={(v) => PRIORITY_LABELS[v] ?? v}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
          <Bar dataKey="count" radius={[0, 4, 4, 0]} maxBarSize={28}>
            {sorted.map((entry) => (
              <Cell key={entry.priority} fill={PRIORITY_COLORS[entry.priority] ?? "#52525b"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
