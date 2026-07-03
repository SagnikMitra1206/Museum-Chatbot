import React, { useEffect, useRef, useState } from "react";

export default function ChatInput({ input, setInput, onSend }) {
  const [isListening, setIsListening] = useState(false);

  const timerRef = useRef(null);

  // ⏱️ AUTO SEND AFTER 5s SILENCE
  const resetAutoSendTimer = (value) => {
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      const msg = value?.trim();

      if (msg) {
        onSend(msg);
        setInput("");
      }
    }, 5000);
  };

  // 🧠 whenever input changes → restart timer
  useEffect(() => {
    if (input?.trim()) {
      resetAutoSendTimer(input);
    }

    return () => clearTimeout(timerRef.current);
  }, [input]);

  // 📤 manual send
  const sendMessage = () => {
    const msg = input.trim();
    if (!msg) return;

    clearTimeout(timerRef.current);
    onSend(msg);
    setInput("");
  };

  // 🎤 voice input
  const handleVoice = () => {
    if (isListening) return;

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice not supported");
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.continuous = false;

    setIsListening(true);

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;

      if (text?.trim()) {
        setInput(text); // 🔥 same as typing
      }
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    <div className="px-4 py-4 bg-white border-t">
      <div className="flex gap-3 max-w-3xl mx-auto">

        {/* 🎤 Mic */}
        <button
          onClick={handleVoice}
          disabled={isListening}
          className={`p-3 rounded-full ${
            isListening ? "bg-red-500 text-white" : "bg-gray-200"
          }`}
        >
          🎤
        </button>

        {/* 📝 Input */}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage();
          }}
          placeholder={isListening ? "Listening..." : "Type or speak..."}
          className="flex-1 px-4 py-3 border rounded-full"
        />

        {/* 📤 Send */}
        <button
          onClick={sendMessage}
          disabled={!input.trim()}
          className="px-5 py-3 bg-teal-600 text-white rounded-full disabled:bg-gray-300"
        >
          Send
        </button>
      </div>
    </div>
  );
}