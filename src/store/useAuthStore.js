import { create } from "zustand";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase/firebase";

const useAuthStore = create((set, get) => ({
  user: null,
  authReady: false,

  loading: false,
  error: "",

  _unsub: null,

  setUser: (user) => set({ user: user || null }),
  setLoading: (isLoading) => set({ loading: Boolean(isLoading) }),
  setError: (msg) => set({ error: msg || "" }),
  setStoreError: (msg) => set({ error: msg || "" }),
  clearStoreError: () => set({ error: "" }),
  setAuthReady: (ready) => set({ authReady: Boolean(ready) }),

  // ✅ NEW: one consistent logout function
  logout: async () => {
    try {
      set({ loading: true, error: "" });

      await signOut(auth);

      // clear local state immediately (listener will also do it)
      set({ user: null, authReady: true });
    } catch (e) {
      console.log("LOGOUT ERROR:", e);
      set({ error: "Logout failed. Please try again." });
    } finally {
      set({ loading: false });
    }
  },

  startAuthListener: () => {
    const oldUnsub = get()._unsub;
    if (oldUnsub) return;

    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      // IMPORTANT: mark as not ready while we resolve profile
      set({ authReady: false });

      // not logged in
      if (!fbUser) {
        set({ user: null, authReady: true });
        return;
      }

      try {
        // read Firestore profile
        const ref = doc(db, "users", fbUser.uid);
        const snap = await getDoc(ref);
        const profile = snap.exists() ? snap.data() : null;

        // admin-only guard at source
        if (!profile || profile.role !== "admin" || profile.isActive === false) {
          // if someone logs in but isn't admin, sign them out
          await signOut(auth);
          set({ user: null, authReady: true });
          return;
        }

        set({
          user: {
            uid: fbUser.uid,
            email: fbUser.email || "",
            ...profile,
            role: "admin", // enforce
          },
          authReady: true,
        });
      } catch (e) {
        console.log("AUTH LISTENER ERROR:", e);
        // if profile fetch fails, treat as logged out (safer for admin-only app)
        set({ user: null, authReady: true });
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