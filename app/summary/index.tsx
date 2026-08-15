import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { ComponentProps, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { SectionHeader } from '@/src/components/common';
import { AppScreen } from '@/src/components/layout';
import { Button, Card, ErrorState, LoadingState } from '@/src/components/ui';
import { isSupabaseDataSource } from '@/src/config/dataSource';
import {
  addresses as mockAddresses,
  dateOptions,
  laundries as mockLaundries,
  mockOrders,
  promotions,
  services as mockServices,
  sizeOptions,
  timeOptions,
} from '@/src/data/mock';
import { useLaundry } from '@/src/hooks/useLaundry';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useTypography } from '@/src/hooks/useTypography';
import { useTranslation } from '@/src/i18n';
import { ColorScheme, Radius, Spacing } from '@/src/theme';
import { estimateOrderTotal } from '@/src/utils/estimateOrderTotal';

interface SummaryRowProps {
  icon: ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
  subValue?: string;
  colors: ColorScheme;
  styles: ReturnType<typeof createStyles>;
}

function SummaryRow({ icon, label, value, subValue, colors, styles }: SummaryRowProps) {
  return (
    <View style={styles.summaryRow}>
      <View style={styles.summaryIcon}>
        <Ionicons name={icon} size={18} color={colors.primary} />
      </View>
      <View style={styles.summaryTextWrap}>
        <Text style={styles.summaryLabel}>{label}</Text>
        <Text style={styles.summaryValue}>{value}</Text>
        {subValue ? <Text style={styles.summarySubValue}>{subValue}</Text> : null}
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

export default function OrderSummaryScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const typography = useTypography();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);
  const {
    laundryId,
    serviceIds,
    addressId,
    addressLabel,
    addressLine,
    addressLatitude,
    addressLongitude,
    sizeId,
    dateId,
    timeId,
    notes,
  } = useLocalSearchParams<{
    laundryId?: string;
    serviceIds?: string;
    addressId?: string;
    addressLabel?: string;
    addressLine?: string;
    addressLatitude?: string;
    addressLongitude?: string;
    sizeId?: string;
    dateId?: string;
    timeId?: string;
    notes?: string;
  }>();

  const {
    laundry: supabaseLaundry,
    loading: laundryLoading,
    error: laundryError,
    reload: reloadLaundry,
  } = useLaundry(isSupabaseDataSource ? laundryId : undefined);

  const laundry = isSupabaseDataSource ? supabaseLaundry : mockLaundries.find((item) => item.id === laundryId);
  const address = isSupabaseDataSource
    ? addressId
      ? { label: addressLabel || 'Not selected', detail: addressLine ?? '' }
      : undefined
    : mockAddresses.find((item) => item.id === addressId);
  const size = sizeOptions.find((item) => item.id === sizeId);
  const date = dateOptions.find((item) => item.id === dateId);
  const time = timeOptions.find((item) => item.id === timeId);

  const selectedServiceIds = serviceIds ? serviceIds.split(',').filter(Boolean) : [];
  // Real laundry_services rows and the mock Service catalog both expose a
  // `price` field, which is all estimateOrderTotal() needs — no mapping
  // required between the two shapes here.
  const selectedServices = isSupabaseDataSource
    ? (supabaseLaundry?.services ?? []).filter((service) => selectedServiceIds.includes(service.id))
    : mockServices.filter((service) => selectedServiceIds.includes(service.id));

  // Normalized display shape — LaundryService uses `label`, the mock Service
  // catalog uses `title`; everything downstream in this screen only needs id/name/price.
  const displayServices = selectedServices.map((service) => ({
    id: service.id,
    name: 'label' in service ? service.label : service.title,
    price: service.price,
  }));

  // Real orders never apply a discount yet — there's no promotions table
  // (see create_order() in 004_order_creation_and_status.sql) — so this
  // preview only shows the promo banner in mock mode, where it's honest
  // about what actually gets created.
  const promotion = isSupabaseDataSource ? undefined : promotions[0];
  const { laundryFee, pickupFee, returnDeliveryFee, discountAmount, total: estimatedTotal } = estimateOrderTotal(
    selectedServices,
    promotion
  );

  const activeOrder = mockOrders.find((order) => order.status === 'active');

  const handleConfirmPickup = () => {
    if (isSupabaseDataSource) {
      // `/payment` is an index route; see the Href-cast note in app/(tabs)/home.tsx —
      // the local typed-routes generator doesn't collapse index files to their parent path.
      router.push({
        pathname: '/payment',
        params: {
          ...(laundryId ? { laundryId } : {}),
          ...(serviceIds ? { serviceIds } : {}),
          ...(addressId ? { addressId } : {}),
          ...(addressLabel ? { addressLabel } : {}),
          ...(addressLine ? { addressLine } : {}),
          ...(addressLatitude ? { addressLatitude } : {}),
          ...(addressLongitude ? { addressLongitude } : {}),
          ...(dateId ? { dateId } : {}),
          ...(timeId ? { timeId } : {}),
          ...(notes ? { notes } : {}),
        },
      } as unknown as Href);
      return;
    }

    if (!activeOrder) return;
    router.push({
      pathname: '/payment',
      params: { orderId: activeOrder.id },
    } as unknown as Href);
  };

  if (isSupabaseDataSource && laundryLoading) {
    return (
      <AppScreen title={t('orderSummary')}>
        <LoadingState message={t('loadingLaundries')} />
      </AppScreen>
    );
  }

  if (isSupabaseDataSource && laundryError) {
    return (
      <AppScreen title={t('orderSummary')}>
        <ErrorState message={t('unableToLoadLaundries')} retryLabel={t('retry')} onRetry={reloadLaundry} />
      </AppScreen>
    );
  }

  return (
    <AppScreen
      title={t('orderSummary')}
      footer={
        <Button
          title="Request Pickup"
          variant="accent"
          fullWidth
          onPress={handleConfirmPickup}
          accessibilityHint="Confirms your pickup request and proceeds to payment"
        />
      }
    >
        <View style={styles.section}>
          <SectionHeader title="Booking Details" />
          <Card variant="outlined">
            <SummaryRow
              icon="storefront-outline"
              label="Laundry"
              value={laundry?.name ?? 'Not selected'}
              colors={colors}
              styles={styles}
            />
            <SummaryRow
              icon="location-outline"
              label="Pickup Address"
              value={address?.label ?? 'Not selected'}
              subValue={address?.detail}
              colors={colors}
              styles={styles}
            />
            <SummaryRow
              icon="cube-outline"
              label="Size Estimate"
              value={size?.label ?? 'Not selected'}
              subValue={size?.detail}
              colors={colors}
              styles={styles}
            />
            <SummaryRow
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
          <SectionHeader title="Selected Services" />
          <Card variant="outlined" padding="none">
            {displayServices.length === 0 ? (
              <Text style={styles.emptyServicesText}>No services selected.</Text>
            ) : (
              displayServices.map((service, index) => (
                <View
                  key={service.id}
                  style={[
                    styles.serviceRow,
                    index < displayServices.length - 1 && styles.serviceRowDivider,
                  ]}
                >
                  <Text style={styles.serviceLabel}>{service.name}</Text>
                  <Text style={styles.serviceValue}>${service.price.toFixed(2)}</Text>
                </View>
              ))
            )}
          </Card>
        </View>

        <View style={[styles.section, styles.lastSection]}>
          <SectionHeader title="Price Breakdown" />
          <Card variant="outlined">
            <PriceRow label="Estimated Laundry Fee" value={`$${laundryFee.toFixed(2)}`} styles={styles} />
            <PriceRow label="Pickup Fee" value={`$${pickupFee.toFixed(2)}`} styles={styles} />
            <PriceRow label="Return Delivery Fee" value={`$${returnDeliveryFee.toFixed(2)}`} styles={styles} />
            {discountAmount > 0 && promotion ? (
              <PriceRow
                label={`Discount (${promotion.discountPercent}%)`}
                value={`-$${discountAmount.toFixed(2)}`}
                positive
                styles={styles}
              />
            ) : null}
            <View style={styles.totalDivider} />
            <PriceRow label="Estimated Total" value={`$${estimatedTotal.toFixed(2)}`} emphasis styles={styles} />
          </Card>

          <View style={styles.noteRow}>
            <Ionicons name="information-circle-outline" size={16} color={colors.textMuted} />
            <Text style={styles.noteText}>
              Final price may change after your laundry partner weighs your clothes.
            </Text>
          </View>
        </View>
    </AppScreen>
  );
}

