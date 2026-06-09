import { useParams, useNavigate } from "react-router";
import { useConversation } from "../hooks/useConversation";
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

export default function ConversationPage() {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();
  const {
    messages,
    activeTicket,
    loading,
    error,
    retry,
    send,
    customerName,
  } = useConversation(customerId!);

  return (
    <div className="flex h-screen flex-col">
      <header className="flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-3">
        <button
          onClick={() => navigate("/inbox")}
          className="text-sm text-gray-500 hover:text-gray-800"
        >
          &larr; Back
        </button>
        <h1 className="text-base font-semibold text-gray-900">
          {customerName}
        </h1>
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
              <MessageList messages={messages} />
              <ReplyInput onSend={send} disabled={false} />
            </>
          )}
        </div>
        <TicketSidebar ticket={activeTicket} loading={loading} />
      </div>
    </div>
  );
}
