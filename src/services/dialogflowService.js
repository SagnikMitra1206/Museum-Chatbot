export async function sendToDialogflow(message, sessionId, userId) {
  const res = await fetch("http://localhost:5000/api/dialogflow", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, sessionId, userId }),
  });

  const data = await res.json();

  // 🔊 Speak bot reply (FREE browser TTS)
  if (data.reply) {
    const speech = new SpeechSynthesisUtterance(data.reply);
    speech.lang = "en-IN";
    window.speechSynthesis.cancel(); // stop previous voice
    window.speechSynthesis.speak(speech);
  }

  return {
    sender: "bot",
    text: data.reply,
    options: data.options || null,
  };
}