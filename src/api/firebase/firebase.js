// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: "unicinema-80396.firebaseapp.com",
  projectId: "unicinema-80396",
  storageBucket: "unicinema-80396.firebasestorage.app",
  messagingSenderId: "503641676608",
  appId: "1:503641676608:web:f35437aacdbef9c4c2f8a5",
  measurementId: "G-N8SHR5E70L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);