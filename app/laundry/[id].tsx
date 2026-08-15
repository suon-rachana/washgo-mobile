import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { SectionHeader } from '@/src/components/common';
import { FavoriteHeaderButton } from '@/src/components/laundry';
import { AppScreen } from '@/src/components/layout';
import { Badge, Button, Card, Chip, EmptyState, ErrorState, LoadingState } from '@/src/components/ui';
import { useLaundry } from '@/src/hooks/useLaundry';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useTypography } from '@/src/hooks/useTypography';
import { useTranslation } from '@/src/i18n';
import { ColorScheme, Radius, Spacing } from '@/src/theme';

export default function LaundryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colors = useThemeColors();
  const typography = useTypography();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);
  const { laundry, loading, error, reload } = useLaundry(id);

  if (loading) {
    return (
      <AppScreen title={t('laundryDetails')}>
        <LoadingState message={t('loadingLaundries')} />
      </AppScreen>
    );
  }

  if (error) {
    return (
      <AppScreen title={t('laundryDetails')}>
        <ErrorState message={t('unableToLoadLaundries')} retryLabel={t('retry')} onRetry={reload} />
      </AppScreen>
    );
  }

  if (!laundry) {
    return (
      <AppScreen title={t('laundryDetails')}>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>This laundry could not be found.</Text>
        </View>
      </AppScreen>
    );
  }

  const handleSelectServices = () => {
    // `/services` is an index route; see the Href-cast note in app/(tabs)/home.tsx —
    // the local typed-routes generator doesn't collapse index files to their parent path.
    router.push({ pathname: '/services', params: { laundryId: laundry.id } } as unknown as Href);
  };

  return (
    <AppScreen
      title={t('laundryDetails')}
      headerRight={() => <FavoriteHeaderButton laundryId={laundry.id} />}
      footer={
        <Button
          title="Select Services"
          fullWidth
          onPress={handleSelectServices}
          accessibilityHint="Continues to choose services for this laundry"
        />
      }
    >
      <View style={styles.headerRow}>
        <Text style={styles.name}>{laundry.name}</Text>
        <Badge label={laundry.isOpen ? 'Open' : 'Closed'} variant={laundry.isOpen ? 'success' : 'neutral'} />
      </View>

      <View style={styles.metaRow}>
        <Ionicons name="star" size={16} color={colors.warning} />
        <Text style={styles.metaText}>{laundry.rating.toFixed(1)}</Text>

        <Text style={styles.dot}>•</Text>
        <Ionicons name="location-outline" size={16} color={colors.textMuted} />
        <Text style={styles.metaText}>{laundry.distanceKm.toFixed(1)} km away</Text>

        <Text style={styles.dot}>•</Text>
        <Ionicons name="time-outline" size={16} color={colors.textMuted} />
        <Text style={styles.metaText}>{laundry.etaMinutes} min</Text>
      </View>

      <View style={styles.section}>
        <SectionHeader title="Services" />
        <View style={styles.servicesRow}>
          {laundry.services.map((service) => (
            <Chip key={service.id} label={service.label} />
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <SectionHeader title="Pricing" />
        <Card variant="outlined" padding="none">
          {laundry.services.map((service, index) => (
            <View
              key={service.id}
              style={[styles.priceRow, index < laundry.services.length - 1 && styles.priceRowDivider]}
            >
              <Text style={styles.priceLabel}>{service.label}</Text>
              <Text style={styles.priceValue}>
                {laundry.currency}
                {service.price.toFixed(2)}
              </Text>
            </View>
          ))}
        </Card>
      </View>

      {laundry.pickupWindow && laundry.deliveryWindow ? (
        <View style={styles.section}>
          <SectionHeader title="Pickup & Delivery" />
          <Card variant="outlined">
            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Ionicons name="calendar-outline" size={18} color={colors.primary} />
              </View>
              <View style={styles.infoTextWrap}>
                <Text style={styles.infoLabel}>Pickup</Text>
                <Text style={styles.infoValue}>{laundry.pickupWindow}</Text>
              </View>
            </View>

            <View style={[styles.infoRow, styles.infoRowLast]}>
              <View style={styles.infoIcon}>
                <Ionicons name="bicycle-outline" size={18} color={colors.primary} />
              </View>
              <View style={styles.infoTextWrap}>
                <Text style={styles.infoLabel}>Delivery</Text>
                <Text style={styles.infoValue}>{laundry.deliveryWindow}</Text>
              </View>
            </View>
          </Card>
        </View>
      ) : laundry.phone || laundry.addressLine ? (
        // Real (Supabase) laundries don't have a fixed per-shop pickup/delivery
        // window — scheduling happens per-order — so this falls back to contact
        // details instead. See src/services/laundryService.ts.
        <View style={styles.section}>
          <SectionHeader title={t('contactLaundry')} />
          <Card variant="outlined">
            {laundry.phone ? (
              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <Ionicons name="call-outline" size={18} color={colors.primary} />
                </View>
                <View style={styles.infoTextWrap}>
                  <Text style={styles.infoLabel}>Phone</Text>
                  <Text style={styles.infoValue}>{laundry.phone}</Text>
                </View>
              </View>
            ) : null}

            {laundry.addressLine ? (
              <View style={[styles.infoRow, styles.infoRowLast]}>
                <View style={styles.infoIcon}>
                  <Ionicons name="location-outline" size={18} color={colors.primary} />
                </View>
                <View style={styles.infoTextWrap}>
                  <Text style={styles.infoLabel}>Address</Text>
                  <Text style={styles.infoValue}>{laundry.addressLine}</Text>
                </View>
              </View>
            ) : null}
          </Card>
        </View>
      ) : null}

      <View style={[styles.section, styles.lastSection]}>
        <View style={styles.reviewsHeader}>
          <Text style={styles.sectionTitle}>Reviews</Text>
          <Text style={styles.reviewsCount}>{laundry.reviews.length} reviews</Text>
        </View>

        {laundry.reviews.length === 0 ? (
          <EmptyState title={t('noReviewsYet')} description={t('noReviewsYetDescription')} icon="star-outline" />
        ) : (
          <View style={styles.reviewsList}>
            {laundry.reviews.map((review) => (
              <Card key={review.id} variant="outlined" padding="md">
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewAuthor}>{review.author}</Text>
                  <View style={styles.reviewRating}>
                    <Ionicons name="star" size={13} color={colors.warning} />
                    <Text style={styles.reviewRatingText}>{review.rating.toFixed(1)}</Text>
                  </View>
                </View>
                <Text style={styles.reviewComment} numberOfLines={2}>
                  {review.comment}
                </Text>
              </Card>
            ))}
          </View>
        )}
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
    headerRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: Spacing.sm,
      marginBottom: Spacing.xs,
    },
    name: {
      flex: 1,
      fontSize: typography.title.fontSize,
      lineHeight: typography.title.lineHeight,
      fontWeight: typography.title.fontWeight,
      fontFamily: typography.title.fontFamily,
      color: colors.text,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xxs,
      marginBottom: Spacing.xl,
    },
    metaText: {
      fontSize: typography.body.fontSize,
      fontFamily: typography.body.fontFamily,
      color: colors.textMuted,
    },
    dot: {
      fontSize: typography.body.fontSize,
      fontFamily: typography.body.fontFamily,
      color: colors.textMuted,
      marginHorizontal: Spacing.xxs,
    },
    section: {
      marginBottom: Spacing.xl,
    },
    lastSection: {
      marginBottom: 0,
    },
    sectionTitle: {
      fontSize: typography.subtitle.fontSize,
      lineHeight: typography.subtitle.lineHeight,
      fontWeight: typography.subtitle.fontWeight,
      fontFamily: typography.subtitle.fontFamily,
      color: colors.text,
      marginBottom: Spacing.md,
    },
    servicesRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.sm,
    },
    priceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
    },
    priceRowDivider: {
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    priceLabel: {
      fontSize: typography.body.fontSize,
      fontFamily: typography.body.fontFamily,
      color: colors.text,
    },
    priceValue: {
      fontSize: typography.bodyMedium.fontSize,
      fontWeight: typography.bodyMedium.fontWeight,
      fontFamily: typography.bodyMedium.fontFamily,
      color: colors.primary,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: Spacing.md,
    },
    infoRowLast: {
      marginBottom: 0,
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
    reviewsHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: Spacing.md,
    },
    reviewsCount: {
      fontSize: typography.caption.fontSize,
      fontFamily: typography.caption.fontFamily,
      color: colors.textMuted,
    },
    reviewsList: {
      gap: Spacing.md,
    },
    reviewHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: Spacing.xs,
    },
    reviewAuthor: {
      fontSize: typography.bodyMedium.fontSize,
      fontWeight: typography.bodyMedium.fontWeight,
      fontFamily: typography.bodyMedium.fontFamily,
      color: colors.text,
    },
    reviewRating: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xxs,
    },
    reviewRatingText: {
      fontSize: typography.caption.fontSize,
      fontFamily: typography.caption.fontFamily,
      color: colors.textMuted,
    },
    reviewComment: {
      fontSize: typography.body.fontSize,
      lineHeight: typography.body.lineHeight,
      fontFamily: typography.body.fontFamily,
      color: colors.textMuted,
    },
  });
