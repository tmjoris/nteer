import express from "express";
import { collection, getDocs } from "firebase/firestore";
import firebaseServices from "../firebase.js";

const router = express.Router();
const { db } = firebaseServices;

// Get all users
router.get("/", async (req, res) => {
  try {
    const usersCollection = collection(db, "user"); // Use `collection()` for Firestore v9+
    const usersSnapshot = await getDocs(usersCollection); // Fetch documents

    let users = [];
    
    usersSnapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error: error.message });
  }
});

export default router;