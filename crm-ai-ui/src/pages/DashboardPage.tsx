import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ChatDots, Users } from "@phosphor-icons/react";
import { getDashboardStats } from "../api/requests";
import type { DashboardStats } from "../api/types";
import { Card, Skeleton, ChartCard } from "../components/ui";
import StatusDonut from "../components/charts/StatusDonut";
import PriorityBar from "../components/charts/PriorityBar";

function KpiCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color: string;
}) {
  return (
    <Card className="flex items-center gap-3">
      <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-xl font-semibold text-zinc-100">{value}</p>
        <p className="text-xs text-zinc-500">{label}</p>
      </div>
    </Card>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch {
        /* silent */
      } finally {
        setLoading(false);
      }
    }
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <h1 className="mb-6 text-lg font-semibold text-zinc-100">Dashboard</h1>

      {loading && !stats && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Skeleton shape="card" className="h-[280px]" />
            <Skeleton shape="card" className="h-[280px]" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Skeleton shape="card" />
            <Skeleton shape="card" />
          </div>
        </div>
      )}

      {stats && (
        <>
          <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ChartCard title="Tickets by Status" headerRight={`${stats.byStatus.length} statuses`}>
              <StatusDonut data={stats.byStatus} />
            </ChartCard>
            <ChartCard title="Active Tickets by Priority" headerRight={`${stats.byPriority.length} levels`}>
              <PriorityBar data={stats.byPriority} />
            </ChartCard>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-4">
            <KpiCard
              icon={<ChatDots size={18} className="text-purple-400" />}
              label="Total Messages"
              value={stats.totalMessages.toLocaleString()}
              color="bg-purple-500/10"
            />
            <KpiCard
              icon={<Users size={18} className="text-teal-400" />}
              label="Active Conversations (24h)"
              value={stats.activeConversations}
              color="bg-teal-500/10"
            />
          </div>

          <h2 className="mb-3 text-sm font-semibold text-zinc-100">Recent Tickets</h2>
          {stats.recentTickets.length === 0 ? (
            <p className="text-sm text-zinc-500">No tickets yet</p>
          ) : (
            <div className="space-y-2">
              {stats.recentTickets.map((t) => (
                <Card
                  key={t.ticket_id}
                  hover
                  tabIndex={0}
                  role="button"
                  onClick={() => navigate(`/inbox/${t.customer_id}`)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      navigate(`/inbox/${t.customer_id}`);
                    }
                  }}
                  className="cursor-pointer focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-zinc-100">
                      {t.ticket_id}
                    </span>
                    <span className="text-xs capitalize text-zinc-500">
                      {t.priority} · {t.status} · {t.customer_name ?? "—"}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-1 text-sm text-zinc-400">
                    {t.summary || "-"}
                  </p>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
