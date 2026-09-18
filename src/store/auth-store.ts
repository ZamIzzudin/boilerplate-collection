import { create } from "zustand";
import type { AuthUser, Permissions } from "@/types";

type AuthState = {
  user: AuthUser | null;
  permissions: Permissions;
  permissionVersion: string | null;
  isAuthenticated: boolean;
  userTypeId: number | null;

  setUser: (user: AuthUser) => void;
  clearAuth: () => void;
  setAuthenticated: () => void;
  setPermissionVersion: (version: string) => void;
  setUserTypeId: (id: number) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  permissions: {},
  permissionVersion: null,
  isAuthenticated: false,
  userTypeId: null,

  setUser: (user) => set({ user }),

  clearAuth: () =>
    set({
      user: null,
      permissions: {},
      permissionVersion: null,
      isAuthenticated: false,
      userTypeId: null,
    }),

  setAuthenticated: () => set({ isAuthenticated: true }),

  setPermissionVersion: (version) =>
    set((state) =>
      state.permissionVersion === version
        ? state
        : { permissionVersion: version },
    ),

  setUserTypeId: (id) => set({ userTypeId: id }),
}));
