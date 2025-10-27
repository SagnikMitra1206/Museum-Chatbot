import React from "react";

export default function Header({ onNewChat, onLogout }) {
  return (
    <header className="bg-green-600 text-white p-4 flex justify-between items-center shadow-md">
      <h1 className="text-xl font-bold">🎟️ Museum Chatbot</h1>
      <div className="space-x-2">
        <button
          onClick={onNewChat}
          className="bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded"
        >
          🆕 New Chat
        </button>
        <button
          onClick={onLogout}
          className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded"
        >
          Logout
        </button>
      </div>
    </header>
  );
}
