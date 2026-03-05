import { signInWithEmailAndPassword } from 'firebase/auth';
import firebaseServices from '../firebase.js';
import express from "express";

const router = express.Router();
const {auth} = firebaseServices;

router.post("/", async(req, res)=>{
    try{
        const { email, password} = req.body;

        if(!email || !password){
            return res.status(400).json({message: "Both email and password are required"});
        }
        const userData = await signInWithEmailAndPassword(auth, email, password);
        res.status(200).json({message:"Login successful", user:userData});

    } catch(error) {    
        res.status(401).json({message: "Invalid credentials"});
    }
});

export default router;