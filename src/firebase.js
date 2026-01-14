// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC6suIUVNHlD7U9TBztVDk45DgjJDGG__s",
  authDomain: "museum-chatbot-web.firebaseapp.com",
  projectId: "museum-chatbot-web",
  storageBucket: "museum-chatbot-web.firebasestorage.app",
  messagingSenderId: "292461273433",
  appId: "1:292461273433:web:43eb1436fc706f34fc2c48"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and Google provider
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
