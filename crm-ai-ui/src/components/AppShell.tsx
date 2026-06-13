import { Outlet } from "react-router";
import Sidebar from "./Sidebar";

export default function AppShell() {
  return (
    <div className="flex h-[100dvh] bg-zinc-950">
      <Sidebar />
      <main className="flex flex-1 flex-col overflow-hidden">
        <Outlet />
      </main>
    </div>
  );
}
