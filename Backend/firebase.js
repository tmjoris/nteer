import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

process.loadEnvFile();
const apiKey = process.env.FIREBASE_API_KEY;

const firebaseConfig = {
  apiKey: apiKey,
  authDomain: "nteervolunteers.firebaseapp.com",
  projectId: "nteervolunteers",
  storageBucket: "nteervolunteers.firebasestorage.app",
  messagingSenderId: "255671907577",
  appId: "1:255671907577:web:cb288d8dd8269f6379de28"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app); 
const auth = getAuth(app); 

const firebaseServices = { auth, app, db };

export default firebaseServices;