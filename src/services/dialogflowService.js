export async function sendToDialogflow(message, sessionId, userId) {
  const res = await fetch("http://localhost:5000/api/dialogflow", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, sessionId, userId }),
  });
  const data = await res.json();
  return { sender: "bot", text: data.reply, options: data.options || null };
}
