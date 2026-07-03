// src/pages/MainApp.jsx
import React, { useState, useRef, useEffect } from "react";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";

import { cancelTicket, getMyTickets } from "../services/bookingService";

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

export default function MainApp() {
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "👋 Welcome to the Museum Chatbot! How can I assist you today?",
    },
  ]);

  const [shows, setShows] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [sessionId, setSessionId] = useState(`session_${Date.now()}`);
  const [isTyping, setIsTyping] = useState(false);
  const [myTickets, setMyTickets] = useState([]);
  const [input, setInput] = useState("");
  const [activePanel, setActivePanel] = useState(null);

  const [currentBooking, setCurrentBooking] = useState(null); // 🔥 PAYMENT STATE

  const chatEndRef = useRef(null);

  // =========================
  // Auto-scroll
  // =========================
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // =========================
  // Load sessions + history
  // =========================
  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    loadSessions(userId, setSessions);

    (async () => {
      const history = await loadChatHistory(userId, sessionId);
      if (history.length > 0) setMessages(history);
    })();
  }, [sessionId]);

  // =========================
  // Fetch shows
  // =========================
  useEffect(() => {
    const fetchShows = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/shows");
        const data = await res.json();
        if (data.success) setShows(data.shows || []);
      } catch {
        setShows([]);
      }
    };
    fetchShows();
  }, []);

  // =========================
  // Fetch tickets
  // =========================
  const fetchTickets = async () => {
    const userId = auth.currentUser?.uid || "guest";
    const tickets = await getMyTickets(userId);
    setMyTickets(tickets);
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // =========================
  // Chat send
  // =========================
  const handleSend = async () => {
    if (!input.trim()) return;

    const userId = auth.currentUser?.uid || "guest";

    const userMsg = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    await saveMessage(userId, "user", input, sessionId);

    try {
      const botReply = await sendToDialogflow(input, sessionId, userId);

      const botMsg = {
        sender: "bot",
        text: botReply.text,
        options: botReply.options || [],
      };

      setMessages((prev) => [...prev, botMsg]);
      await saveMessage(userId, "bot", botReply.text, sessionId);
    } catch {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "⚠️ Server error" },
      ]);
    }

    setIsTyping(false);
  };

  // =========================
  // 🔥 NEW BOOKING FLOW
  // =========================
  const handleBook = async (showId, showName, qty = 1) => {
  const userId = auth.currentUser?.uid || "guest";

  console.log("🚀 STEP 1: Calling /booking/create");

  try {
    const res = await fetch("http://localhost:5000/api/booking/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        showId,
        quantity: qty,
        userId,
      }),
    });

    const data = await res.json();

    console.log("📦 BOOKING RESPONSE:", data);

    if (!data.success) {
      setMessages((prev) => [...prev, { sender: "bot", text: data.message }]);
      return;
    }

    console.log("💰 STEP 2: Calling /payment/create");

    const payRes = await fetch("http://localhost:5000/api/payment/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ticketId: data.ticketId,
        amount: data.totalPrice,
      }),
    });

    const payment = await payRes.json();

    console.log("💳 PAYMENT RESPONSE:", payment);

    setCurrentBooking({
      ticketId: data.ticketId,
      paymentId: payment.paymentId,
    });

    setMessages((prev) => [
      ...prev,
      {
        sender: "bot",
        text: `💳 Booking created for ${data.showName}. Choose payment option below.`,
      },
    ]);

  } catch (err) {
    console.error("❌ ERROR:", err);
  }
};

  // =========================
  // 🔥 PAYMENT HANDLER
  // =========================
  const handlePayment = async (mode) => {
    if (!currentBooking) return;

    // 🟢 VERIFY PAYMENT
    const verifyRes = await fetch("http://localhost:5000/api/payment/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        paymentId: currentBooking.paymentId,
        ticketId: currentBooking.ticketId,
        mode,
      }),
    });

    const verify = await verifyRes.json();

    if (verify.status !== "success") {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "❌ Payment failed" },
      ]);
      setCurrentBooking(null);
      return;
    }

    // 🟢 CONFIRM BOOKING
    const confirmRes = await fetch(
      "http://localhost:5000/api/booking/confirm",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ticketId: currentBooking.ticketId,
          paymentStatus: "success",
        }),
      }
    );

    const confirm = await confirmRes.json();

    if (confirm.success) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: `✅ Confirmed!\n🎟 ${confirm.pdfUrl}`,
        },
      ]);

      fetchTickets();
    }

    setCurrentBooking(null);
  };

  // =========================
  // Cancel
  // =========================
  const handleCancel = async (ticketId, showName) => {
    const userId = auth.currentUser?.uid || "guest";

    const result = await cancelTicket(ticketId, userId);

    setMessages((prev) => [
      ...prev,
      { sender: "bot", text: result.message },
    ]);

    fetchTickets();
  };

  // =========================
  // UI
  // =========================
  console.log("🎟 myTickets:", myTickets);
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">

      <Header onLogout={() => signOut(auth)} />

      <main className="flex-1 flex">

  {/* LEFT SIDEBAR */}
  <div className="w-16 flex flex-col items-center bg-white p-2 shadow-md">
    <button
      className={`my-2 p-2 rounded hover:bg-gray-200 ${activePanel === "tickets" ? "bg-gray-200" : ""}`}
      onClick={() => setActivePanel(prev => prev === "tickets" ? null : "tickets")}
    >
      🎟️
    </button>

    <button
      className={`my-2 p-2 rounded hover:bg-gray-200 ${activePanel === "history" ? "bg-gray-200" : ""}`}
      onClick={() => setActivePanel(prev => prev === "history" ? null : "history")}
    >
      💬
    </button>

    <button
      className={`my-2 p-2 rounded hover:bg-gray-200 ${activePanel === "shows" ? "bg-gray-200" : ""}`}
      onClick={() => setActivePanel(prev => prev === "shows" ? null : "shows")}
    >
      🎭
    </button>
  </div>

  {/* CHAT AREA */}
  <div className={`flex-1 flex flex-col bg-white m-2 rounded shadow ${activePanel ? "md:w-2/3" : "w-full"}`}>

    <ChatWindow
      messages={messages}
      isTyping={isTyping}
      handleBook={handleBook}
      handleCancel={handleCancel}
    />

    <div ref={chatEndRef} />

    <ChatInput
      input={input}
      setInput={setInput}
      onSend={handleSend}
    />
  </div>

  {/* RIGHT PANEL */}
  {activePanel && (
    <div className="w-80 bg-white rounded shadow m-2 p-2 overflow-y-auto">

      {/* 🎟️ TICKETS */}
      {activePanel === "tickets" && (
  <div>
    <h2 className="font-bold mb-2">🎟 My Tickets</h2>

    {myTickets.length === 0 ? (
      <p>No tickets yet</p>
    ) : (
      myTickets.map((t) => (
        <div key={t.id} className="border p-2 mb-2 rounded">

          <p className="font-semibold">{t.showName}</p>
          <p className="text-sm">Qty: {t.quantity}</p>

          {t.pdfUrl && (
            <a
              href={t.pdfUrl}
              target="_blank"
    rel="noreferrer"
    className="mt-2 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm transition duration-200"
            >
              🎟 Download Ticket
            </a>
          )}

          <button
            onClick={() => handleCancel(t.id, t.showName)}
            className="bg-red-500 text-white px-2 py-1 rounded mt-2"
          >
            Cancel
          </button>

        </div>
      ))
    )}
  </div>
)}

      {/* 💬 HISTORY */}
      {activePanel === "history" && (
        <SidebarSessions
          sessions={sessions}
          sessionId={sessionId}
          setSessionId={setSessionId}
          handleDeleteSession={deleteSession}
        />
      )}

      {/* 🎭 SHOWS */}
      {activePanel === "shows" && (
        <ShowsSidebar
          shows={shows}
          handleBook={handleBook}
          setShows={setShows}
        />
      )}
    </div>
  )}

</main>

      {/* 🔥 PAYMENT BAR */}
      {currentBooking && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex justify-end gap-3 z-50">
          <button
            onClick={() => handlePayment("success")}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Pay Success
          </button>

          <button
            onClick={() => handlePayment("failed")}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Pay Fail
          </button>
        </div>
      )}

    </div>
  );
}