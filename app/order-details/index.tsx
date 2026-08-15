import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { ComponentProps, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { SectionHeader } from '@/src/components/common';
import { AppScreen } from '@/src/components/layout';
import { OrderTimeline } from '@/src/components/order';
import { ActionSheet, Badge, Button, Card } from '@/src/components/ui';
import {
  addresses,
  dateOptions,
  getOrderById,
  getOrderStatusLabelKey,
  laundries,
  orderSteps,
  promotions,
  services,
  sizeOptions,
  timeOptions,
} from '@/src/data/mock';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useTypography } from '@/src/hooks/useTypography';
import { useTranslation } from '@/src/i18n';
import { ColorScheme, Radius, Spacing } from '@/src/theme';
import { estimateOrderTotal } from '@/src/utils/estimateOrderTotal';

interface InfoRowProps {
  icon: ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
  subValue?: string;
  colors: ColorScheme;
  styles: ReturnType<typeof createStyles>;
}

function InfoRow({ icon, label, value, subValue, colors, styles }: InfoRowProps) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}>
        <Ionicons name={icon} size={18} color={colors.primary} />
      </View>
      <View style={styles.infoTextWrap}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
        {subValue ? <Text style={styles.infoSubValue}>{subValue}</Text> : null}
      </View>
    </View>
  );
}

interface PriceRowProps {
  label: string;
  value: string;
  emphasis?: boolean;
  positive?: boolean;
  styles: ReturnType<typeof createStyles>;
}

