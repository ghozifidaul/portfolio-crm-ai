import { useState, type FormEvent, useRef, useEffect } from "react";

export default function ReplyInput({
  onSend,
  disabled,
}: {
  onSend: (text: string) => Promise<void>;
  disabled: boolean;
}) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || sending || disabled) return;

    setSending(true);
    setText("");
    try {
      await onSend(trimmed);
    } finally {
      setSending(false);
      textareaRef.current?.focus();
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-end gap-2 border-t border-gray-200 bg-white p-4"
    >
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
          }
        }}
        placeholder="Type a reply..."
        rows={1}
        disabled={disabled}
        className="max-h-32 min-h-[36px] flex-1 resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-400 disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={!text.trim() || sending || disabled}
        className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-40 hover:bg-gray-800"
      >
        {sending ? "..." : "Send"}
      </button>
    </form>
  );
}
