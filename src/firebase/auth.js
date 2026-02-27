import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { app } from "./firebaseConfig";

export const auth = getAuth(app);

export async function loginWithEmailPassword(email, password) {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
}

export function listenAuthState(callback) {
  return onAuthStateChanged(auth, callback);
}

export async function logout() {
  await signOut(auth);
}