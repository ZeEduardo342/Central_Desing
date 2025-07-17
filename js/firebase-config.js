// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA1md79IxvZ_UNBnhntfRV-4ikcMCsYcnQ",
  authDomain: "controlegastos-ce3aa.firebaseapp.com",
  projectId: "controlegastos-ce3aa",
  storageBucket: "controlegastos-ce3aa.firebasestorage.app",
  messagingSenderId: "577931310089",
  appId: "1:577931310089:web:8e5a915b206ba92f9bf4d8",
  measurementId: "G-DD43XXWPTW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

export { db, analytics };

