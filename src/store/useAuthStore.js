
// src/store/useAuthStore.js
import { create } from "zustand";

export const useAuthStore = create((set) => ({
  user: null,
  profile: null,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  clearAuth: () => set({ user: null, profile: null }),
}));