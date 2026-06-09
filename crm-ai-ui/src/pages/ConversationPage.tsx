import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { useConversation } from "../hooks/useConversation";
import MessageList from "../components/MessageList";
import ReplyInput from "../components/ReplyInput";
import TicketSidebar from "../components/TicketSidebar";
import { Button, Skeleton } from "../components/ui";

export default function ConversationPage() {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();
  const {
    messages,
    tickets,
    loading,
    error,
    retry,
    send,
    customerName,
    ownSender,
  } = useConversation(customerId!, "agent", true);

  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);

  useEffect(() => {
    if (!activeTicketId && tickets.length > 0) {
      const first = tickets.find(
        (t) => t.status === "open" || t.status === "pending",
      );
      setActiveTicketId(first?.ticket_id || tickets[0].ticket_id);
    }
  }, [tickets, activeTicketId]);

  return (
    <div className="flex min-h-[100dvh] flex-col bg-zinc-950">
      <header className="flex items-center gap-3 border-b border-zinc-800 bg-zinc-950 px-4 py-3">
        <Button variant="ghost" size="sm" onClick={() => navigate("/inbox")}>
          &larr; Back
        </Button>
        <h1 className="text-base font-semibold text-zinc-100">
          {customerName}
        </h1>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-1 flex-col">
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
