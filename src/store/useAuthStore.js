import { create } from "zustand";
import { listenAuthState } from "../firebase/auth";

const useAuthStore = create((set, get) => ({
  user: null,
  loading: false,
  error: "",

  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  unsubscribe: null,

  startAuthListener: () => {
    // prevent double listener
    const existing = get().unsubscribe;
    if (typeof existing === "function") existing();

    const unsub = listenAuthState((firebaseUser) => {
      // sync  auth state 
      // LoginPage will set full profile after login
      if (!firebaseUser) {
        set({ user: null });
        return;
      }

      set((state) => ({
        user: state.user
          ? { ...state.user, uid: firebaseUser.uid, email: firebaseUser.email }
          : { uid: firebaseUser.uid, email: firebaseUser.email },
      }));
    });

    set({ unsubscribe: unsub });
    return unsub;
  },

  stopAuthListener: () => {
    const unsub = get().unsubscribe;
    if (typeof unsub === "function") unsub();
    set({ unsubscribe: null });
  },
}));

export default useAuthStore;
