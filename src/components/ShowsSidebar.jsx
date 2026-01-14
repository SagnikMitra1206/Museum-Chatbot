import React from "react";
import { formatTime } from "../utils/formatTime";

export default function ShowsSidebar({ shows, handleBook, setShows }) {
  return (
    <section className="w-full bg-white rounded-lg shadow-md p-4 overflow-y-auto"
             style={{ maxHeight: "100%" }}>
      <h2 className="text-lg font-semibold mb-4">🎭 Available Shows</h2>
      {shows.length === 0 ? (
        <p className="text-gray-500">Loading shows...</p>
      ) : (
        <ul className="space-y-2">
          {shows.map((show) => (
            <li
              key={show.id}
              className="border p-2 rounded-md hover:bg-gray-50 transition flex flex-col gap-2"
            >
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-gray-800 text-sm md:text-base">{show.name}</h3>
                <span className="text-xs text-gray-600 md:text-sm">{show.day_of_week}</span>
              </div>

              <div className="flex justify-between text-xs md:text-sm text-gray-700">
                <span>🕒 {formatTime(show.start_time)}</span>
                <span>🎟 {show.available_tickets} left</span>
                <span>💰 ₹{show.price}</span>
              </div>

              <div className="flex items-center justify-between mt-2">
                <input
                  type="number"
                  min="1"
                  max={show.available_tickets}
                  defaultValue="1"
                  className="w-12 md:w-16 border rounded px-1 text-center text-xs md:text-sm"
                  onChange={(e) =>
                    setShows((prev) =>
                      prev.map((s) =>
                        s.id === show.id
                          ? { ...s, selectedTickets: parseInt(e.target.value) }
                          : s
                      )
                    )
                  }
                />
                <button
                  onClick={() => handleBook(show.id, show.name, show.selectedTickets || 1)}
                  className="bg-green-600 hover:bg-green-700 text-white px-2 md:px-3 py-1 rounded text-xs md:text-sm"
                >
                  Book
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
