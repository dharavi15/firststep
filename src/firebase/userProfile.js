import { collection, getDocs, limit, query, where } from "firebase/firestore";
import { db } from "./firebase";

export async function getUserProfile(email) {
  if (!email) return null;

  const cleanEmail = String(email).trim().toLowerCase();

  const q = query(
    collection(db, "users"),
    where("email", "==", cleanEmail),
    limit(1)
  );

  const snap = await getDocs(q);
  if (snap.empty) return null;

  const doc = snap.docs[0];
  return { id: doc.id, ...doc.data() };
}