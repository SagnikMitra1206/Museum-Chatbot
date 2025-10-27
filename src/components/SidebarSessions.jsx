import React from "react";

export default function SidebarSessions({
  sessions,
  sessionId,
  setSessionId,
  handleDeleteSession,
}) {
  const confirmDelete = async (sid) => {
    const confirm = window.confirm("🗑️ Are you sure you want to delete this chat?");
    if (confirm) {
      await handleDeleteSession(sid);
    }
  };

  return (
    <section className="w-full md:w-1/4 bg-white rounded-lg shadow-md p-4 h-[80vh] overflow-y-auto relative z-50">
      <h2 className="text-lg font-semibold mb-4">💬 Previous Chats</h2>

      {sessions.length === 0 ? (
        <p className="text-gray-500">No previous chats yet.</p>
      ) : (
        <ul className="space-y-2">
          {sessions.map((s) => (
            <li
              key={s.session_id}
              className={`p-3 border rounded flex justify-between items-center transition cursor-pointer ${
                s.session_id === sessionId
                  ? "bg-green-100 border-green-400"
                  : "hover:bg-green-50"
              }`}
              onClick={() => setSessionId(s.session_id)}
            >
              <span className="text-sm font-medium text-gray-700">
                🕒 {new Date(s.started_at).toLocaleString()}
              </span>

              {/* ❌ Button */}
              <button
                type="button"
                className="bg-red-500 text-white text-xs px-2 py-1 rounded hover:bg-red-600 active:scale-95 transition-transform z-50"
                onClick={(e) => {
                  e.stopPropagation(); // Prevent parent click
                  confirmDelete(s.session_id);
                }}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
