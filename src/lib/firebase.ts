import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBD0-wXSr9zCiVUPP3nhPLrFhyzGe10_lc",
  authDomain: "my-resume-app-1375a.firebaseapp.com",
  projectId: "my-resume-app-1375a",
  storageBucket: "my-resume-app-1375a.firebasestorage.app",
  messagingSenderId: "136023997064",
  appId: "1:136023997064:web:c8fc97963b2e5b36d1fd3d",
  measurementId: "G-7S1XT8HVSV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Services
export const auth = getAuth(app);
export const db = getFirestore(app);
