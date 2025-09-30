// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBK0_R0Q6dMWvukCr6tCqggIu7wB2s2Y6Y",
  authDomain: "to-do-list-8fd0e.firebaseapp.com",
  projectId: "to-do-list-8fd0e",
  storageBucket: "to-do-list-8fd0e.firebasestorage.app",
  messagingSenderId: "919103981263",
  appId: "1:919103981263:web:9dd8d64b33bbd9f99c59ba",
  measurementId: "G-PCES73Z4E3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
