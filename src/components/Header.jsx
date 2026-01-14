// src/components/Header.jsx
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase"; // <- uses your existing auth export
import { onAuthStateChanged } from "firebase/auth";

export default function Header({ onNewChat, onLogout }) {
  const [open, setOpen] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const menuRef = useRef(null);
  const btnRef = useRef(null);
  const navigate = useNavigate();

  // Subscribe to Firebase auth changes
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user || null);
    });
    return () => unsub();
  }, []);

  // Close on outside click or Escape
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        btnRef.current &&
        !btnRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    }
    function handleEsc(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  const onKeyToggle = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen((s) => !s);
    }
  };

  const displayName = firebaseUser?.displayName || firebaseUser?.email || "Guest";
  const email = firebaseUser?.email || "guest@museum.example";
  const photoURL = firebaseUser?.photoURL || null;

  return (
    <header className="w-full bg-white/80 backdrop-blur-sm border-b border-slate-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 focus:outline-none"
              aria-label="Go to homepage"
            >
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white shadow">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V7" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M8 3v4M16 3v4" />
                </svg>
              </div>
              <div className="hidden sm:block text-slate-900">
                <div className="text-sm font-semibold">City Museum</div>
                <div className="text-xs text-slate-500 -mt-0.5">Ticketing & Chat</div>
              </div>
            </button>
          </div>

          {/* Center nav (optional) */}
          <nav className="hidden md:flex items-center gap-4">
            <button onClick={() => navigate("/app")} className="text-sm text-slate-600 hover:text-slate-900 px-3 py-1 rounded-md">
              Shows
            </button>
            <button onClick={() => navigate("/chatbot")} className="text-sm text-slate-600 hover:text-slate-900 px-3 py-1 rounded-md">
              Chatbot
            </button>
            <button onClick={() => navigate("/signup")} className="text-sm text-slate-600 hover:text-slate-900 px-3 py-1 rounded-md">
              Membership
            </button>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={onNewChat}
              className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-md text-sm text-slate-700 shadow-sm"
            >
              <span className="text-lg">💬</span>
              <span className="font-medium">New Chat</span>
            </button>

            <div className="relative">
              <button
                ref={btnRef}
                aria-haspopup="true"
                aria-expanded={open}
                onClick={() => setOpen((s) => !s)}
                onKeyDown={onKeyToggle}
                className="flex items-center gap-2 bg-white border border-slate-100 px-2 py-1 rounded-full shadow-sm focus:ring-2 focus:ring-green-400 focus:outline-none"
                title="Account menu"
              >
                {photoURL ? (
                  <img src={photoURL} alt="avatar" className="w-9 h-9 rounded-full object-cover" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-green-600 text-white flex items-center justify-center font-semibold">
                    {displayName[0]?.toUpperCase() ?? "G"}
                  </div>
                )}
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-sm text-slate-800 font-medium">{displayName}</span>
                  <span className="text-xs text-slate-400">Account</span>
                </div>
                <svg className={`w-4 h-4 text-slate-400 transition-transform ${open ? "rotate-180" : "rotate-0"}`} viewBox="0 0 20 20" fill="none">
                  <path d="M5 7l5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              <div
                ref={menuRef}
                role="menu"
                aria-hidden={!open}
                className={`origin-top-right absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-lg border border-slate-100 z-50 transform transition-all duration-150 ${
                  open ? "opacity-100 translate-y-0 scale-100 pointer-events-auto" : "opacity-0 translate-y-1 scale-95 pointer-events-none"
                }`}
              >
                <div className="p-3">
                  <div className="flex items-center gap-3 mb-2">
                    {photoURL ? (
                      <img src={photoURL} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-semibold">
                        {displayName[0]?.toUpperCase() ?? "G"}
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-medium text-slate-900">{displayName}</div>
                      <div className="text-xs text-slate-400">{email}</div>
                    </div>
                  </div>

                  <div className="mt-2 border-t border-slate-100 pt-2">
                    <button onClick={() => { setOpen(false); navigate("/"); }} className="w-full text-left px-3 py-2 rounded-md hover:bg-slate-50 text-sm text-slate-700">🏠 Home</button>
                    <button onClick={() => { setOpen(false); navigate("/app"); }} className="w-full text-left px-3 py-2 rounded-md hover:bg-slate-50 text-sm text-slate-700">🎟️ My Tickets</button>
                    <button onClick={() => { setOpen(false); navigate("/profile"); }} className="w-full text-left px-3 py-2 rounded-md hover:bg-slate-50 text-sm text-slate-700">⚙️ Settings</button>
                    <div className="my-2 border-t border-slate-100" />
                    <button onClick={() => { setOpen(false); onLogout?.(); }} className="w-full text-left px-3 py-2 rounded-md hover:bg-red-50 text-sm text-red-600 font-medium">🚪 Logout</button>
                  </div>

                  <div className="mt-3 text-xs text-slate-400">Signed in: <span className="font-medium text-slate-600">{firebaseUser ? "Yes" : "No"}</span></div>
                </div>
              </div>
            </div>
          </div> {/* Right end */}
        </div>
      </div>
    </header>
  );
}
