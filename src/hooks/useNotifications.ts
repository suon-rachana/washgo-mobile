import { useMemo } from 'react';

import { isSupabaseDataSource } from '@/src/config/dataSource';
import { useTranslation } from '@/src/i18n';
import { useNotificationsStore } from '@/src/store/notifications';
import type { AppNotification } from '@/src/types/notification';

export interface UseNotificationsResult {
  notifications: AppNotification[];
  unreadCount: number;
  isLoading: boolean;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  /** Re-fetches from Supabase regardless of prior load state — pull-to-refresh / retry. No-op in mock mode. */
  refresh: () => Promise<void>;
}

// Normalizes the notifications store's two shapes (mock's raw i18n-key
// records vs Supabase's already-plain-text rows) into one AppNotification[]
// for screens to render, resolving mock copy through t() here so language
// switches still update live — the store itself can't call hooks.
export function useNotifications(): UseNotificationsResult {
  const { t } = useTranslation();
  const mockNotifications = useNotificationsStore((state) => state.mockNotifications);
  const supabaseNotifications = useNotificationsStore((state) => state.notifications);
  const isLoading = useNotificationsStore((state) => state.isLoading);
  const markAsRead = useNotificationsStore((state) => state.markAsRead);
  const markAllAsRead = useNotificationsStore((state) => state.markAllAsRead);
  const refresh = useNotificationsStore((state) => state.refresh);

  const notifications = useMemo<AppNotification[]>(() => {
    if (isSupabaseDataSource) return supabaseNotifications;

    return mockNotifications.map((notification) => ({
      id: notification.id,
      kind: notification.type,
      title: t(notification.titleKey),
      message: t(notification.messageKey, notification.messageParams),
      createdAt: notification.createdAt,
      isRead: notification.isRead,
      orderId: notification.orderId,
    }));
  }, [mockNotifications, supabaseNotifications, t]);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.isRead).length,
    [notifications]
  );

  return { notifications, unreadCount, isLoading, markAsRead, markAllAsRead, refresh };
}
