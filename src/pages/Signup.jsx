import React, { useState } from "react";
import { auth, googleProvider } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import museumImage from "../assets/museum.jpg";

export default function Signup() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      await updateProfile(userCredential.user, {
        displayName: name,
        phoneNumber: phone,
      });

      navigate("/app");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/app");
    } catch (err) {
      setError("Google signup failed. Try again.");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center m-0 p-10"
      style={{
        backgroundImage: `url(${museumImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="backdrop-blur-lg bg-white/20 p-8 rounded-2xl shadow-xl w-full max-w-md border border-white/30">
        <h1 className="text-3xl font-bold mb-6 text-center text-white drop-shadow-lg">
          Create Account
        </h1>

        {error && <p className="text-red-300 font-semibold mb-4">{error}</p>}

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium text-white">Full Name</label>
            <input
              type="text"
              className="w-full border border-white/40 bg-white/30 backdrop-blur-xl rounded-md p-2 text-white placeholder-white/70"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-white">Phone</label>
            <input
              type="tel"
              className="w-full border border-white/40 bg-white/30 backdrop-blur-xl rounded-md p-2 text-white placeholder-white/70"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-white">Email</label>
            <input
              type="email"
              className="w-full border border-white/40 bg-white/30 backdrop-blur-xl rounded-md p-2 text-white placeholder-white/70"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block mb-1 font-medium text-white">Password</label>
            <input
              type="password"
              className="w-full border border-white/40 bg-white/30 backdrop-blur-xl rounded-md p-2 text-white placeholder-white/70"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-md shadow-lg"
          >
            Sign Up
          </button>
        </form>

        <div className="my-4 text-center text-white">or</div>

        <button
          onClick={handleGoogleSignup}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md shadow-lg"
        >
          Sign Up with Google
        </button>

        <p className="mt-4 text-center text-white/90">
          Already have an account?{" "}
          <a href="/login" className="text-yellow-300 font-semibold">
            Login
          </a>
        </p>
      </div>
    </div>
  );
}