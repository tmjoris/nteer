import express from "express";
import { collection, getDocs } from "firebase/firestore";
import firebaseServices from "../firebase.js";

const {auth, db} = firebaseServices;
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const snapshot = await getDocs(collection(db, "locations"));

    const locations = snapshot.docs.map(doc => ({
      key: doc.id,
      ...doc.data()
    }));

    res.json(locations);

  } catch (error) {
    res.status(500).json({ message: "Failed to fetch locations", error});
  }
});

/* POST add new location */
router.post("/", async (req, res) => {
  try {
    const { key, name, location, cause, capacity, current, impactScore } = req.body;

    if (!key || !name || !location) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    await setDoc(doc(db, "locations", key), {
      name,
      location,
      cause,
      capacity,
      current,
      impactScore
    });

    res.status(201).json({ message: "Location added successfully" });

  } catch (error) {
    res.status(500).json({ message: "Failed to add location", error });
  }
});

export default router;