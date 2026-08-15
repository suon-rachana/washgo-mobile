import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { SectionHeader } from '@/src/components/common';
import { AppScreen } from '@/src/components/layout';
import { OrderTimeline, RiderCard } from '@/src/components/order';
import { Badge, Button, Card, Chip, ErrorState, LoadingState } from '@/src/components/ui';
import { isSupabaseDataSource } from '@/src/config/dataSource';
import { getOrderStatusLabelKey, mockRider, orderSteps } from '@/src/data/mock';
import { useOrder } from '@/src/hooks/useOrder';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useTypography } from '@/src/hooks/useTypography';
import { useTranslation } from '@/src/i18n';
import { ColorScheme, Spacing } from '@/src/theme';
import { resetToHome } from '@/src/utils/resetToTab';

export default function OrderTrackingScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const typography = useTypography();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);
  const { orderId } = useLocalSearchParams<{ orderId?: string }>();
  const { order, loading, error, reload, advanceStatus, isAdvancing } = useOrder(orderId);

  const handleBackToHome = () => {
    // Ends the booking flow — clears the entire pushed stack (Laundry
    // Details → ... → Tracking) rather than just swapping this one screen.
    // See src/utils/resetToTab.ts for why a plain replace() isn't enough.
    resetToHome();
  };

  if (isSupabaseDataSource && loading) {
    return (
      <AppScreen title={t('trackOrder')}>
        <LoadingState message={t('loadingOrders')} />
      </AppScreen>
    );
  }

  if (isSupabaseDataSource && error) {
    return (
      <AppScreen title={t('trackOrder')}>
        <ErrorState message={t('unableToLoadOrders')} retryLabel={t('retry')} onRetry={reload} />
      </AppScreen>
    );
  }

  if (!order) {
    return (
      <AppScreen title={t('trackOrder')}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>{t('orderNotFound')}</Text>
        </View>
      </AppScreen>
    );
  }

  const timelineSteps = orderSteps.map((step) => ({ id: step.id, label: t(step.labelKey) }));
  const statusLabel = t(getOrderStatusLabelKey(order.status, order.stepId));

  const handleViewFullDetails = () => {
    // `/order-details` is an index route; see the Href-cast note in app/(tabs)/home.tsx —
    // the local typed-routes generator doesn't collapse index files to their parent path.
    router.push({
      pathname: '/order-details',
      params: { orderId: order.id },
    } as unknown as Href);
  };

  const canAdvance = isSupabaseDataSource && order.status === 'active' && order.stepId !== 'delivered';

  return (
    <AppScreen
      title={t('trackOrder')}
      footer={
        <>
          {canAdvance ? (
            <Button
              title="Simulate Next Update (Demo)"
              variant="outline"
              fullWidth
              loading={isAdvancing}
              disabled={isAdvancing}
              onPress={advanceStatus}
              accessibilityHint="Advances this order to its next status — stands in for a rider/shop app that doesn't exist yet"
            />
          ) : null}
          <Button
            title={t('viewDetails')}
            fullWidth
            onPress={handleViewFullDetails}
            accessibilityHint="Navigates to order details"
          />
          <Button
            title={t('backToHome')}
            variant="outline"
            fullWidth
            onPress={handleBackToHome}
            accessibilityHint="Returns to the home screen"
          />
        </>
      }
    >
      <View style={styles.section}>
        <SectionHeader title={t('currentStatus')} />
        <Card variant="elevated">
          <View style={styles.statusHeader}>
            <Text style={styles.orderId}>{order.id}</Text>
            <Badge label={statusLabel} variant="primary" />
          </View>
          <Text style={styles.shopName}>{order.laundryName}</Text>
        </Card>
      </View>

      <View style={styles.section}>
        <SectionHeader title="Order Timeline" />
        <Card variant="outlined">
          <OrderTimeline steps={timelineSteps} currentStepId={order.stepId} />
        </Card>
      </View>

      {!isSupabaseDataSource ? (
        // No real rider system exists yet (no rider app assigns
        // pickup_rider_id/delivery_rider_id) — shown for mock orders only
        // rather than presenting fabricated rider data as real.
        <View style={styles.section}>
          <SectionHeader title="Your Rider" />
          <RiderCard
            name={mockRider.name}
            rating={mockRider.rating}
            vehicle={mockRider.vehicle}
            plate={mockRider.plate}
            onCall={() => console.log('Call rider pressed')}
            onMessage={() => console.log('Message rider pressed')}
          />
        </View>
      ) : null}

      <View style={[styles.section, styles.lastSection]}>
        <SectionHeader title="Order Summary" />
        <Card variant="outlined">
          <Text style={styles.previewLabel}>Selected Services</Text>
          <View style={styles.servicesRow}>
            {order.items.length === 0 ? (
              <Text style={styles.previewValue}>No services selected</Text>
            ) : (
              order.items.map((item) => <Chip key={item.id} label={item.serviceName} />)
            )}
          </View>

          <View style={styles.previewRow}>
            <Text style={styles.previewLabel}>Pickup Address</Text>
            <Text style={styles.previewValue}>{order.addressLabel}</Text>
          </View>

          <View style={[styles.previewRow, styles.previewRowLast]}>
            <Text style={styles.previewLabelEmphasis}>Estimated Total</Text>
            <Text style={styles.previewValueEmphasis}>${order.total.toFixed(2)}</Text>
          </View>
        </Card>
      </View>
    </AppScreen>
  );
}

const createStyles = (colors: ColorScheme, typography: ReturnType<typeof useTypography>) =>
  StyleSheet.create({
    notFound: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: Spacing.xl,
    },
    notFoundText: {
      fontSize: typography.body.fontSize,
      fontFamily: typography.body.fontFamily,
      color: colors.textMuted,
      textAlign: 'center',
    },
    statusHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: Spacing.xs,
    },
    orderId: {
      fontSize: typography.bodyMedium.fontSize,
      fontWeight: typography.bodyMedium.fontWeight,
      fontFamily: typography.bodyMedium.fontFamily,
      color: colors.textMuted,
    },
    shopName: {
      fontSize: typography.title.fontSize,
      lineHeight: typography.title.lineHeight,
      fontWeight: typography.title.fontWeight,
      fontFamily: typography.title.fontFamily,
      color: colors.text,
    },
    section: {
      marginBottom: Spacing.xl,
    },
    lastSection: {
      marginBottom: 0,
    },
    previewLabel: {
      fontSize: typography.caption.fontSize,
      fontFamily: typography.caption.fontFamily,
      color: colors.textMuted,
      marginBottom: Spacing.sm,
    },
    previewLabelEmphasis: {
      fontSize: typography.bodyMedium.fontSize,
      fontWeight: typography.bodyMedium.fontWeight,
      fontFamily: typography.bodyMedium.fontFamily,
      color: colors.text,
    },
    servicesRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.sm,
      marginBottom: Spacing.md,
    },
    previewRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: Spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    previewRowLast: {
      marginTop: Spacing.sm,
    },
    previewValue: {
      fontSize: typography.body.fontSize,
      fontFamily: typography.body.fontFamily,
      color: colors.text,
    },
    previewValueEmphasis: {
      fontSize: typography.subtitle.fontSize,
      fontWeight: typography.subtitle.fontWeight,
      fontFamily: typography.subtitle.fontFamily,
      color: colors.primary,
    },
  });
