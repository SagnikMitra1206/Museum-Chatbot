import React from "react";
import { formatTime } from "../utils/formatTime";

export default function ShowsSidebar({ shows, handleBook, setShows }) {
  return (
    <section className="w-full md:w-1/3 bg-white rounded-lg shadow-md p-4 h-[80vh] overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4">🎭 Available Shows</h2>
      {shows.length === 0 ? (
        <p className="text-gray-500">Loading shows...</p>
      ) : (
        <ul className="space-y-3">
          {shows.map((show) => (
            <li key={show.id} className="border p-3 rounded-lg hover:bg-gray-50 transition">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-gray-800">{show.name}</h3>
                <span className="text-sm text-gray-600">{show.day_of_week}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-700 mt-1">
                <span>🕒 {formatTime(show.start_time)}</span>
                <span>🎟 {show.available_tickets} left</span>
                <span>💰 ₹{show.price}</span>
              </div>
              <div className="flex items-center justify-between mt-3">
                <input
                  type="number"
                  min="1"
                  max={show.available_tickets}
                  defaultValue="1"
                  className="w-16 border rounded px-1 text-center"
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
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded"
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
