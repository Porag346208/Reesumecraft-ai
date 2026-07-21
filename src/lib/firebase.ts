import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCZ3F3Qsp63XcS9QH2KestGn3Cbxo4EW_4",
  authDomain: "sacred-key-82l12.firebaseapp.com",
  projectId: "sacred-key-82l12",
  storageBucket: "sacred-key-82l12.firebasestorage.app",
  messagingSenderId: "594754928841",
  appId: "1:594754928841:web:76b08986776bbc689a8d18"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app, "ai-studio-resumescraftai-71cace9b-26f1-4eda-be96-e4d5e536be68");
