// src/pages/MainApp.jsx
import React, { useState, useRef, useEffect } from "react";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { bookTickets, cancelTicket, getMyTickets } from "../services/bookingService";

import ChatWindow from "../components/ChatWindow";
import ChatInput from "../components/ChatInput";
import SidebarSessions from "../components/SidebarSessions";
import ShowsSidebar from "../components/ShowsSidebar";
import Header from "../components/Header";

import { loadChatHistory, loadSessions, saveMessage, deleteSession } from "../services/chatService";
import { sendToDialogflow } from "../services/dialogflowService";

export default function MainApp() {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "👋 Welcome to the Museum Chatbot! How can I assist you today?" },
  ]);
  const [shows, setShows] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [sessionId, setSessionId] = useState(`session_${Date.now()}`);
  const [isTyping, setIsTyping] = useState(false);
  const [myTickets, setMyTickets] = useState([]);
  const [input, setInput] = useState("");
  const [activePanel, setActivePanel] = useState(null);
  const chatEndRef = useRef(null);

  // Auto-scroll chat
  useEffect(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), [messages, isTyping]);

  // Load sessions + chat history
  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    loadSessions(userId, setSessions);

    (async () => {
      const history = await loadChatHistory(userId, sessionId);
      if (history.length > 0) setMessages(history);
    })();
  }, [sessionId]);

  // Fetch shows
  useEffect(() => {
    const fetchShows = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/shows");
        const data = await res.json();
        setShows(data);
      } catch (err) {
        console.error("Error fetching shows:", err);
      }
    };
    fetchShows();
  }, []);

  // Fetch tickets
  const fetchTickets = async () => {
    const userId = auth.currentUser?.uid || "guest";
    const tickets = await getMyTickets(userId);
    setMyTickets(tickets);
  };

  useEffect(() => { fetchTickets(); }, []);

  // Send chat message
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    const userId = auth.currentUser?.uid || "guest";
    await saveMessage(userId, "user", input, sessionId);

    try {
      const botReply = await sendToDialogflow(input, sessionId, userId);
      setMessages((prev) => [...prev, botReply]);
      await saveMessage(userId, "bot", botReply.text, sessionId);
    } catch {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Sorry — I couldn't reach the chatbot service." },
      ]);
    }

    setIsTyping(false);
  };

  // Book tickets
  const handleBook = async (showId, showName, qty = 1) => {
    const userId = auth.currentUser?.uid || "guest";

    setMessages((prev) => [
      ...prev,
      { sender: "bot", text: "Processing your booking — please wait..." },
    ]);
    setIsTyping(true);

    const result = await bookTickets(showId, showName, qty, userId);

    setMessages((prev) => {
      const clean = prev.filter((m) => m.text !== "Processing your booking — please wait...");
      return [...clean, { sender: "bot", text: result.message }];
    });

    await saveMessage(userId, "bot", result.message, sessionId);
    await fetchTickets();
    setIsTyping(false);
  };

  // Cancel ticket
  const handleCancel = async (ticketId, showName) => {
    const userId = auth.currentUser?.uid || "guest";
    setMessages((prev) => [...prev, { sender: "bot", text: `Cancelling ticket for ${showName}…` }]);
    setIsTyping(true);

    const result = await cancelTicket(ticketId, userId);
    setMessages((prev) => [...prev, { sender: "bot", text: result.message }]);
    await fetchTickets();
    setIsTyping(false);
  };

  // Download ticket PDF
  const handleDownloadTicket = (pdfUrl, bookingCode) => {
    if (!pdfUrl) return alert("PDF not available.");
    const a = document.createElement("a");
    a.href = pdfUrl;
    a.download = `${bookingCode}.pdf`;
    a.click();
  };

  // New chat session
  const handleNewChat = () => {
    const newId = `session_${Date.now()}`;
    setSessionId(newId);
    setMessages([{ sender: "bot", text: "👋 Hi there! A new chat has started. How can I assist you today?" }]);
    setActivePanel(null);
  };

  // Delete session
  const handleDeleteSession = async (sid) => {
    const result = await deleteSession(sid);
    if (result.success) {
      setSessions((prev) => prev.filter((s) => s.session_id !== sid));
      if (sid === sessionId) handleNewChat();
    }
  };

  // Logout
  const handleLogout = async () => {
    await signOut(auth);
    window.location.reload();
  };

  const togglePanel = (panel) => setActivePanel((prev) => (prev === panel ? null : panel));

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header onNewChat={handleNewChat} onLogout={handleLogout} />
      <main className="flex-1 flex">
        {/* Mini Sidebar */}
        <div className="w-16 flex flex-col items-center bg-white p-2 shadow-md">
          <button className={`my-2 p-2 rounded hover:bg-gray-200 ${activePanel === "tickets" ? "bg-gray-200" : ""}`} onClick={() => togglePanel("tickets")}>🎟️</button>
          <button className={`my-2 p-2 rounded hover:bg-gray-200 ${activePanel === "history" ? "bg-gray-200" : ""}`} onClick={() => togglePanel("history")}>💬</button>
          <button className={`my-2 p-2 rounded hover:bg-gray-200 ${activePanel === "shows" ? "bg-gray-200" : ""}`} onClick={() => togglePanel("shows")}>🎭</button>
        </div>

        {/* Main Chat */}
        <div className={`flex-1 flex flex-col transition-all duration-300 ${activePanel ? "md:w-2/3" : "w-full"} bg-white rounded-lg shadow-md m-2`}>
          <ChatWindow messages={messages} isTyping={isTyping} handleBook={handleBook} handleCancel={handleCancel} />
          <div ref={chatEndRef} />
          <ChatInput input={input} setInput={setInput} onSend={handleSend} />
        </div>

        {/* Side Panel */}
        {activePanel && (
          <div className="w-80 bg-white rounded-lg shadow-md overflow-y-auto m-2 p-2">
            {activePanel === "tickets" && (
              <div>
                <h2 className="font-bold text-lg mb-2">🎟️ My Tickets</h2>
                {myTickets.length === 0 ? <p>No tickets booked yet.</p> : (
                  <ul className="space-y-2">
                    {myTickets.map((t) => (
                      <li key={t.id} className="border p-2 rounded flex justify-between items-center">
                        <div>
                          <p className="font-semibold">{t.showName}</p>
                          <p className="text-sm text-gray-500">{t.date} {t.time}</p>
                          <p className="text-sm text-gray-500">Qty: {t.quantity}</p>
                        </div>
                        <div className="flex gap-2">
                          {t.pdfUrl && (
                            <button className="bg-teal-500 text-white px-2 py-1 rounded hover:bg-teal-600 text-sm" onClick={() => handleDownloadTicket(t.pdfUrl, t.bookingId)}>Download</button>
                          )}
                          <button className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 text-sm" onClick={() => handleCancel(t.id, t.showName)}>Cancel</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {activePanel === "history" && (
              <div>
                <h2 className="font-bold text-lg mb-2">💬 Chat History</h2>
                <div className="h-[60vh] overflow-y-auto">
                  <SidebarSessions sessions={sessions} sessionId={sessionId} setSessionId={setSessionId} handleDeleteSession={handleDeleteSession} />
                </div>
              </div>
            )}

            {activePanel === "shows" && (
              <div className="h-[75vh] overflow-y-auto">
                <ShowsSidebar shows={shows} handleBook={handleBook} setShows={setShows} />
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
