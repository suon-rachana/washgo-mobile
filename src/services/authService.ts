import type { Session, User } from "@supabase/supabase-js";

import { isSupabaseDataSource } from "@/src/config/dataSource";
import { getSupabaseClient, supabase } from "@/src/lib/supabase";

// Normalized error codes. Screens translate these codes into localized text.
export type AuthErrorCode =
  | "not_configured"
  | "invalid_credentials"
  | "account_exists"
  | "email_verification_required"
  | "network_error"
  | "unknown";

export interface AuthResult {
  error: AuthErrorCode | null;
}

export interface SignUpInput {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

export interface SignInInput {
  email: string;
  password: string;
}

function normalizeAuthError(error: unknown): AuthErrorCode {
  if (!error) {
    return "unknown";
  }

  const authError = error as {
    code?: string;
    message?: string;
  };

  const code = authError.code?.toLowerCase() ?? "";
  const message = authError.message?.toLowerCase() ?? "";

  if (
    code === "invalid_credentials" ||
    message.includes("invalid login credentials")
  ) {
    return "invalid_credentials";
  }

  if (
    code === "user_already_exists" ||
    code === "email_exists" ||
    message.includes("already registered")
  ) {
    return "account_exists";
  }

  if (
    code === "email_not_confirmed" ||
    message.includes("email not confirmed")
  ) {
    return "email_verification_required";
  }

  if (
    message.includes("network") ||
    message.includes("fetch failed") ||
    message.includes("failed to fetch")
  ) {
    return "network_error";
  }

  return "unknown";
}

export const authService = {
  async signUp({
    fullName,
    email,
    phone,
    password,
  }: SignUpInput): Promise<AuthResult> {
    if (!isSupabaseDataSource) {
      return { error: "not_configured" };
    }

    try {
      const client = getSupabaseClient();

      const { error } = await client.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            phone: phone.trim(),
            preferred_language: "en",
          },
        },
      });

      return {
        error: error ? normalizeAuthError(error) : null,
      };
    } catch (error) {
      return {
        error: normalizeAuthError(error),
      };
    }
  },

  async signIn({ email, password }: SignInInput): Promise<AuthResult> {
    if (!isSupabaseDataSource) {
      return { error: "not_configured" };
    }

    try {
      const client = getSupabaseClient();

      const { error } = await client.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      return {
        error: error ? normalizeAuthError(error) : null,
      };
    } catch (error) {
      return {
        error: normalizeAuthError(error),
      };
    }
  },

  async signOut(): Promise<AuthResult> {
    if (!isSupabaseDataSource) {
      return { error: "not_configured" };
    }

    try {
      const client = getSupabaseClient();
      const { error } = await client.auth.signOut();

      return {
        error: error ? normalizeAuthError(error) : null,
      };
    } catch (error) {
      return {
        error: normalizeAuthError(error),
      };
    }
  },

  async requestPasswordReset(email: string): Promise<AuthResult> {
    if (!isSupabaseDataSource) {
      return { error: "not_configured" };
    }

    try {
      const client = getSupabaseClient();

      const { error } = await client.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
      );

      return {
        error: error ? normalizeAuthError(error) : null,
      };
    } catch (error) {
      return {
        error: normalizeAuthError(error),
      };
    }
  },

  async getSession(): Promise<Session | null> {
    if (!isSupabaseDataSource || !supabase) {
      return null;
    }

    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error("[WashGo] Unable to get auth session:", error);
        return null;
      }

      return session;
    } catch (error) {
      console.error("[WashGo] Unable to get auth session:", error);
      return null;
    }
  },

  async getUser(): Promise<User | null> {
    if (!isSupabaseDataSource || !supabase) {
      return null;
    }

    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        console.error("[WashGo] Unable to get authenticated user:", error);
        return null;
      }

      return user;
    } catch (error) {
      console.error("[WashGo] Unable to get authenticated user:", error);
      return null;
    }
  },

  // Single source of truth for "which user id should this database read/write
  // be scoped to" — profileService and addressService both call this instead
  // of each keeping their own copy.
  //
  // Deliberately reads getSession() rather than getUser(). getSession() is a
  // local lookup that proactively refreshes an expired access token before
  // returning; getUser() sends the current token to the Auth server as-is.
  // On React Native, the app can resume from the background with a token
  // that expired while backgrounded (see the AppState wiring in
  // src/lib/supabase.ts) — at that moment getUser() can fail with an
  // "expired JWT" error even though the session is perfectly recoverable,
  // which was surfacing as "not authenticated" in profile/address reads.
  async getCurrentUserId(): Promise<string | null> {
    if (!isSupabaseDataSource || !supabase) {
      return null;
    }

    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error("[WashGo] Unable to resolve current session:", error);
        return null;
      }

      const userId = session?.user?.id ?? null;

      if (__DEV__) {
        console.log("[WashGo][diag] getCurrentUserId:", {
          hasSession: Boolean(session),
          sessionUserId: userId,
          sessionError: null,
        });
      }

      return userId;
    } catch (error) {
      console.error("[WashGo] Unable to resolve current user id:", error);
      return null;
    }
  },

  onAuthStateChange(callback: (session: Session | null) => void): () => void {
    if (!isSupabaseDataSource || !supabase) {
      return () => {};
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  },
};
