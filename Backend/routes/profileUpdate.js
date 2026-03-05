import express from "express";
import firebaseServices from '../firebase.js'
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { getUserDetailsByEmail } from "../email.js";

const { db } = firebaseServices;


const router = express.Router();

// API to update profile information in the users collection
router.put("/", async (req, res) => {
  try {
    const { email, fullName, phoneNumber, city} = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required to update profile" });
    }

    // Find user by email
    const user = await getUserDetailsByEmail(email);
    const userRef = doc(db, "user", user.id);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user profile fields
    await updateDoc(userRef, {
      fullName,
      phoneNumber,
      city,
    });

    res.status(200).json({ message: "Profile updated successfully" });

  } catch (error) {
    res.status(500).json({ message: "Error updating profile", error: error.message });
  }
});

export default router;