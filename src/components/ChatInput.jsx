// src/components/ChatInput.jsx
import React from "react";

export default function ChatInput({ input, setInput, onSend }) {
  const sendMessage = () => {
    if (!input.trim()) return;
    onSend();
  };

  return (
    <div className="px-4 py-4 bg-white border-t border-slate-200 shadow-sm">
      <div className="max-w-3xl mx-auto flex items-center gap-3">

        {/* Input Field */}
        <input
          type="text"
          value={input}
          placeholder="Ask about shows, timings, ticket prices..."
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          className="
            flex-1 px-5 py-3
            rounded-full
            border border-slate-300
            bg-slate-50
            shadow-inner
            text-slate-700
            placeholder-slate-400
            focus:outline-none
            focus:ring-2 focus:ring-teal-500 focus:border-teal-500
            transition
          "
        />

        {/* Send Button */}
        <button
          onClick={sendMessage}
          disabled={!input.trim()}
          className={`
            flex items-center gap-2
            px-5 py-3
            rounded-full
            font-medium
            text-white
            transition-transform
            shadow-md
            active:scale-95
            ${
              input.trim()
                ? "bg-teal-600 hover:bg-teal-700"
                : "bg-slate-300 cursor-not-allowed"
            }
          `}
        >
          <span>Send</span>
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 12h14M12 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
