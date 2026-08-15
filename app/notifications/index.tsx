import { useRouter, type Href } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { NotificationItem } from '@/src/components/notification';
import { AppScreen } from '@/src/components/layout';
import { Chip, EmptyState, ErrorState, LoadingState } from '@/src/components/ui';
import { isSupabaseDataSource } from '@/src/config/dataSource';
import { getOrderById } from '@/src/data/mock';
import { useNotifications } from '@/src/hooks/useNotifications';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useTypography } from '@/src/hooks/useTypography';
import { useTranslation } from '@/src/i18n';
import { useNotificationsStore } from '@/src/store/notifications';
import { ColorScheme, Spacing } from '@/src/theme';
import type { AppNotification } from '@/src/types/notification';

type NotificationFilter = 'all' | 'unread';

// `/shops` and `/settings` are index routes; the local typed-routes generator
// doesn't collapse index files to their parent path, so the literal string
// fails the type check even though it's the correct runtime href. Cast once here.
const SHOPS_HREF = '/shops' as Href;
const SETTINGS_HREF = '/settings' as Href;

export default function NotificationsScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const typography = useTypography();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);
  const [filter, setFilter] = useState<NotificationFilter>('all');
  const [refreshing, setRefreshing] = useState(false);

  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead, refresh } = useNotifications();
  const loadError = useNotificationsStore((state) => state.error);

  const visibleNotifications = filter === 'unread' ? notifications.filter((item) => !item.isRead) : notifications;

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    if (isSupabaseDataSource) {
      refresh().finally(() => setRefreshing(false));
      return;
    }
    // Mock mode has nothing to re-fetch — mock the gesture so it still feels live.
    setTimeout(() => setRefreshing(false), 800);
  }, [refresh]);

  const handleNotificationPress = useCallback(
    (notification: AppNotification) => {
      markAsRead(notification.id);

      if (notification.kind === 'promotion') {
        router.push(SHOPS_HREF);
        return;
      }

      if (notification.kind === 'system') {
        router.push(SETTINGS_HREF);
        return;
      }

      // Every other type is tied to an order — validate it still exists
      // before navigating so malformed/missing notification data can't crash
      // the screen.
      const order = getOrderById(notification.orderId);
      if (!order) {
        Alert.alert(t('orderDetails'), t('orderNotFound'));
        return;
      }

      if (order.status === 'active') {
        router.push({ pathname: '/tracking', params: { orderId: order.id } } as unknown as Href);
      } else {
        router.push({ pathname: '/order-details', params: { orderId: order.id } } as unknown as Href);
      }
    },
    [markAsRead, router, t]
  );

  return (
    <AppScreen
      title={t('notifications')}
      headerRight={
        unreadCount > 0
          ? () => (
              <Pressable
                onPress={markAllAsRead}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={t('markAllAsRead')}
              >
                <Text style={styles.markAllText}>{t('markAllAsRead')}</Text>
              </Pressable>
            )
          : undefined
      }
      scroll={false}
      contentContainerStyle={styles.content}
    >
      <View style={styles.filterRow}>
        <Chip
          label={t('all')}
          selected={filter === 'all'}
          onPress={() => setFilter('all')}
          accessibilityHint="Shows all notifications"
        />
        <Chip
          label={t('unread')}
          selected={filter === 'unread'}
          onPress={() => setFilter('unread')}
          accessibilityHint="Shows only unread notifications"
        />
      </View>

      {isLoading && notifications.length === 0 ? (
        <LoadingState message={t('loadingNotifications')} />
      ) : loadError && notifications.length === 0 ? (
        <ErrorState message={t('unableToLoadNotifications')} retryLabel={t('retry')} onRetry={refresh} />
      ) : (
      <FlatList
        data={visibleNotifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => (
          <NotificationItem notification={item} onPress={() => handleNotificationPress(item)} />
        )}
        ListEmptyComponent={
          filter === 'unread' ? (
            <EmptyState
              icon="checkmark-done-outline"
              title={t('youAreAllCaughtUp')}
              description={t('noUnreadNotificationsDescription')}
            />
          ) : (
            <EmptyState
              icon="notifications-outline"
              title={t('noNotifications')}
              description={t('notificationsEmptyDescription')}
            />
          )
        }
      />
      )}
    </AppScreen>
  );
}

const createStyles = (colors: ColorScheme, typography: ReturnType<typeof useTypography>) =>
  StyleSheet.create({
    content: {
      paddingHorizontal: Spacing.xl,
      paddingTop: Spacing.md,
      paddingBottom: 0,
    },
    markAllText: {
      fontSize: typography.bodyMedium.fontSize,
      fontWeight: typography.bodyMedium.fontWeight,
      fontFamily: typography.bodyMedium.fontFamily,
      color: colors.primary,
    },
    filterRow: {
      flexDirection: 'row',
      gap: Spacing.sm,
      marginBottom: Spacing.lg,
    },
    listContent: {
      flexGrow: 1,
      paddingBottom: Spacing.xl,
    },
    separator: {
      height: Spacing.md,
    },
  });
