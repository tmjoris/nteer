import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import firebaseServices from "./firebase.js"; 

const {db} = firebaseServices;

export const getUserDetailsByEmail = async (email) => {
    try {
        const usersRef = collection(db, "user");
        const q = query(usersRef, where("email", "==", email));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            console.log("No user found with this email.");
            return null;
        }

        let userData;
        querySnapshot.forEach((doc) => {
            userData = { id: doc.id, ...doc.data() };
        });

        return userData;
    } catch (error) {
        console.error("Error fetching user details:", error);
        throw new Error(error.message);
    }
};