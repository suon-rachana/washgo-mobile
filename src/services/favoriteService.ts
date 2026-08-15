import { isSupabaseDataSource } from '@/src/config/dataSource';
import { getSupabaseClient } from '@/src/lib/supabase';
import { normalizeServiceError, type ServiceErrorCode } from './errors';
import { authService } from './authService';

export interface FavoriteListResult {
  data: string[];
  error: ServiceErrorCode | null;
}

export interface FavoriteVoidResult {
  error: ServiceErrorCode | null;
}

// Postgres unique_violation — favorites has a unique(user_id, laundry_id)
// constraint. A duplicate add() (e.g. a double-tap racing itself) is treated
// as success rather than an error, since the end state the caller wanted
// ("this laundry is favorited") is already true.
const UNIQUE_VIOLATION = '23505';

export const favoriteService = {
  // Returns bare laundry ids — the favorites screen cross-references these
  // against useLaundries() rather than this service duplicating laundry data.
  async list(): Promise<FavoriteListResult> {
    if (!isSupabaseDataSource) return { data: [], error: 'not_configured' };

    try {
      const userId = await authService.getCurrentUserId();
      if (!userId) return { data: [], error: 'not_authenticated' };

      const { data, error } = await getSupabaseClient()
        .from('favorites')
        .select('laundry_id')
        .eq('user_id', userId);

      if (error) return { data: [], error: normalizeServiceError(error) };
      return { data: (data ?? []).map((row) => row.laundry_id), error: null };
    } catch (error) {
      console.error('[WashGo] Unable to load favorites:', error);
      return { data: [], error: normalizeServiceError(error) };
    }
  },

  async add(laundryId: string): Promise<FavoriteVoidResult> {
    if (!isSupabaseDataSource) return { error: 'not_configured' };

    try {
      const userId = await authService.getCurrentUserId();
      if (!userId) return { error: 'not_authenticated' };

      const { error } = await getSupabaseClient()
        .from('favorites')
        .insert({ user_id: userId, laundry_id: laundryId });

      if (error && error.code !== UNIQUE_VIOLATION) return { error: normalizeServiceError(error) };
      return { error: null };
    } catch (error) {
      console.error('[WashGo] Unable to add favorite:', error);
      return { error: normalizeServiceError(error) };
    }
  },

  async remove(laundryId: string): Promise<FavoriteVoidResult> {
    if (!isSupabaseDataSource) return { error: 'not_configured' };

    try {
      const userId = await authService.getCurrentUserId();
      if (!userId) return { error: 'not_authenticated' };

      const { error } = await getSupabaseClient()
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('laundry_id', laundryId);

      if (error) return { error: normalizeServiceError(error) };
      return { error: null };
    } catch (error) {
      console.error('[WashGo] Unable to remove favorite:', error);
      return { error: normalizeServiceError(error) };
    }
  },
};
