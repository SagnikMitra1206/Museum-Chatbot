// src/pages/ChatBot.jsx
import React from "react";

function ChatBot() {
  return (
    <div style={{ width: "350px", height: "430px", border: "1px solid #ccc", borderRadius: "8px", overflow: "hidden" }}>
      <iframe
        src="https://bot.dialogflow.com/89042db0-e5cb-4c02-80ec-0e28d5fc7481"
        width="100%"
        height="100%"
        title="Museum Chatbot"
        style={{ border: "none" }}
      ></iframe>
    </div>
  );
}

export default ChatBot;