import React, { useState, useRef, useEffect } from "react";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";

export default function MainApp() {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Welcome to the Museum Chatbot!" }
  ]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef(null);

  const handleLogout = async () => {
    await signOut(auth);
    window.location.reload();
  };

  // Scroll to the latest message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (input.trim() === "") return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);

    setTimeout(() => {
      const botMessage = { sender: "bot", text: "This is a response from the bot." };
      setMessages((prev) => [...prev, botMessage]);
    }, 500);

    setInput("");
  };

  const handleBook = (showName) => {
    const botMessage = { sender: "bot", text: `Booking request received for ${showName}.` };
    setMessages((prev) => [...prev, botMessage]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <header className="bg-green-600 text-white p-4 flex justify-between items-center shadow-md">
        <h1 className="text-xl font-bold">Museum Chatbot</h1>
        <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded">Logout</button>
      </header>

      <main className="flex-1 flex flex-col md:flex-row gap-4 p-4">
        {/* Chat Section */}
        <section className="flex-1 bg-white rounded-lg shadow-md flex flex-col h-[80vh]">
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50">
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-[70%] p-3 rounded-lg ${msg.sender === "user" ? "bg-green-600 text-white" : "bg-gray-200 text-gray-800"}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <div className="p-4 bg-white border-t flex items-center space-x-2">
            <input 
              type="text" 
              placeholder="Type a message..." 
              className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            />
            <button onClick={handleSend} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full">Send</button>
          </div>
        </section>

        {/* Shows Section */}
        <section className="w-full md:w-1/3 bg-white rounded-lg shadow-md p-4 h-[80vh] overflow-y-auto">
          <h2 className="text-lg font-semibold mb-4">Available Shows</h2>
          <ul className="space-y-3">
            {["Ancient Art Exhibit", "Modern Sculpture Tour"].map((show, idx) => (
              <li key={idx} className="flex justify-between items-center border p-3 rounded hover:bg-gray-100">
                <span>{show}</span>
                <button onClick={() => handleBook(show)} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded">Book</button>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="bg-gray-200 text-center p-3 text-sm">&copy; 2025 Museum Chatbot</footer>
    </div>
  );
}
