import { useEffect, useRef } from "react";
import { ChatDots } from "@phosphor-icons/react";
import type { Message } from "../api/types";
import MessageBubble from "./MessageBubble";

export default function MessageList({
  messages,
  ownSender,
}: {
  messages: Message[];
  ownSender?: string;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 text-sm text-zinc-500">
        <ChatDots size={36} className="text-zinc-700" />
        <p>No messages yet</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-4">
      {messages.map((m) => (
        <MessageBubble key={m.message_id} message={m} ownSender={ownSender} />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
