import { create } from 'zustand';

import { isSupabaseDataSource } from '@/src/config/dataSource';
import { notifications as seedNotifications, type WashGoNotification } from '@/src/data/mock/notifications';
import { notificationService } from '@/src/services/notificationService';
import type { ServiceErrorCode } from '@/src/services/errors';
import type { NotificationRow } from '@/src/types/database';
import type { AppNotification } from '@/src/types/notification';

interface NotificationsState {
  /** Mock mode only — raw i18n-key notifications. Resolved to plain text by useNotifications(). */
  mockNotifications: WashGoNotification[];
  /** Supabase mode only — already plain text server-side. */
  notifications: AppNotification[];
  isLoading: boolean;
  error: ServiceErrorCode | null;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  /** Fetches the signed-in user's notifications once per session. No-op in mock mode. */
  load: () => Promise<void>;
  /** Re-fetches regardless of whether load() already ran — pull-to-refresh. No-op in mock mode. */
  refresh: () => Promise<void>;
  /** Clears state on sign-out. No-op in mock mode. */
  reset: () => void;
}

// Same duplicate-call guard pattern as store/favorites.ts.
let hasLoaded = false;

function mapNotificationRow(row: NotificationRow): AppNotification {
  return {
    id: row.id,
    kind: row.type,
    title: row.title,
    message: row.message,
    createdAt: row.created_at,
    isRead: row.is_read,
    orderId: row.related_order_id ?? undefined,
  };
}

// Global (client-only in mock mode) notifications state — shared between the
// notification bell on Home, the Profile menu row, and the Notifications
// screen so marking one (or all) as read updates every badge immediately.
// See src/hooks/useNotifications.ts for the hook that normalizes both
// mockNotifications and notifications into one AppNotification[] shape for
// screens to render.
export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  mockNotifications: seedNotifications,
  notifications: [],
  isLoading: false,
  error: null,

  markAsRead: (id) => {
    if (!isSupabaseDataSource) {
      set((state) => ({
        mockNotifications: state.mockNotifications.map((notification) =>
          notification.id === id && !notification.isRead ? { ...notification, isRead: true } : notification
        ),
      }));
      return;
    }

    const target = get().notifications.find((notification) => notification.id === id);
    if (!target || target.isRead) return;

    set((state) => ({
      notifications: state.notifications.map((notification) =>
        notification.id === id ? { ...notification, isRead: true } : notification
      ),
    }));

    notificationService.markAsRead(id).then(({ error }) => {
      if (!error) return;
      console.error('[WashGo] Unable to mark notification as read, reverting:', error);
      set((state) => ({
        notifications: state.notifications.map((notification) =>
          notification.id === id ? { ...notification, isRead: false } : notification
        ),
      }));
    });
  },

  markAllAsRead: () => {
    if (!isSupabaseDataSource) {
      set((state) => ({
        mockNotifications: state.mockNotifications.map((notification) =>
          notification.isRead ? notification : { ...notification, isRead: true }
        ),
      }));
      return;
    }

    const previouslyUnreadIds = get()
      .notifications.filter((notification) => !notification.isRead)
      .map((notification) => notification.id);
    if (previouslyUnreadIds.length === 0) return;

    set((state) => ({
      notifications: state.notifications.map((notification) =>
        notification.isRead ? notification : { ...notification, isRead: true }
      ),
    }));

    notificationService.markAllAsRead().then(({ error }) => {
      if (!error) return;
      console.error('[WashGo] Unable to mark all notifications as read, reverting:', error);
      set((state) => ({
        notifications: state.notifications.map((notification) =>
          previouslyUnreadIds.includes(notification.id) ? { ...notification, isRead: false } : notification
        ),
      }));
    });
  },

  load: async () => {
    if (!isSupabaseDataSource || hasLoaded) return;
    await get().refresh();
  },

  refresh: async () => {
    if (!isSupabaseDataSource) return;
    hasLoaded = true;

    set({ isLoading: true, error: null });
    const { data, error } = await notificationService.list();
    set({ notifications: data.map(mapNotificationRow), isLoading: false, error });
  },

  reset: () => {
    if (!isSupabaseDataSource) return;
    hasLoaded = false;
    set({ notifications: [], isLoading: false, error: null });
  },
}));
