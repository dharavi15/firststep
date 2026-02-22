import { doc, getDoc } from "firebase/firestore";
import { db } from "./firestore";

// This function reads user profile from Firestore
// It finds a document in users collection using uid
// It returns null when the profile does not exist

export async function getUserProfile(uid) {
  if (!uid) return null;

  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;

  return snap.data();
}