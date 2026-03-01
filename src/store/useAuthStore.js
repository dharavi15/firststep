import { create } from "zustand";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebase";

const useAuthStore = create((set, get) => ({
  // user session
  user: null,

  // for route guard (wait firebase restore)
  authReady: false,

  // legacy fields for LoginPage (keep API stable)
  loading: false,
  error: "",

  // internal unsubscribe
  _unsub: null,

  // legacy setters used by LoginPage.jsx
  setUser: (user) => {
    set({ user: user || null });
  },

  setLoading: (isLoading) => {
    set({ loading: Boolean(isLoading) });
  },

  setError: (msg) => {
    set({ error: msg || "" });
  },

  // also support newer naming 
  setStoreError: (msg) => {
    set({ error: msg || "" });
  },

  clearStoreError: () => {
    set({ error: "" });
  },

  // start firebase auth listener once
  startAuthListener: () => {
    const oldUnsub = get()._unsub;
    if (oldUnsub) return;

    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) {
        set({ user: null, authReady: true });
        return;
      }

      try {
        // users/{uid} 
        const ref = doc(db, "users", fbUser.uid);
        const snap = await getDoc(ref);
        const profile = snap.exists() ? snap.data() : {};

        set({
          user: {
            uid: fbUser.uid,
            email: fbUser.email,
            ...profile,
          },
          authReady: true,
        });
      } catch {
        set({
          user: {
            uid: fbUser.uid,
            email: fbUser.email,
          },
          authReady: true,
        });
      }
    });

    set({ _unsub: unsub });
  },

  stopAuthListener: () => {
    const unsub = get()._unsub;
    if (unsub) unsub();
    set({ _unsub: null });
  },
}));

export default useAuthStore;