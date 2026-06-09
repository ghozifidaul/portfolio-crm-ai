import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { getUser } from "../api/client";
import { useConversation } from "../hooks/useConversation";
import { useAuth } from "../hooks/useAuth";
import MessageList from "../components/MessageList";
import ReplyInput from "../components/ReplyInput";
import TicketSidebar from "../components/TicketSidebar";

function Skeleton() {
  return (
    <div className="flex flex-1 flex-col gap-3 p-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex" style={{ justifyContent: i % 2 === 0 ? "flex-end" : "flex-start" }}>
          <div className={`h-12 w-2/3 animate-pulse rounded-2xl bg-gray-100 ${i % 2 === 0 ? "rounded-br-md" : "rounded-bl-md"}`} />
        </div>
      ))}
    </div>
  );
}

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

  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);

  useEffect(() => {
    if (!activeTicketId && tickets.length > 0) {
      const first = tickets.find(
        (t) => t.status === "open" || t.status === "pending",
      );
      setActiveTicketId(first?.ticket_id || tickets[0].ticket_id);
    }
  }, [tickets, activeTicketId]);

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="flex h-screen flex-col">
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
        <h1 className="text-base font-semibold text-gray-900">
          Hi, {user?.name || customerName}!
        </h1>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-500 hover:text-gray-800"
        >
          Logout
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-1 flex-col">
          {loading && <Skeleton />}
          {error && (
            <div className="flex flex-1 items-center justify-center">
              <div className="text-center">
                <p className="text-sm text-red-600">{error}</p>
                <button
                  onClick={retry}
                  className="mt-2 text-sm font-medium text-red-700 underline"
                >
                  Retry
                </button>
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
        <TicketSidebar
          tickets={tickets}
          activeTicketId={activeTicketId}
          onSelectTicket={setActiveTicketId}
          loading={loading}
        />
      </div>
    </div>
  );
}
