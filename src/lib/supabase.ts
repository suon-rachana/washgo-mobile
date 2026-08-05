import "react-native-url-polyfill/auto";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { AppState, Platform } from "react-native";

import { env } from "@/src/config/env";
import type { Database } from "@/src/types/database";

export const supabase: SupabaseClient<Database> | null =
  env.supabaseUrl && env.supabaseAnonKey
    ? createClient<Database>(env.supabaseUrl, env.supabaseAnonKey, {
        auth: {
          // AsyncStorage must only be used on native platforms.
          ...(Platform.OS !== "web"
            ? {
                storage: AsyncStorage,
              }
            : {}),

          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
        },
      })
    : null;

// React Native suspends JS timers while the app is backgrounded, so the
// client's internal auto-refresh ticker stalls with it. Without this, an
// access token that expires while backgrounded stays unrefreshed until
// something happens to trigger a refresh — and auth.getUser() (which sends
// the current token to the Auth server as-is, unlike auth.getSession(),
// which proactively refreshes an expired token first) can then fail right
// after the app resumes. This is Supabase's documented React Native setup:
// https://supabase.com/docs/reference/javascript/initializing?example=react-native-options
if (supabase) {
  AppState.addEventListener("change", (state) => {
    if (state === "active") {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
}

export function getSupabaseClient(): SupabaseClient<Database> {
  if (!supabase) {
    throw new Error(
      "Supabase is not configured. Check EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  return supabase;
}
