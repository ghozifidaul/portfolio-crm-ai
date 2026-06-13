import { useNavigate, useLocation } from "react-router";
import {
  Gauge,
  ChatCircleDots,
  Ticket,
  SignOut,
} from "@phosphor-icons/react";
import { getUser } from "../api/client";
import { useAuth } from "../hooks/useAuth";
import { Avatar } from "./ui";

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: Gauge },
  { label: "Inbox", path: "/inbox", icon: ChatCircleDots },
  { label: "Tickets", path: "/tickets", icon: Ticket },
];

export default function Sidebar() {
  const user = getUser();
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAuth();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <aside className="flex h-[100dvh] w-64 flex-col border-r border-zinc-800 bg-zinc-950">
      <div className="flex items-center gap-2 border-b border-zinc-800 px-5 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
          C
        </div>
        <span className="text-sm font-semibold text-zinc-100">CRM Agent</span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                isActive
                  ? "bg-blue-600/10 text-blue-400"
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
              }`}
            >
              <Icon size={18} weight={isActive ? "fill" : "regular"} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-zinc-800 px-3 py-3">
        <div className="mb-2 flex items-center gap-3 px-3 py-2">
          <Avatar name={user?.name ?? "U"} size="sm" />
          <div>
            <p className="text-sm font-medium text-zinc-100">{user?.name}</p>
            <p className="text-xs text-zinc-500 capitalize">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
        >
          <SignOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}
