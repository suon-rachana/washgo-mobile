import { isSupabaseDataSource } from '@/src/config/dataSource';
import { getSupabaseClient } from '@/src/lib/supabase';
import type { NotificationRow } from '@/src/types/database';
import { authService } from './authService';
import { normalizeServiceError, type ServiceErrorCode } from './errors';

export interface NotificationListResult {
  data: NotificationRow[];
  error: ServiceErrorCode | null;
}

export interface NotificationVoidResult {
  error: ServiceErrorCode | null;
}

// No client INSERT policy exists for notifications (see
// supabase/migrations/001_initial_schema.sql) — they're only ever written by
// a trusted server-side flow (a future order-status function, Phase 4).
// This service only ever reads and marks-read.
export const notificationService = {
  async list(): Promise<NotificationListResult> {
    if (!isSupabaseDataSource) return { data: [], error: 'not_configured' };

    try {
      const userId = await authService.getCurrentUserId();
      if (!userId) return { data: [], error: 'not_authenticated' };

      const { data, error } = await getSupabaseClient()
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) return { data: [], error: normalizeServiceError(error) };
      return { data: data ?? [], error: null };
    } catch (error) {
      console.error('[WashGo] Unable to load notifications:', error);
      return { data: [], error: normalizeServiceError(error) };
    }
  },

  async markAsRead(id: string): Promise<NotificationVoidResult> {
    if (!isSupabaseDataSource) return { error: 'not_configured' };

    try {
      const { error } = await getSupabaseClient().from('notifications').update({ is_read: true }).eq('id', id);

      if (error) return { error: normalizeServiceError(error) };
      return { error: null };
    } catch (error) {
      console.error('[WashGo] Unable to mark notification as read:', error);
      return { error: normalizeServiceError(error) };
    }
  },

  async markAllAsRead(): Promise<NotificationVoidResult> {
    if (!isSupabaseDataSource) return { error: 'not_configured' };

    try {
      const userId = await authService.getCurrentUserId();
      if (!userId) return { error: 'not_authenticated' };

      const { error } = await getSupabaseClient()
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      if (error) return { error: normalizeServiceError(error) };
      return { error: null };
    } catch (error) {
      console.error('[WashGo] Unable to mark all notifications as read:', error);
      return { error: normalizeServiceError(error) };
    }
  },
};
