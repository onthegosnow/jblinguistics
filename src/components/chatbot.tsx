"use client";

import { FormEvent, useState } from "react";

type ChatMessage = {
  sender: "bot" | "user";
  text: string;
};

const INITIAL_MESSAGE: ChatMessage = {
  sender: "bot",
  text: "Hi there! Let me know how we can help and the JB Linguistics team will follow up shortly.",
};

export function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [draft, setDraft] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;

    setMessages((prev) => [...prev, { sender: "user", text }]);
    setDraft("");

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text:
            "Thank you! We'll route this to the right specialist and reply via email soon.",
        },
      ]);
    }, 400);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 text-sm">
      {open && (
        <div className="mb-2 w-80 rounded-2xl border border-slate-200 bg-white shadow-xl shadow-sky-900/20">
          <div className="flex items-center justify-between rounded-t-2xl bg-sky-900 px-4 py-2 text-white">
            <span className="font-semibold text-sm">JB Linguistics Bot</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close chat bot"
              className="text-lg leading-none"
            >
              ×
            </button>
          </div>
          <div className="max-h-64 overflow-y-auto px-4 py-3 space-y-2 text-slate-700">
            {messages.map((msg, index) => (
              <div
                key={`${msg.sender}-${index}-${msg.text.slice(0, 4)}`}
                className={`rounded-2xl px-3 py-2 ${
                  msg.sender === "bot"
                    ? "bg-slate-100 text-slate-700"
                    : "bg-sky-100 text-sky-900 ml-auto"
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 border-t border-slate-100 px-3 py-2"
          >
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Type your message…"
              className="flex-1 rounded-full border border-slate-200 px-3 py-1 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <button
              type="submit"
              className="rounded-full bg-teal-600 px-3 py-1 text-xs font-semibold text-white hover:bg-teal-500"
            >
              Send
            </button>
          </form>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="rounded-full bg-sky-900 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-sky-900/40 hover:bg-sky-800"
      >
        {open ? "Close chat" : "Chat with us"}
      </button>
    </div>
  );
}

export default ChatbotWidget;
