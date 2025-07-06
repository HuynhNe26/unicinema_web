// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCmQ28yB0uCBOPa9dKbyWIYpH2gieJ3tWI",
  authDomain: "unicinema-80396.firebaseapp.com",
  projectId: "unicinema-80396",
  storageBucket: "unicinema-80396.firebasestorage.app",
  messagingSenderId: "503641676608",
  appId: "1:503641676608:web:f35437aacdbef9c4c2f8a5",
  measurementId: "G-N8SHR5E70L"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export {db}