import React from "react";
import { motion } from "framer-motion";
import { Landmark, ScrollText, Users } from "lucide-react";
import heroImage from "../assets/museum.jpg";

export default function Home() {
  return (
    <div
      className="min-h-screen w-full bg-cover bg-center text-white"
      style={{
        backgroundImage: `url(${heroImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Overlay */}
      <div className="min-h-screen bg-black/50 backdrop-blur-sm flex flex-col">

        {/* NAVBAR */}
        <nav className="flex items-center justify-between px-10 py-5">
          <h1 className="text-2xl font-bold tracking-wide">
            🏛️ Heritage Museum
          </h1>

          <div className="space-x-6 font-medium">
            <a href="/login" className="hover:text-amber-300 transition">
              Login
            </a>
            <a href="/signup" className="hover:text-amber-300 transition">
              Sign Up
            </a>
          </div>
        </nav>

        {/* HERO SECTION */}
        <div className="flex-1 flex flex-col items-center justify-center text-center px-5">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-6xl font-bold drop-shadow-xl"
          >
            Journey Through Time & Civilization
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="mt-4 text-lg md:text-xl max-w-xl text-white/80"
          >
            Explore centuries of history through rare artifacts, ancient
            manuscripts, cultural heritage, and stories that shaped humanity.
          </motion.p>

          <a
            href="/login"
            className="mt-8 bg-amber-600 hover:bg-amber-800 px-8 py-3 rounded-lg text-xl shadow-lg transition"
          >
            Begin Your Visit →
          </a>
        </div>
      </div>

      {/* FEATURES SECTION */}
      <div className="bg-black/80 py-16 px-6 md:px-16">
        <h2 className="text-center text-4xl font-bold mb-12">
          Museum Highlights
        </h2>

        <div className="grid md:grid-cols-3 gap-10">

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="p-6 bg-white/10 rounded-2xl backdrop-blur-lg shadow-lg border border-white/20"
          >
            <Landmark className="w-12 h-12 text-amber-400 mb-4" />
            <h3 className="text-2xl font-semibold mb-2">
              Historical Artifacts
            </h3>
            <p className="text-white/80">
              Discover ancient tools, sculptures, coins, weapons, and relics
              from civilizations across the world.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="p-6 bg-white/10 rounded-2xl backdrop-blur-lg shadow-lg border border-white/20"
          >
            <ScrollText className="w-12 h-12 text-emerald-400 mb-4" />
            <h3 className="text-2xl font-semibold mb-2">
              Manuscripts & Records
            </h3>
            <p className="text-white/80">
              Explore preserved manuscripts, royal decrees, ancient texts,
              and historical documents from different eras.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="p-6 bg-white/10 rounded-2xl backdrop-blur-lg shadow-lg border border-white/20"
          >
            <Users className="w-12 h-12 text-blue-400 mb-4" />
            <h3 className="text-2xl font-semibold mb-2">
              Guided Experiences
            </h3>
            <p className="text-white/80">
              Learn through curated tours, expert narratives, and interactive
              exhibits designed for students and history enthusiasts.
            </p>
          </motion.div>

        </div>
      </div>

      {/* CTA SECTION */}
      <div className="bg-gradient-to-br from-amber-00 to-orange-800 py-16 text-center">
        <h2 className="text-4xl font-bold mb-4">
          Meet the Virtual Museum Guide
        </h2>
        <p className="text-white/80 max-w-2xl mx-auto text-lg mb-6">
          Ask questions about artifacts, timelines, dynasties, and cultural
          heritage with our intelligent virtual guide.
        </p>

        <a
          href="/app"
          className="bg-white text-amber-700 font-semibold px-10 py-3 rounded-lg shadow-lg hover:bg-gray-200 transition"
        >
          Talk to the Guide 📜
        </a>
      </div>
    </div>
  );
}