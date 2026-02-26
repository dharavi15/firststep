import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "./firebase";

export async function loginWithEmailPassword(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function logoutFirebase() {
  await signOut(auth);
}