const createStyles = (colors: ColorScheme, typography: ReturnType<typeof useTypography>) =>
  StyleSheet.create({
    section: {
      marginBottom: Spacing.xxl,
    },
    lastSection: {
      marginBottom: Spacing.xl,
    },
    summaryRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: Spacing.md,
    },
    summaryIcon: {
      width: 36,
      height: 36,
      borderRadius: Radius.circle,
      backgroundColor: `${colors.primary}1A`,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: Spacing.md,
    },
    summaryTextWrap: {
      flex: 1,
    },
    summaryLabel: {
      fontSize: typography.caption.fontSize,
      fontFamily: typography.caption.fontFamily,
      color: colors.textMuted,
      marginBottom: Spacing.xxs,
    },
    summaryValue: {
      fontSize: typography.bodyMedium.fontSize,
      fontWeight: typography.bodyMedium.fontWeight,
      fontFamily: typography.bodyMedium.fontFamily,
      color: colors.text,
    },
    summarySubValue: {
      fontSize: typography.caption.fontSize,
      fontFamily: typography.caption.fontFamily,
      color: colors.textMuted,
      marginTop: Spacing.xxs,
    },
    emptyServicesText: {
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
    noteRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: Spacing.xs,
      marginTop: Spacing.md,
      paddingHorizontal: Spacing.xxs,
    },
    noteText: {
      flex: 1,
      fontSize: typography.caption.fontSize,
      lineHeight: typography.caption.lineHeight,
      fontFamily: typography.caption.fontFamily,
      color: colors.textMuted,
    },
  });
