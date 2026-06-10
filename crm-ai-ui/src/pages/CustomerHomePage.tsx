import { useNavigate } from "react-router";
import { getUser } from "../api/client";
import { useConversation } from "../hooks/useConversation";
import { useAuth } from "../hooks/useAuth";
import MessageList from "../components/MessageList";
import ReplyInput from "../components/ReplyInput";
import TicketSidebar from "../components/TicketSidebar";
import { Button, Skeleton } from "../components/ui";

export default function CustomerHomePage() {
  const user = getUser();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const {
    messages,
    tickets,
    loading,
    error,
    retry,
    send,
    customerName,
    ownSender,
  } = useConversation(user!.id, "customer", true);

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="flex h-[100dvh] flex-col bg-zinc-950">
      <header className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950 px-4 py-3">
        <h1 className="text-base font-semibold text-zinc-100">
          Hi, {user?.name || customerName}!
        </h1>
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          Logout
        </Button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-1 flex-col overflow-hidden">
          {loading && (
            <div className="flex flex-1 flex-col gap-3 p-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex"
                  style={{ justifyContent: i % 2 === 0 ? "flex-end" : "flex-start" }}
                >
                  <Skeleton
                    shape="card"
                    width="60%"
                    height="48px"
                    className={i % 2 === 0 ? "rounded-br-md" : "rounded-bl-md"}
                  />
                </div>
              ))}
            </div>
          )}
          {error && (
            <div className="flex flex-1 items-center justify-center">
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
          {!loading && !error && (
            <>
              <MessageList messages={messages} ownSender={ownSender} />
              <ReplyInput onSend={send} disabled={false} />
            </>
          )}
        </div>
        <TicketSidebar tickets={tickets} loading={loading} />
      </div>
    </div>
  );
}
