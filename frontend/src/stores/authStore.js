import { create } from "zustand";
import { persist } from "zustand/middleware";

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token) => {
        set({
          user,
          token,
          isAuthenticated: !!token,
        });
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("auth-storage");
      },

      initialize: () => {
        if (localStorage.getItem("token") || localStorage.getItem("user")) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }

        const state = useAuthStore.getState();
        if (state.token && state.user && !state.isAuthenticated) {
          set({ isAuthenticated: true });
        } else if ((!state.token || !state.user) && state.isAuthenticated) {
          set({ isAuthenticated: false });
        }
      },

      updateUser: (updatedUser) => {
        set((state) => ({
          user: { ...state.user, ...updatedUser },
        }));
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
