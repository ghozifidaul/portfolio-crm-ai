import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import {
  Gauge,
  ChatCircleDots,
  Ticket,
  SignOut,
  CaretLeft,
  CaretRight,
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

  const [collapsed, setCollapsed] = useState(() => {
    if (typeof localStorage === "undefined") return false;
    return localStorage.getItem("sidebar-collapsed") === "true";
  });

  useEffect(() => {
    localStorage.setItem("sidebar-collapsed", String(collapsed));
  }, [collapsed]);

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <aside
      aria-expanded={!collapsed}
      className={`flex h-[100dvh] flex-col border-r border-zinc-800 bg-zinc-950 transition-all duration-200 ${collapsed ? "w-16" : "w-64"}`}
    >
      <div
        className={`flex items-center border-b border-zinc-800 ${collapsed ? "justify-center gap-0 px-3 py-4" : "justify-between gap-2 px-4 py-4"}`}
      >
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white">
            C
          </div>
          {!collapsed && (
            <span className="text-sm font-semibold text-zinc-100">CRM Agent</span>
          )}
        </div>
        <button
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="flex h-6 w-6 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
        >
          {collapsed ? <CaretRight size={14} /> : <CaretLeft size={14} />}
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-2 py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              title={collapsed ? item.label : undefined}
              aria-label={collapsed ? item.label : undefined}
              className={`flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors ${
                collapsed ? "justify-center" : "gap-3"
              } ${
                isActive
                  ? "bg-blue-600/10 text-blue-400"
                  : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
              }`}
            >
              <Icon size={18} weight={isActive ? "fill" : "regular"} />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <div className={`border-t border-zinc-800 ${collapsed ? "px-2 py-3" : "px-3 py-3"}`}>
        <div
          className={`mb-2 flex items-center ${collapsed ? "justify-center" : "gap-3 px-3 py-2"}`}
          title={collapsed ? user?.name : undefined}
        >
          <Avatar name={user?.name ?? "U"} size={collapsed ? "sm" : "sm"} />
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-zinc-100">{user?.name}</p>
              <p className="text-xs capitalize text-zinc-500">{user?.role}</p>
            </div>
          )}
        </div>
        <button
          onClick={handleLogout}
          title={collapsed ? "Logout" : undefined}
          className={`flex w-full items-center rounded-lg px-3 py-2 text-sm text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200 ${
            collapsed ? "justify-center" : "gap-3"
          }`}
        >
          <SignOut size={18} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
}
