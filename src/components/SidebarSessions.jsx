// src/components/SidebarSessions.jsx
import React from "react";

export default function SidebarSessions({
  sessions = [],
  sessionId,
  setSessionId,
  handleDeleteSession,
}) {
  const fmt = (iso) => new Date(iso).toLocaleString();

  const onDelete = async (sid, e) => {
    e.stopPropagation();
    if (!confirm("Delete this chat?")) return;
    await handleDeleteSession(sid);
  };

  return (
    <aside className="w-full md:w-72 bg-white rounded-lg shadow p-3 h-[80vh] overflow-auto">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">💬 Chats</h3>
        <button
          onClick={() => setSessionId(null)}
          className="text-xs px-2 py-1 bg-teal-600 text-white rounded"
        >
          + New
        </button>
      </div>

      {sessions.length === 0 ? (
        <div className="text-sm text-slate-500">No chats yet.</div>
      ) : (
        <ul className="space-y-2">
          {sessions.map((s) => {
            const active = s.session_id === sessionId;
            const title = s.title || "Chat";
            const snippet = s.snippet || (s.messages?.[0]?.text ?? "");
            return (
              <li
                key={s.session_id}
                onClick={() => setSessionId(s.session_id)}
                className={`flex items-start justify-between gap-3 p-3 rounded-md cursor-pointer transition ${
                  active ? "bg-teal-50 border border-teal-200" : "hover:bg-slate-50"
                }`}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && setSessionId(s.session_id)}
              >
                <div className="min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium truncate">{title}</div>
                    <div className="text-xs text-slate-400 ml-2">{fmt(s.started_at)}</div>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 truncate">{snippet}</p>
                </div>

                <button
                  onClick={(e) => onDelete(s.session_id, e)}
                  className="ml-2 text-xs bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded"
                  aria-label={`Delete chat started ${fmt(s.started_at)}`}
                >
                  Delete
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}
