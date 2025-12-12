// src/pages/Home.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";

// Replace this with your actual museum logo
const MUSEUM_LOGO =
  "https://png.pngtree.com/png-vector/20190716/ourmid/pngtree-museum-icon-png-image_1546927.jpg";

// Replace background image
const HERO_BG =
  "https://wallpapers.com/images/featured/museum-background-i46ank5l1sk9bubq.jpg";

const FEATURE_IMG =
  "https://images.unsplash.com/photo-1531058020387-3be344556be6?auto=format&fit=crop&w=1200&q=60";

export default function Home() {
  const navigate = useNavigate();
  const isLoggedIn = () => !!auth.currentUser;

  const goChat = () => navigate("/chatbot");

  const handleBook = () => {
    if (isLoggedIn()) navigate("/app");
    else navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">

      {/* ========== HERO SECTION WITH BG IMAGE ========== */}
      <section className="relative h-[80vh] w-full flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div
          className="absolute inset-0 bg-cover bg-center brightness-[0.65]"
          style={{ backgroundImage: `url(${HERO_BG})` }}
        />

        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/40" />

        {/* Content */}
        <div className="relative z-10 text-center max-w-3xl mx-auto px-6">
          {/* Museum Logo */}
          <img
            src={MUSEUM_LOGO}
            alt="Museum Logo"
            className="w-24 h-24 mx-auto mb-4 drop-shadow-lg"
          />

          {/* Museum Name */}
          <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-lg">
            City Museum of History & Art
          </h1>

          {/* Subtitle */}
          <p className="mt-4 text-lg text-gray-200 max-w-xl mx-auto">
            Discover exhibits, explore history, and book your tickets effortlessly.
            Chat with our assistant anytime.
          </p>

          {/* Buttons */}
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <button
              onClick={handleBook}
              className="px-6 py-3 rounded-full bg-white/90 hover:bg-white text-slate-900 font-semibold shadow-lg transition"
            >
              {isLoggedIn() ? "Book Shows" : "Sign in to Book"}
            </button>
          </div>
        </div>
      </section>

      {/* ========== FEATURED SHOW (CLEAN + MINIMAL) ========== */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold mb-6">Featured Show</h2>

        <div className="bg-white rounded-2xl p-6 shadow border flex flex-col md:flex-row gap-4 items-center">
          <img
            src={FEATURE_IMG}
            alt="Featured"
            className="w-full md:w-48 h-40 object-cover rounded-lg"
          />
          <div className="flex-1">
            <div className="text-xs text-slate-400 mb-1">Jan 15, 2026 • 6:30 PM</div>
            <h3 className="font-semibold text-lg">Art & Time — A Retrospective</h3>
            <p className="text-sm text-slate-600 mt-2">
              A curated selection exploring the evolution of art through the centuries.
            </p>
            <div className="mt-4">
              <button
                onClick={handleBook}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
              >
                {isLoggedIn() ? "Book this show" : "Sign in to Book"}
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* ========== FOOTER ========== */}
      <footer className="border-t border-slate-200 py-6">
        <div className="text-center text-sm text-slate-500">
          © {new Date().getFullYear()} City Museum — Open daily 9 AM–6 PM
        </div>
      </footer>
    </div>
  );
}
