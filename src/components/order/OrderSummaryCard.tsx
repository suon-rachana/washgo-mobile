import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Badge, Button, Card, type BadgeVariant } from '@/src/components/ui';
import { laundries } from '@/src/data/mock/laundries';
import { getOrderStatusLabelKey } from '@/src/data/mock/order';
import type { OrderSummary } from '@/src/data/mock/orders';
import { dateOptions, timeOptions } from '@/src/data/mock/pickupOptions';
import { services } from '@/src/data/mock/services';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useTypography } from '@/src/hooks/useTypography';
import { useTranslation } from '@/src/i18n';
import { ColorScheme, Spacing } from '@/src/theme';

export interface OrderSummaryCardProps {
  order: OrderSummary;
  onTrackPress?: () => void;
  onViewDetails?: () => void;
}

const STATUS_BADGE_VARIANT: Record<OrderSummary['status'], BadgeVariant> = {
  active: 'primary',
  completed: 'success',
  cancelled: 'danger',
};

function formatOrderDate(createdAt: string): string {
  return new Date(createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function OrderSummaryCard({ order, onTrackPress, onViewDetails }: OrderSummaryCardProps) {
  const colors = useThemeColors();
  const typography = useTypography();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);

  const laundry = laundries.find((item) => item.id === order.laundryId);
  const statusLabel = t(getOrderStatusLabelKey(order.status, order.currentStepId));
  const isActive = order.status === 'active';

  const serviceNames = order.serviceIds
    .split(',')
    .filter(Boolean)
    .map((id) => services.find((service) => service.id === id)?.title)
    .filter((title): title is string => Boolean(title))
    .slice(0, 2);

  const date = dateOptions.find((item) => item.id === order.dateId);
  const time = timeOptions.find((item) => item.id === order.timeId);

  return (
    <Card variant="elevated">
      <View style={styles.header}>
        <Text style={styles.laundryName} numberOfLines={1}>
          {laundry?.name ?? 'Unknown laundry'}
        </Text>
        <Badge label={statusLabel} variant={STATUS_BADGE_VARIANT[order.status]} />
      </View>

      <Text style={styles.orderId}>{order.id}</Text>

      {serviceNames.length > 0 ? (
        <Text style={styles.services} numberOfLines={1}>
          {serviceNames.join(' · ')}
        </Text>
      ) : null}

      {isActive ? (
        <View style={styles.metaBlock}>
          {date && time ? (
            <Text style={styles.metaText} numberOfLines={1}>
              {t('scheduledPickup')}: {date.label}, {time.label}
            </Text>
          ) : null}
          {order.estimatedArrival ? (
            <Text style={styles.metaText} numberOfLines={1}>
              {t('estimatedArrival')}: {order.estimatedArrival}
            </Text>
          ) : null}
        </View>
      ) : (
        <Text style={styles.metaText} numberOfLines={1}>
          {formatOrderDate(order.createdAt)}
        </Text>
      )}

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>{t('total')}</Text>
        <Text style={styles.total}>${order.total.toFixed(2)}</Text>
      </View>

      <View style={styles.actions}>
        {isActive && onTrackPress ? (
          <Button
            title={t('trackOrder')}
            onPress={onTrackPress}
            accessibilityLabel={`${t('trackOrder')} ${order.id}`}
            accessibilityHint="Navigates to order tracking"
            style={styles.actionButton}
          />
        ) : null}
        {onViewDetails ? (
          <Button
            title={t('viewDetails')}
            variant="outline"
            onPress={onViewDetails}
            accessibilityLabel={`${t('viewDetails')} ${order.id}`}
            accessibilityHint="Opens the full order details"
            style={styles.actionButton}
          />
        ) : null}
      </View>
    </Card>
  );
}

const createStyles = (colors: ColorScheme, typography: ReturnType<typeof useTypography>) =>
  StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: Spacing.sm,
      marginBottom: Spacing.xxs,
    },
    laundryName: {
      flex: 1,
      fontSize: typography.subtitle.fontSize,
      lineHeight: typography.subtitle.lineHeight,
      fontWeight: typography.subtitle.fontWeight,
      fontFamily: typography.subtitle.fontFamily,
      color: colors.text,
    },
    orderId: {
      fontSize: typography.caption.fontSize,
      fontFamily: typography.caption.fontFamily,
      color: colors.textMuted,
      marginBottom: Spacing.sm,
    },
    services: {
      fontSize: typography.body.fontSize,
      fontFamily: typography.body.fontFamily,
      color: colors.text,
      marginBottom: Spacing.sm,
    },
    metaBlock: {
      marginBottom: Spacing.sm,
      gap: Spacing.xxs,
    },
    metaText: {
      fontSize: typography.caption.fontSize,
      fontFamily: typography.caption.fontFamily,
      color: colors.textMuted,
    },
    totalRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: Spacing.md,
    },
    totalLabel: {
      fontSize: typography.body.fontSize,
      fontFamily: typography.body.fontFamily,
      color: colors.textMuted,
    },
    total: {
      fontSize: typography.bodyMedium.fontSize,
      fontWeight: typography.bodyMedium.fontWeight,
      fontFamily: typography.bodyMedium.fontFamily,
      color: colors.primary,
    },
    actions: {
      flexDirection: 'row',
      gap: Spacing.sm,
    },
    actionButton: {
      flex: 1,
    },
  });
