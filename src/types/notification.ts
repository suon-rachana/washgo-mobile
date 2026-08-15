import type { NotificationType as MockNotificationType } from '@/src/data/mock/notifications';
import type { NotificationType as DbNotificationType } from '@/src/types/database';

// Mock notifications use a granular per-lifecycle-step kind (for icon
// variety); Supabase notifications collapse every order update into one
// 'order_update' kind (see supabase/migrations/001_initial_schema.sql — the
// notification_type enum only has order_update/promotion/system). Both are
// valid values of the same rendered shape below.
export type NotificationKind = MockNotificationType | DbNotificationType;

// Shared shape NotificationItem renders, regardless of source. Mock
// notifications resolve their i18n title/message keys into these plain
// strings in useNotifications() (see src/hooks/useNotifications.ts);
// Supabase notifications already store plain text server-side.
export interface AppNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  orderId?: string;
}
