import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "../firebase/auth";
import { getUserProfileByUid } from "../firebase/userProfile";

export async function loginWithEmailPassword(email, password) {
  if (!email || !password) {
    throw new Error("Email and password are required");
  }
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function logout() {
  await signOut(auth);
}

export function listenAuthSession(onUser, onLogout, onError) {
  return onAuthStateChanged(auth, async (fbUser) => {
    try {
      if (!fbUser?.uid) {
        onLogout?.();
        return;
      }

      const profile = await getUserProfileByUid(fbUser.uid);

      // Must have real schoolId (no fallback)
      if (!profile?.schoolId) {
        onError?.("No schoolId found for this user");
        onLogout?.();
        return;
      }

      onUser?.(profile);
    } catch (error) {
      onError?.(error?.message || "Cannot load user profile");
      onLogout?.();
    }
  });
}