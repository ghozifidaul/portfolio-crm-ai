import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  Ticket,
  ClockCountdown,
  CheckCircle,
  WarningCircle,
  ChatDots,
  Users,
} from "@phosphor-icons/react";
import { getDashboardStats } from "../api/requests";
import type { DashboardStats } from "../api/types";
import { Card, Skeleton } from "../components/ui";

function StatCard({
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
    <Card className="flex items-center gap-4">
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-semibold text-zinc-100">{value}</p>
        <p className="text-xs text-zinc-500">{label}</p>
      </div>
    </Card>
  );
}

function findCount(arr: { status?: string; priority?: string; count: number }[], key: string) {
  return arr.find((a) => (a.status ?? a.priority) === key)?.count ?? 0;
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} shape="card" />
          ))}
        </div>
      )}

      {stats && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={<Ticket size={20} className="text-blue-400" />}
              label="Open Tickets"
              value={findCount(stats.byStatus, "open")}
              color="bg-blue-500/10"
            />
            <StatCard
              icon={<ClockCountdown size={20} className="text-yellow-400" />}
              label="Pending"
              value={findCount(stats.byStatus, "pending")}
              color="bg-yellow-500/10"
            />
            <StatCard
              icon={<CheckCircle size={20} className="text-green-400" />}
              label="Resolved"
              value={findCount(stats.byStatus, "resolved")}
              color="bg-green-500/10"
            />
            <StatCard
              icon={<WarningCircle size={20} className="text-red-400" />}
              label="Urgent"
              value={findCount(stats.byPriority, "urgent")}
              color="bg-red-500/10"
            />
            <StatCard
              icon={<ChatDots size={20} className="text-purple-400" />}
              label="Total Messages"
              value={stats.totalMessages}
              color="bg-purple-500/10"
            />
            <StatCard
              icon={<Users size={20} className="text-teal-400" />}
              label="Active Conversations (24h)"
              value={stats.activeConversations}
              color="bg-teal-500/10"
            />
          </div>

          <h2 className="mb-3 mt-8 text-sm font-semibold text-zinc-100">
            Recent Tickets
          </h2>
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
