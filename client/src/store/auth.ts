import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types/authType";

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

function deepMerge<T>(target: T, source: DeepPartial<T>): T {
  if (!source) return target;

  const output: T = { ...target };

  (Object.keys(source) as (keyof T)[]).forEach((key) => {
    const srcVal = source[key];
    const tgtVal = target[key];

    if (
      srcVal &&
      typeof srcVal === "object" &&
      !Array.isArray(srcVal) &&
      tgtVal &&
      typeof tgtVal === "object" &&
      !Array.isArray(tgtVal)
    ) {
      // merge sâu
      output[key] = deepMerge(tgtVal, srcVal) as T[typeof key];
    } else if (srcVal !== undefined) {
      output[key] = srcVal as T[typeof key];
    }
  });

  return output;
}

type AuthState = {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
};
type AuthActions = {
  setAuth: (data: { user: User | null; accessToken: string | null }) => void;
  clearAuth: () => void;
  updateUser: (partialUser: DeepPartial<User>) => void;
};

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,

      setAuth: (data) =>
        set({
          user: data.user,
          accessToken: data.accessToken,
          isAuthenticated: Boolean(data.user && data.accessToken),
        }),

      clearAuth: () =>
        set({ user: null, accessToken: null, isAuthenticated: false }),

      updateUser: (partialUser) =>
        set((state) => ({
          user: state.user ? deepMerge(state.user, partialUser) : null,
        })),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
