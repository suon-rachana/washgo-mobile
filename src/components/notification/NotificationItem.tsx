import { Ionicons } from '@expo/vector-icons';
import { ComponentProps, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/src/components/ui';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useTypography } from '@/src/hooks/useTypography';
import { useTranslation } from '@/src/i18n';
import { ColorScheme, Radius, Spacing } from '@/src/theme';
import type { AppNotification, NotificationKind } from '@/src/types/notification';
import { formatNotificationTime } from '@/src/utils/formatNotificationTime';

export interface NotificationItemProps {
  notification: AppNotification;
  onPress: () => void;
}

const TYPE_ICON: Record<NotificationKind, ComponentProps<typeof Ionicons>['name']> = {
  order_created: 'receipt-outline',
  rider_assigned: 'person-add-outline',
  pickup_started: 'navigate-outline',
  picked_up: 'cube-outline',
  washing: 'sparkles-outline',
  ready: 'checkmark-done-outline',
  out_for_delivery: 'bicycle-outline',
  delivered: 'home-outline',
  // Supabase notifications collapse every order lifecycle step into one
  // generic kind — see src/types/notification.ts.
  order_update: 'receipt-outline',
  promotion: 'pricetag-outline',
  system: 'information-circle-outline',
};

// Purely presentational — title/message already resolved to plain text by
// useNotifications(); this only handles icon/relative-time display. Which
// screen to open and how to validate the order lives in the Notifications
// screen, not here.
export function NotificationItem({ notification, onPress }: NotificationItemProps) {
  const colors = useThemeColors();
  const typography = useTypography();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);

  const { isRead, title, message } = notification;
  const time = formatNotificationTime(notification.createdAt, t);
  const icon = TYPE_ICON[notification.kind];

  return (
    <Card
      variant={isRead ? 'outlined' : 'elevated'}
      onPress={onPress}
      accessibilityLabel={`${isRead ? t('readNotification') : t('newNotification')}. ${title}. ${message}. ${time}`}
      accessibilityState={{ selected: !isRead }}
    >
      <View style={styles.row}>
        <View style={[styles.iconCircle, !isRead && styles.iconCircleUnread]}>
          <Ionicons name={icon} size={20} color={isRead ? colors.textMuted : colors.primary} />
        </View>

        <View style={styles.textWrap}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, !isRead && styles.titleUnread]} numberOfLines={1}>
              {title}
            </Text>
            {!isRead ? <View style={styles.unreadDot} /> : null}
          </View>
          <Text style={styles.message} numberOfLines={2}>
            {message}
          </Text>
          <Text style={styles.time} numberOfLines={1}>
            {notification.orderId ? `${time} · ${notification.orderId}` : time}
          </Text>
        </View>
      </View>
    </Card>
  );
}

const createStyles = (colors: ColorScheme, typography: ReturnType<typeof useTypography>) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      minHeight: 44,
    },
    iconCircle: {
      width: 40,
      height: 40,
      borderRadius: Radius.circle,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: Spacing.md,
    },
    iconCircleUnread: {
      backgroundColor: `${colors.primary}1A`,
      borderColor: 'transparent',
    },
    textWrap: {
      flex: 1,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xs,
      marginBottom: Spacing.xxs,
    },
    title: {
      flex: 1,
      fontSize: typography.bodyMedium.fontSize,
      fontWeight: typography.body.fontWeight,
      fontFamily: typography.body.fontFamily,
      color: colors.text,
    },
    titleUnread: {
      fontWeight: typography.bodyMedium.fontWeight,
      fontFamily: typography.bodyMedium.fontFamily,
    },
    unreadDot: {
      width: 8,
      height: 8,
      borderRadius: Radius.circle,
      backgroundColor: colors.primary,
    },
    message: {
      fontSize: typography.body.fontSize,
      lineHeight: typography.body.lineHeight,
      fontFamily: typography.body.fontFamily,
      color: colors.textMuted,
      marginBottom: Spacing.xxs,
    },
    time: {
      fontSize: typography.caption.fontSize,
      fontFamily: typography.caption.fontFamily,
      color: colors.textMuted,
    },
  });
