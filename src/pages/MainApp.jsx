import React from "react";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";

export default function MainApp() {
  const handleLogout = async () => {
    await signOut(auth);
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-blue-700 text-white p-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Museum Chatbot</h1>
        <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded">Logout</button>
      </header>
      <main className="flex-1 p-6 flex flex-col md:flex-row gap-6">
        <section className="flex-1 bg-white rounded-xl shadow-md p-4">
          <h2 className="text-xl font-semibold mb-4">Chatbot</h2>
          <div className="border p-4 h-96 overflow-y-auto">Chat messages go here...</div>
          <input type="text" placeholder="Type a message..." className="mt-4 w-full p-2 border rounded" />
          <button className="mt-2 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded">Send</button>
        </section>
        <section className="flex-1 bg-white rounded-xl shadow-md p-4">
          <h2 className="text-xl font-semibold mb-4">Available Shows</h2>
          <ul className="space-y-3">
            <li className="flex justify-between border p-3 rounded"><span>Ancient Art Exhibit</span><button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded">Book</button></li>
            <li className="flex justify-between border p-3 rounded"><span>Modern Sculpture Tour</span><button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded">Book</button></li>
          </ul>
        </section>
      </main>
      <footer className="bg-gray-200 text-center p-4">&copy; 2025 Museum Chatbot</footer>
    </div>
  );
}
