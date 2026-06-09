import type { Message } from "../api/types";

export default function MessageBubble({
  message,
  ownSender = "agent",
}: {
  message: Message;
  ownSender?: string;
}) {
  const isOwn = message.sender === ownSender;

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
          isOwn
            ? "rounded-br-md bg-blue-500 text-white"
            : "rounded-bl-md bg-gray-100 text-gray-900"
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
        <p
          className={`mt-1 text-right text-[10px] ${
            isOwn ? "text-blue-200" : "text-gray-400"
          }`}
        >
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
}
