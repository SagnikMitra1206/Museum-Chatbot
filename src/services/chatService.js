import { auth } from "../firebase";

export async function loadChatHistory(userId, sessionId, setMessages) {
  const res = await fetch(`http://localhost:5000/api/chat/history/${userId}/${sessionId}`);
  const data = await res.json();
  if (data.success) setMessages(data.messages.map((m) => ({ sender: m.sender, text: m.message })));
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
  console.log("🧹 Deleting session:", sid, "for user:", userId);

  const res = await fetch(`http://localhost:5000/api/chat/clear/${userId}/${sid}`, {
    method: "DELETE",
  });

  const data = await res.json();
  console.log("🧾 Delete response:", data);
  return data;
}
