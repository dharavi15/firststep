import { create } from "zustand";

const useAuthStore = create((set) => ({
  user: null, // { uid, email, role, fullName, schoolId }
  isLoading: false,
  error: "",

  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error: error || "" }),

  clearAuth: () => set({ user: null, isLoading: false, error: "" }),
}));

export default useAuthStore;