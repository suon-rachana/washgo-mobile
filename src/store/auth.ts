import type { Session, User } from "@supabase/supabase-js";
import { create } from "zustand";

import { isSupabaseDataSource } from "@/src/config/dataSource";
import {
  authService,
  type AuthErrorCode,
  type SignInInput,
  type SignUpInput,
} from "@/src/services/authService";
import { profileService } from "@/src/services/profileService";
import type { Profile } from "@/src/types/database";

interface AuthState {
  session: Session | null;
  user: User | null;
  profile: Profile | null;

  isInitializing: boolean;
  isAuthenticated: boolean;

  error: AuthErrorCode | null;

  initialize: () => Promise<void>;
  signIn: (input: SignInInput) => Promise<boolean>;
  signUp: (input: SignUpInput) => Promise<boolean>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  clearError: () => void;
}

let unsubscribeAuthListener: (() => void) | null = null;
let hasInitialized = false;

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  user: null,
  profile: null,

  isInitializing: true,
  isAuthenticated: false,

  error: null,

  initialize: async () => {
    if (hasInitialized) {
      return;
    }

    hasInitialized = true;

    if (!isSupabaseDataSource) {
      set({
        isInitializing: false,
        isAuthenticated: false,
        session: null,
        user: null,
        profile: null,
      });

      return;
    }

    try {
      const session = await authService.getSession();

      set({
        session,
        user: session?.user ?? null,
        isAuthenticated: Boolean(session),
        error: null,
      });

      if (session) {
        await get().refreshProfile();
      } else {
        set({ profile: null });
      }

      unsubscribeAuthListener?.();

      unsubscribeAuthListener = authService.onAuthStateChange((nextSession) => {
        set({
          session: nextSession,
          user: nextSession?.user ?? null,
          isAuthenticated: Boolean(nextSession),
          error: null,
        });

        if (nextSession) {
          void get().refreshProfile();
        } else {
          set({ profile: null });
        }
      });
    } catch (error) {
      console.error("[WashGo] Auth initialization failed:", error);

      set({
        session: null,
        user: null,
        profile: null,
        isAuthenticated: false,
        error: "unknown",
      });
    } finally {
      set({ isInitializing: false });
    }
  },

  signIn: async (input) => {
    set({
      error: null,
      session: null,
      user: null,
      profile: null,
      isAuthenticated: false,
    });

    const result = await authService.signIn(input);

    if (result.error) {
      set({
        error: result.error,
        session: null,
        user: null,
        profile: null,
        isAuthenticated: false,
      });

      return false;
    }

    const session = await authService.getSession();

    if (!session) {
      set({
        error: "unknown",
        session: null,
        user: null,
        profile: null,
        isAuthenticated: false,
      });

      return false;
    }

    set({
      session,
      user: session.user,
      isAuthenticated: true,
      error: null,
    });

    await get().refreshProfile();

    return true;
  },

  signUp: async (input) => {
    set({ error: null });

    const result = await authService.signUp(input);

    if (result.error) {
      set({ error: result.error });
      return false;
    }

    // Supabase may return no active session when email confirmation is enabled.
    const session = await authService.getSession();

    if (session) {
      set({
        session,
        user: session.user,
        isAuthenticated: true,
        error: null,
      });

      await get().refreshProfile();
    }

    return true;
  },

  signOut: async () => {
    const result = await authService.signOut();

    if (result.error && result.error !== "not_configured") {
      set({ error: result.error });
      return;
    }

    set({
      session: null,
      user: null,
      profile: null,
      isAuthenticated: false,
      error: null,
    });
  },

  refreshProfile: async () => {
    try {
      const { data } = await profileService.fetchCurrentProfile();

      set({ profile: data });
    } catch (error) {
      console.error("[WashGo] Unable to load current profile:", error);

      set({ profile: null });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
