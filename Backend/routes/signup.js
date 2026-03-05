import { createUserWithEmailAndPassword } from "firebase/auth";
import firebaseServices from '../firebase.js'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import express from "express";

const { auth, db } = firebaseServices;
const router = express.Router();

router.post("/", async(req, res) => {
    try {
        const { fullName, email, password, phoneNumber, userRole } = req.body;
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const userCollection = collection(db, "user");
        const docRef = await addDoc(userCollection, {
            email, 
            fullName, 
            phoneNumber, 
            userRole,
            createdOn: serverTimestamp()
        });
        console.log('User created with User ID:', docRef.id);
        res.status(201).json({ message: "User created successfully", user: user });
    } catch (error) {
        res.status(400).json({ message: "Error creating user", error: error.message });
    }
});

export default router;