function PriceRow({ label, value, emphasis = false, positive = false, styles }: PriceRowProps) {
  return (
    <View style={styles.priceRow}>
      <Text style={[styles.priceLabel, emphasis && styles.priceLabelEmphasis]}>{label}</Text>
      <Text
        style={[
          styles.priceValue,
          emphasis && styles.priceValueEmphasis,
          positive && styles.priceValuePositive,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

export default function OrderDetailsScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const typography = useTypography();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);
  const { orderId } = useLocalSearchParams<{ orderId?: string }>();
  const order = getOrderById(orderId);
  const [isHelpVisible, setIsHelpVisible] = useState(false);

  const handleTrackOrder = () => {
    // `/tracking` is an index route; see the Href-cast note in app/(tabs)/home.tsx —
    // the local typed-routes generator doesn't collapse index files to their parent path.
    router.push({
      pathname: '/tracking',
      params: { orderId: order?.id },
    } as unknown as Href);
  };

  if (!order) {
    return (
      <AppScreen title={t('orderDetails')}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>{t('orderNotFound')}</Text>
        </View>
      </AppScreen>
    );
  }

  const laundry = laundries.find((item) => item.id === order.laundryId);
  const address = addresses.find((item) => item.id === order.addressId);
  const size = sizeOptions.find((item) => item.id === order.sizeId);
  const date = dateOptions.find((item) => item.id === order.dateId);
  const time = timeOptions.find((item) => item.id === order.timeId);

  const selectedServiceIds = order.serviceIds.split(',').filter(Boolean);
  const selectedServices = services.filter((service) => selectedServiceIds.includes(service.id));

  const timelineSteps = orderSteps.map((step) => ({ id: step.id, label: t(step.labelKey) }));
  const statusLabel = t(getOrderStatusLabelKey(order.status, order.currentStepId));
  const { laundryFee, pickupFee, returnDeliveryFee, discountAmount, total } = estimateOrderTotal(
    selectedServices,
    promotions[0]
  );
  const promotion = promotions[0];

  return (
    <AppScreen
      title={t('orderDetails')}
      footer={
        <>
          {order.status === 'active' ? (
            <Button
              title={t('trackOrder')}
              fullWidth
              onPress={handleTrackOrder}
              accessibilityHint="Navigates to order tracking"
            />
          ) : null}
          <Button
            title={t('needHelp')}
            variant="ghost"
            fullWidth
            onPress={() => setIsHelpVisible(true)}
            accessibilityHint="Opens support options for this order"
          />
        </>
      }
    >
      <Card variant="elevated" style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <Text style={styles.orderId}>{order.id}</Text>
          <Badge label={statusLabel} variant="primary" />
        </View>
      </Card>

      <View style={styles.section}>
        <SectionHeader title="Laundry" />
        <Card variant="outlined">
          <InfoRow
            icon="storefront-outline"
            label="Laundry"
            value={laundry?.name ?? 'Not selected'}
            colors={colors}
            styles={styles}
          />
          {laundry ? (
            <>
              <InfoRow
                icon="star"
                label="Rating"
                value={`${laundry.rating.toFixed(1)} • ${laundry.distanceKm.toFixed(1)} km away`}
                colors={colors}
                styles={styles}
              />
              <InfoRow
                icon="time-outline"
                label="Availability"
                value={laundry.isOpen ? 'Open now' : 'Closed'}
                subValue={`${laundry.etaMinutes} min estimated turnaround`}
                colors={colors}
                styles={styles}
              />
            </>
          ) : null}
        </Card>
      </View>

      <View style={styles.section}>
        <SectionHeader title="Services" />
        <Card variant="outlined" padding="none">
          {selectedServices.length === 0 ? (
            <Text style={styles.emptyText}>No services were selected.</Text>
          ) : (
            selectedServices.map((service, index) => (
              <View
                key={service.id}
                style={[
                  styles.serviceRow,
                  index < selectedServices.length - 1 && styles.serviceRowDivider,
                ]}
              >
                <Text style={styles.serviceLabel}>{service.title}</Text>
                <Text style={styles.serviceValue}>${service.price.toFixed(2)}</Text>
              </View>
            ))
          )}
        </Card>
      </View>

      <View style={styles.section}>
        <SectionHeader title="Pickup Information" />
        <Card variant="outlined">
          <InfoRow
            icon="location-outline"
            label="Pickup Address"
            value={address?.label ?? 'Not selected'}
            subValue={address?.detail}
            colors={colors}
            styles={styles}
          />
          <InfoRow
            icon="cube-outline"
            label="Size Estimate"
            value={size?.label ?? 'Not selected'}
            subValue={size?.detail}
            colors={colors}
            styles={styles}
          />
          <InfoRow
            icon="calendar-outline"
            label="Pickup Time"
            value={date && time ? `${date.label}, ${time.label}` : 'Not selected'}
            subValue={time?.detail}
            colors={colors}
            styles={styles}
          />
        </Card>
      </View>

      <View style={styles.section}>
        <SectionHeader title="Timeline" />
        <Card variant="outlined">
          <OrderTimeline steps={timelineSteps} currentStepId={order.currentStepId} />
        </Card>
      </View>

      <View style={styles.section}>
        <SectionHeader title="Summary" />
        <Card variant="outlined">
          <PriceRow label="Estimated Laundry Fee" value={`$${laundryFee.toFixed(2)}`} styles={styles} />
          <PriceRow label="Pickup Fee" value={`$${pickupFee.toFixed(2)}`} styles={styles} />
          <PriceRow label="Return Delivery Fee" value={`$${returnDeliveryFee.toFixed(2)}`} styles={styles} />
          {discountAmount > 0 ? (
            <PriceRow
              label={`Discount (${promotion.discountPercent}%)`}
              value={`-$${discountAmount.toFixed(2)}`}
              positive
              styles={styles}
            />
          ) : null}
          <View style={styles.totalDivider} />
          <PriceRow label="Estimated Total" value={`$${total.toFixed(2)}`} emphasis styles={styles} />
        </Card>
      </View>

      <View style={[styles.section, styles.lastSection]}>
        <SectionHeader title="Order Notes" />
        <Card variant="outlined">
          <Text style={styles.notesText}>{order.notes}</Text>
        </Card>
      </View>

      <ActionSheet
        visible={isHelpVisible}
        onClose={() => setIsHelpVisible(false)}
        title={t('needHelp')}
        cancelLabel={t('cancel')}
        options={[
          {
            label: t('contactLaundry'),
            icon: 'storefront-outline',
            onPress: () => console.log('Contact laundry pressed'),
          },
          ...(order.status === 'active'
            ? [
                {
                  label: t('callRider'),
                  icon: 'call-outline' as const,
                  onPress: () => console.log('Call rider pressed'),
                },
              ]
            : []),
          {
            label: t('reportAnIssue'),
            icon: 'alert-circle-outline',
            onPress: () => console.log('Report an issue pressed'),
          },
          {
            label: t('faq'),
            icon: 'help-circle-outline',
            onPress: () => router.push('/help-center'),
          },
        ]}
      />
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
    statusCard: {
      marginBottom: Spacing.xl,
    },
    statusHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    orderId: {
      fontSize: typography.subtitle.fontSize,
      fontWeight: typography.subtitle.fontWeight,
      fontFamily: typography.subtitle.fontFamily,
      color: colors.text,
    },
    section: {
      marginBottom: Spacing.xl,
    },
    lastSection: {
      marginBottom: 0,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: Spacing.md,
    },
    infoIcon: {
      width: 36,
      height: 36,
      borderRadius: Radius.circle,
      backgroundColor: `${colors.primary}1A`,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: Spacing.md,
    },
    infoTextWrap: {
      flex: 1,
    },
    infoLabel: {
      fontSize: typography.caption.fontSize,
      fontFamily: typography.caption.fontFamily,
      color: colors.textMuted,
      marginBottom: Spacing.xxs,
    },
    infoValue: {
      fontSize: typography.bodyMedium.fontSize,
      fontWeight: typography.bodyMedium.fontWeight,
      fontFamily: typography.bodyMedium.fontFamily,
      color: colors.text,
    },
    infoSubValue: {
      fontSize: typography.caption.fontSize,
      fontFamily: typography.caption.fontFamily,
      color: colors.textMuted,
      marginTop: Spacing.xxs,
    },
    emptyText: {
      fontSize: typography.body.fontSize,
      fontFamily: typography.body.fontFamily,
      color: colors.textMuted,
      textAlign: 'center',
      paddingVertical: Spacing.lg,
      paddingHorizontal: Spacing.lg,
    },
    serviceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
    },
    serviceRowDivider: {
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    serviceLabel: {
      fontSize: typography.body.fontSize,
      fontFamily: typography.body.fontFamily,
      color: colors.text,
    },
    serviceValue: {
      fontSize: typography.bodyMedium.fontSize,
      fontWeight: typography.bodyMedium.fontWeight,
      fontFamily: typography.bodyMedium.fontFamily,
      color: colors.text,
    },
    priceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: Spacing.sm,
    },
    priceLabel: {
      fontSize: typography.body.fontSize,
      fontFamily: typography.body.fontFamily,
      color: colors.textMuted,
    },
    priceLabelEmphasis: {
      fontSize: typography.subtitle.fontSize,
      fontWeight: typography.subtitle.fontWeight,
      fontFamily: typography.subtitle.fontFamily,
      color: colors.text,
    },
    priceValue: {
      fontSize: typography.body.fontSize,
      fontFamily: typography.body.fontFamily,
      color: colors.text,
    },
    priceValueEmphasis: {
      fontSize: typography.subtitle.fontSize,
      fontWeight: typography.subtitle.fontWeight,
      fontFamily: typography.subtitle.fontFamily,
      color: colors.primary,
    },
    priceValuePositive: {
      color: colors.success,
    },
    totalDivider: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
      marginBottom: Spacing.sm,
    },
    notesText: {
      fontSize: typography.body.fontSize,
      lineHeight: typography.body.lineHeight,
      fontFamily: typography.body.fontFamily,
      color: colors.textMuted,
    },
  });
