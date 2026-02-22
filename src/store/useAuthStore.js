import { create } from "zustand";

// This store keeps login state in one place
// Pages can read user info and check if the user is logged in

const useAuthStore = create((set, get) => {
  return {
    // user is the logged in account data
    // uid and email are enough for most screens
    user: null,

    // isLoading is used when an auth check is running
    isLoading: false,

    // error is a simple string for UI messages
    error: "",

    // setUser saves user data into the store
    // Use this after login or after reading the current session
    setUser: (user) => {
      set({ user: user || null, error: "" });
    },

    // clearUser removes user data
    // Use this after logout
    clearUser: () => {
      set({ user: null });
    },

    // setLoading controls the loading state
    // Use true when starting auth work, and false when finished
    setLoading: (isLoading) => {
      set({ isLoading: Boolean(isLoading) });
    },

    // setError saves an error message for UI
    // Use empty string to clear the error
    setError: (message) => {
      set({ error: message || "" });
    },

    // isLoggedIn returns true when user exists to keep UI checks simple
    isLoggedIn: () => {
      return Boolean(get().user);
    },
  };
});

export default useAuthStore;