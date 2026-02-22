import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { app } from "./firestore";

// Create Firebase Auth instance from Firebase app
// This is used by the whole system to check login state
export const auth = getAuth(app);

// This function returns the auth instance
export function getFirebaseAuth() {
  return auth;
}

// This function logs in user with email and password
// It returns a simple object with uid and email
export async function loginWithEmailPassword(email, password) {
  const result = await signInWithEmailAndPassword(auth, email, password);
  const user = result.user;

  return {
    uid: user.uid,
    email: user.email || "",
  };
}

// This function logs out current user
export async function logout() {
  await signOut(auth);
}

// This function listens to login state changes
// It calls onChange with user data or null
export function watchAuthState(onChange) {
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