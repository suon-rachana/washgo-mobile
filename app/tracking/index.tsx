import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { SectionHeader } from '@/src/components/common';
import { AppScreen } from '@/src/components/layout';
import { OrderTimeline, RiderCard } from '@/src/components/order';
import { Badge, Button, Card, Chip } from '@/src/components/ui';
import {
  activeOrders,
  addresses,
  getOrderById,
  getOrderStatusLabelKey,
  laundries,
  mockRider,
  orderSteps,
  promotions,
  services,
} from '@/src/data/mock';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useTypography } from '@/src/hooks/useTypography';
import { useTranslation } from '@/src/i18n';
import { ColorScheme, Spacing } from '@/src/theme';
import { estimateOrderTotal } from '@/src/utils/estimateOrderTotal';
import { resetToHome } from '@/src/utils/resetToTab';

export default function OrderTrackingScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const typography = useTypography();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);
  const { orderId } = useLocalSearchParams<{ orderId?: string }>();
  // Falls back to the first active mock order when no orderId is passed, so the
  // booking flow (which doesn't always thread an id through yet) still has something to show.
  const order = getOrderById(orderId) ?? activeOrders[0];

  const handleBackToHome = () => {
    // Ends the booking flow — clears the entire pushed stack (Laundry
    // Details → ... → Tracking) rather than just swapping this one screen.
    // See src/utils/resetToTab.ts for why a plain replace() isn't enough.
    resetToHome();
  };

  if (!order) {
    return (
      <AppScreen title={t('trackOrder')}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>{t('orderNotFound')}</Text>
        </View>
      </AppScreen>
    );
  }

  const laundry = laundries.find((item) => item.id === order.laundryId);
  const address = addresses.find((item) => item.id === order.addressId);

  const selectedServiceIds = order.serviceIds.split(',').filter(Boolean);
  const selectedServices = services.filter((service) => selectedServiceIds.includes(service.id));

  const timelineSteps = orderSteps.map((step) => ({ id: step.id, label: t(step.labelKey) }));
  const statusLabel = t(getOrderStatusLabelKey(order.status, order.currentStepId));
  const { total: estimatedTotal } = estimateOrderTotal(selectedServices, promotions[0]);

  const handleViewFullDetails = () => {
    // `/order-details` is an index route; see the Href-cast note in app/(tabs)/home.tsx —
    // the local typed-routes generator doesn't collapse index files to their parent path.
    router.push({
      pathname: '/order-details',
      params: { orderId: order.id },
    } as unknown as Href);
  };

  return (
    <AppScreen
      title={t('trackOrder')}
      footer={
        <>
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
          <Text style={styles.shopName}>{laundry?.name ?? 'Unknown laundry'}</Text>
        </Card>
      </View>

      <View style={styles.section}>
        <SectionHeader title="Order Timeline" />
        <Card variant="outlined">
          <OrderTimeline steps={timelineSteps} currentStepId={order.currentStepId} />
        </Card>
      </View>

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

      <View style={[styles.section, styles.lastSection]}>
        <SectionHeader title="Order Summary" />
        <Card variant="outlined">
          <Text style={styles.previewLabel}>Selected Services</Text>
          <View style={styles.servicesRow}>
            {selectedServices.length === 0 ? (
              <Text style={styles.previewValue}>No services selected</Text>
            ) : (
              selectedServices.map((service) => <Chip key={service.id} label={service.title} />)
            )}
          </View>

          <View style={styles.previewRow}>
            <Text style={styles.previewLabel}>Pickup Address</Text>
            <Text style={styles.previewValue}>{address?.label ?? 'Not selected'}</Text>
          </View>

          <View style={[styles.previewRow, styles.previewRowLast]}>
            <Text style={styles.previewLabelEmphasis}>Estimated Total</Text>
            <Text style={styles.previewValueEmphasis}>${estimatedTotal.toFixed(2)}</Text>
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
