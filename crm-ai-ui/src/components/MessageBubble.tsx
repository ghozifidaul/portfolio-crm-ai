import { motion, useReducedMotion } from "motion/react";
import type { Message } from "../api/types";

export default function MessageBubble({
  message,
  ownSender = "agent",
}: {
  message: Message;
  ownSender?: string;
}) {
  const isOwn = message.sender === ownSender;
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
          isOwn
            ? "rounded-br-md bg-blue-600 text-white"
            : "rounded-bl-md bg-zinc-800 text-zinc-100"
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
        <p
          className={`mt-1 text-right text-[10px] ${
            isOwn ? "text-blue-200" : "text-zinc-500"
          }`}
        >
          {new Date(message.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </motion.div>
  );
}
