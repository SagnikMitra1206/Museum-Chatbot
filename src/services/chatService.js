import { auth } from "../firebase";

// ✅ FIXED — returns messages instead of trying to call setMessages
export async function loadChatHistory(userId, sessionId) {
  const res = await fetch(`http://localhost:5000/api/chat/history/${userId}/${sessionId}`);
  const data = await res.json();

  if (!data.success) return [];

  // Convert backend format → frontend format
  return data.messages.map((m) => ({
    sender: m.sender,
    text: m.message,
    timestamp: m.timestamp
  }));
}

export async function loadSessions(userId, setSessions) {
  const res = await fetch(`http://localhost:5000/api/chat/sessions/${userId}`);
  const data = await res.json();
  if (data.success) setSessions(data.sessions);
}

export async function saveMessage(userId, sender, text, sessionId) {
  await fetch("http://localhost:5000/api/chat/save-message", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, sender, message: text, sessionId }),
  });
}

export async function deleteSession(sid) {
  const userId = auth.currentUser?.uid;

  const res = await fetch(`http://localhost:5000/api/chat/clear/${userId}/${sid}`, {
    method: "DELETE",
  });

  return await res.json();
}
