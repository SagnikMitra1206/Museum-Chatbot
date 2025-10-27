import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminDashboard from "./admin/AdminDashboard";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import MainApp from "./pages/MainApp";
import { auth } from "./firebase";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div className="text-center mt-20 text-xl">Loading...</div>;

  // Optional: Simple admin check (replace with your own logic)
  const isAdmin = user?.email === "newbies.ssdr@gmail.com"; // change to your admin email

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/app" />} />
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/app" />} />

        {/* Main user app */}
        <Route path="/app" element={user ? <MainApp /> : <Navigate to="/login" />} />

        {/* Admin panel */}
        <Route
          path="/admin"
          element={user ? (isAdmin ? <AdminDashboard /> : <Navigate to="/app" />) : <Navigate to="/login" />}
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to={user ? "/app" : "/login"} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
