import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCZ3F3Qsp63XcS9QH2KestGn3Cbxo4EW_4",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "sacred-key-82l12.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "sacred-key-82l12",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "sacred-key-82l12.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "594754928841",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:594754928841:web:76b08986776bbc689a8d18",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || ""
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const dbId = import.meta.env.VITE_FIREBASE_FIRESTORE_DB_ID || 
  (firebaseConfig.projectId === "sacred-key-82l12" ? "ai-studio-resumescraftai-71cace9b-26f1-4eda-be96-e4d5e536be68" : "(default)");

// Initialize Services
export const auth = getAuth(app);
export const db = dbId && dbId !== "(default)" ? getFirestore(app, dbId) : getFirestore(app);
