// src/components/ChatInput.jsx
import React from "react";

export default function ChatInput({ input, setInput, onSend }) {
  return (
    <div className="p-4 bg-white border-t flex items-center space-x-2">
      <input
        type="text"
        value={input}
        placeholder="Type a message..."
        className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSend()}
      />
      <button onClick={onSend} className="bg-green-600 text-white px-4 py-2 rounded-full">
        Send
      </button>
    </div>
  );
}
