// src/pages/MainApp.jsx
import React, { useState, useRef, useEffect } from "react";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import ChatWindow from "../components/ChatWindow";
import ChatInput from "../components/ChatInput";
import SidebarSessions from "../components/SidebarSessions";
import ShowsSidebar from "../components/ShowsSidebar";
import Header from "../components/Header";
import {
  loadChatHistory,
  loadSessions,
  saveMessage,
  deleteSession,
} from "../services/chatService";
import { sendToDialogflow } from "../services/dialogflowService";
import { bookTickets } from "../services/bookingService";

export default function MainApp() {
  // ✅ Start with greeting message
  const [messages, setMessages] = useState([
    { sender: "bot", text: "👋 Welcome to the Museum Chatbot! How can I assist you today?" },
  ]);
  const [shows, setShows] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [sessionId, setSessionId] = useState(`session_${Date.now()}`);
  const [isTyping, setIsTyping] = useState(false);
  const [input, setInput] = useState("");
  const chatEndRef = useRef(null);

  // ✅ Auto-scroll for chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // ✅ Load sessions and chat history (show greeting if none exists)
  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    loadSessions(userId, setSessions);

    loadChatHistory(userId, sessionId, (history) => {
      if (history && history.length > 0) {
        setMessages(history);
      } else {
        // Keep greeting if no previous chat exists
        setMessages([
          { sender: "bot", text: "👋 Welcome to the Museum Chatbot! How can I assist you today?" },
        ]);
      }
    });
  }, [sessionId]);

  // ✅ Fetch all shows
  useEffect(() => {
    const fetchShows = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/shows");
        const data = await res.json();
        setShows(data);
      } catch (err) {
        console.error("❌ Error fetching shows:", err);
      }
    };
    fetchShows();
  }, []);

  // ✅ Handle user send
  const handleSend = async () => {
    if (!input.trim()) return;
    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    await saveMessage(auth.currentUser?.uid, "user", input, sessionId);
    const botReply = await sendToDialogflow(input, sessionId, auth.currentUser?.uid);
    setMessages((prev) => [...prev, botReply]);
    await saveMessage(auth.currentUser?.uid, "bot", botReply.text, sessionId);
    setIsTyping(false);
  };

  // ✅ Handle booking
  const handleBook = async (showId, showName, qty) => {
    const reply = await bookTickets(showId, showName, qty, auth.currentUser?.uid);
    setMessages((prev) => [...prev, { sender: "bot", text: reply }]);
  };

  // ✅ Handle new chat
  const handleNewChat = async () => {
    const newSessionId = `session_${Date.now()}`;
    setSessionId(newSessionId);
    setMessages([
      { sender: "bot", text: "👋 Hi there! A new chat has started. How can I assist you today?" },
    ]);
  };

  // ✅ Handle session delete
  const handleDeleteSession = async (sid) => {
    const res = await deleteSession(sid);
    if (res.success) {
      setSessions((prev) => prev.filter((s) => s.session_id !== sid));
      if (sid === sessionId) {
        await handleNewChat();
      }
    } else {
      alert("Failed to delete session");
    }
  };

  // ✅ Logout
  const handleLogout = async () => {
    await signOut(auth);
    window.location.reload();
  };

  // ✅ JSX Render
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header onNewChat={handleNewChat} onLogout={handleLogout} />
      <main className="flex-1 flex flex-col md:flex-row gap-4 p-4">
        <SidebarSessions
          sessions={sessions}
          sessionId={sessionId}
          setSessionId={setSessionId}
          handleDeleteSession={handleDeleteSession}
        />
        <ChatWindow
          messages={messages}
          isTyping={isTyping}
          handleBook={handleBook}  // ✅ Correct prop name
        />
        <ShowsSidebar shows={shows} handleBook={handleBook} setShows={setShows} />
      </main>
      <ChatInput input={input} setInput={setInput} onSend={handleSend} />
    </div>
  );
}
