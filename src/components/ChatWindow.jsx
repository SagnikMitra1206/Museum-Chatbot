import React, { useRef, useEffect, useState } from "react";

export default function ChatWindow({ messages, isTyping, handleBook }) {
  const chatEndRef = useRef(null);
  const [ticketSelections, setTicketSelections] = useState({});

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleQuantityChange = (msgIndex, showId, value) => {
    setTicketSelections((prev) => ({
      ...prev,
      [msgIndex]: {
        ...prev[msgIndex],
        [showId]: value,
      },
    }));
  };

  const handleConfirm = (msgIndex, options) => {
    const selections = ticketSelections[msgIndex] || {};
    const selectedShows = options.filter((opt) => selections[opt.id]);

    if (selectedShows.length === 0) {
      alert("Please select at least one show before confirming!");
      return;
    }

    selectedShows.forEach((show) => {
      const quantity = selections[show.id] || 1;
      handleBook(show.id, show.name, quantity);
    });
  };

  return (
    <section className="flex-1 bg-white rounded-lg shadow-md flex flex-col h-[80vh]">
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[75%] p-3 rounded-lg ${
                msg.sender === "user"
                  ? "bg-green-600 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              {msg.text}

              {msg.options && (
                <div className="mt-3 space-y-3">
                  {msg.options.map((opt) => (
                    <div
                      key={opt.id}
                      className="flex flex-col border rounded-lg p-2 bg-white shadow-sm"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <strong>{opt.name}</strong>
                          <p className="text-sm text-gray-600">
                            {opt.day} at {opt.time} — ₹{opt.price}
                          </p>
                          <p className="text-xs text-gray-500">
                            {opt.available_tickets} tickets available
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <label className="text-sm text-gray-700">🎟</label>
                          <input
                            type="number"
                            min="1"
                            max={opt.available_tickets}
                            defaultValue="1"
                            className="w-16 border rounded px-1 text-center"
                            onChange={(e) =>
                              handleQuantityChange(
                                index,
                                opt.id,
                                parseInt(e.target.value)
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <button
                    className="mt-3 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
                    onClick={() => handleConfirm(index, msg.options)}
                  >
                    Confirm Booking
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-800 max-w-[30%] p-3 rounded-lg animate-pulse">
              Bot is typing...
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>
    </section>
  );
}
