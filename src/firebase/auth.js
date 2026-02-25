// src/firebase/auth.js
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

import { auth, db } from "./firebase";

// ✅ Create admin user + save profile in Firestore
export async function signupAdmin({ fullName, email, password }) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  const uid = cred.user.uid;

  // Save user profile in Firestore
  await setDoc(doc(db, "users", uid), {
    uid,
    fullName,
    email,
    role: "admin",
    createdAt: serverTimestamp(),
  });

  return cred.user;
}

export async function loginWithEmail(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function requestPasswordReset(email) {
  await sendPasswordResetEmail(auth, email);
}

export async function logout() {
  await signOut(auth);
}