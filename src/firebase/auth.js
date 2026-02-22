import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { app } from "./firestore";

// This file provides Firebase Auth functions
// Services and pages can import these functions to login and logout

const auth = getAuth(app);

export function getFirebaseAuth() {
  // Returns the auth instance
  return auth;
}

export async function loginWithEmailPassword(email, password) {
  // Logs in with email and password
  // Returns a simple user object for the app
  const result = await signInWithEmailAndPassword(auth, email, password);
  const user = result.user;

  return {
    uid: user.uid,
    email: user.email || "",
  };
}

export async function logout() {
  // Logs out the current user
  await signOut(auth);
}

export function watchAuthState(onChange) {
  // Listens to login state changes
  // Calls onChange with a user object or null
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    if (!user) {
      onChange(null);
      return;
    }

    onChange({
      uid: user.uid,
      email: user.email || "",
    });
  });

  return unsubscribe;
}