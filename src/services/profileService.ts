import { isSupabaseDataSource } from '@/src/config/dataSource';
import { getSupabaseClient } from '@/src/lib/supabase';
import type { Profile, ProfileUpdate } from '@/src/types/database';
import { authService } from './authService';
import { normalizeServiceError, type ServiceErrorCode } from './errors';

export interface ProfileResult {
  data: Profile | null;
  error: ServiceErrorCode | null;
}

export interface ProfileMutationResult {
  error: ServiceErrorCode | null;
}

// Only the fields a customer is allowed to self-edit are exposed here.
// `role` has no setter — ProfileUpdate's type doesn't include it — and email
// is intentionally left out: it's owned by Supabase Auth, not this table,
// see docs/SUPABASE_SETUP.md for the email-change flow.
export const profileService = {
  async fetchCurrentProfile(): Promise<ProfileResult> {
    if (!isSupabaseDataSource) return { data: null, error: 'not_configured' };

    try {
      const userId = await authService.getCurrentUserId();
      if (!userId) return { data: null, error: 'not_authenticated' };

      // .maybeSingle(), not .single(): a user whose account predates the
      // handle_new_user trigger (or who signed up before its migration ran)
      // may have zero rows here. That's a legitimate "no profile yet" state
      // that the screen already renders as empty fields — not a query
      // failure that should surface an error banner.
      const { data, error } = await getSupabaseClient()
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (__DEV__) {
        console.log('[WashGo][diag] fetchCurrentProfile:', {
          table: 'profiles',
          userId,
          hasData: Boolean(data),
          error: error ? { code: error.code, message: error.message, details: error.details, hint: error.hint } : null,
        });
      }

      if (error) return { data: null, error: normalizeServiceError(error) };
      return { data, error: null };
    } catch (error) {
      console.error('[WashGo] Unable to load current profile:', error);
      return { data: null, error: normalizeServiceError(error) };
    }
  },

  async updateProfile(update: ProfileUpdate): Promise<ProfileMutationResult> {
    if (!isSupabaseDataSource) return { error: 'not_configured' };

    try {
      const userId = await authService.getCurrentUserId();
      if (!userId) return { error: 'not_authenticated' };

      const { error } = await getSupabaseClient().from('profiles').update(update).eq('id', userId);

      if (error) return { error: normalizeServiceError(error) };
      return { error: null };
    } catch (error) {
      console.error('[WashGo] Unable to update profile:', error);
      return { error: normalizeServiceError(error) };
    }
  },

  updateFullName(fullName: string) {
    return profileService.updateProfile({ full_name: fullName });
  },

  updatePhone(phone: string) {
    return profileService.updateProfile({ phone });
  },

  updatePreferredLanguage(preferredLanguage: Profile['preferred_language']) {
    return profileService.updateProfile({ preferred_language: preferredLanguage });
  },

  updateThemePreference(themePreference: Profile['theme_preference']) {
    return profileService.updateProfile({ theme_preference: themePreference });
  },

  updateAvatarUrl(avatarUrl: string) {
    return profileService.updateProfile({ avatar_url: avatarUrl });
  },
};
