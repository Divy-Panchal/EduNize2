// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging } from "firebase/messaging";

// Your web app's Firebase configuration
// IMPORTANT: Replace with your own Firebase project's configuration
const firebaseConfig = {
  apiKey: "AIzaSyAzf6v3t1fTuCITIf-mhY0AI1ft-yzf1Jc",
  authDomain: "fir-edunize.firebaseapp.com",
  projectId: "fir-edunize",
  storageBucket: "fir-edunize.firebasestorage.app",
  messagingSenderId: "32958674902",
  appId: "1:32958674902:web:ec1336352048ee7cf39677"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const messaging = getMessaging(app);

export { app, auth, db, messaging };
