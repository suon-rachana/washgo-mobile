import { Ionicons } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CategoryPill, PromoBanner, SectionHeader } from '@/src/components/common';
import { LaundryCard } from '@/src/components/laundry';
import { NotificationBadge } from '@/src/components/notification';
import { Chip, EmptyState, ErrorState, Input, LoadingState } from '@/src/components/ui';
import { isSupabaseDataSource } from '@/src/config/dataSource';
import { categories, mockUser, promotions, services } from '@/src/data/mock';
import { useLaundries } from '@/src/hooks/useLaundries';
import { useNotifications } from '@/src/hooks/useNotifications';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useTypography } from '@/src/hooks/useTypography';
import { useTranslation } from '@/src/i18n';
import { useAuthStore } from '@/src/store/auth';
import { ColorScheme, Radius, Spacing } from '@/src/theme';
import type { Laundry } from '@/src/types/laundry';
import { matchesSearch } from '@/src/utils/search';

// `/shops` and `/notifications` are index routes; the local typed-routes
// generator doesn't collapse index files to their parent path, so the
// literal string fails the type check even though it's the correct runtime
// href. Cast once here for each.
const SHOPS_HREF = '/shops' as Href;
const NOTIFICATIONS_HREF = '/notifications' as Href;

// WashGo's launch city (see app/about, docs/01_PROJECT_FOUNDATION.md) — a
// real product default, not the mock user. Used in Supabase mode only until
// a saved-address store exists to prefer the customer's default address.
const DEFAULT_LOCATION_LABEL = 'Siem Reap, Cambodia';

function firstNameFrom(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? '';
}

export default function HomeScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const typography = useTypography();
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);
  const { t } = useTranslation();
  const promotion = promotions[0];
  const [searchQuery, setSearchQuery] = useState('');
  const { unreadCount: unreadNotificationCount } = useNotifications();
  const { laundries, loading: laundriesLoading, error: laundriesError, reload: reloadLaundries } = useLaundries();

  const authProfile = useAuthStore((state) => state.profile);
  const authUser = useAuthStore((state) => state.user);

  // Same fallback chain as the Profile tab: real profile row, then Supabase
  // Auth's own metadata copy, then a neutral greeting — never mockUser.
  const metadataFullName = authUser?.user_metadata?.full_name;
  const authFullName =
    authProfile?.full_name?.trim() ||
    (typeof metadataFullName === 'string' ? metadataFullName.trim() : '');
  const displayFirstName = isSupabaseDataSource
    ? firstNameFrom(authFullName) || 'there'
    : mockUser.firstName;

  // No saved-address store is wired up yet (addressService exists but isn't
  // read from anywhere reactive), so this can't prefer a default address
  // without fetching from the screen — falls back to the app's real launch
  // city instead of the mock user's location.
  const displayLocation = isSupabaseDataSource ? DEFAULT_LOCATION_LABEL : mockUser.location;

  const isSearching = searchQuery.trim().length > 0;

  const filteredLaundries = useMemo(
    () => laundries.filter((laundry) => matchesSearch(searchQuery, [laundry.name])),
    [laundries, searchQuery]
  );
  const filteredServices = useMemo(
    () => services.filter((service) => matchesSearch(searchQuery, [service.title, service.description])),
    [searchQuery]
  );

  const visibleLaundries = isSearching ? filteredLaundries : laundries.slice(0, 4);
  const visibleServices = isSearching ? filteredServices : services;
  const hasNoResults = isSearching && filteredLaundries.length === 0 && filteredServices.length === 0;

  const handleLaundryPress = (laundry: Laundry) => {
    router.push({ pathname: '/laundry/[id]', params: { id: laundry.id } });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topRow}>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={16} color={colors.textMuted} />
            <Text style={styles.locationText}>{displayLocation}</Text>
          </View>
          <Pressable
            onPress={() => router.push(NOTIFICATIONS_HREF)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={
              unreadNotificationCount > 0
                ? `Open notifications, ${unreadNotificationCount} unread`
                : 'Open notifications'
            }
            accessibilityHint="Opens the notifications screen"
            style={styles.bellButton}
          >
            <Ionicons name="notifications-outline" size={20} color={colors.text} />
            <NotificationBadge count={unreadNotificationCount} style={styles.notificationBadge} />
          </Pressable>
        </View>

        <Text style={styles.greeting}>{t('goodMorning')}, {displayFirstName}</Text>
        <Text style={styles.subtitle}>{t('letUsHandleYourLaundry')}</Text>

        <Input
          placeholder={t('searchLaundriesOrServices')}
          icon={<Ionicons name="search" size={18} color={colors.textMuted} />}
          value={searchQuery}
          onChangeText={setSearchQuery}
          accessibilityRole="search"
          accessibilityLabel="Search laundries or services"
          containerStyle={styles.search}
        />

        {!isSearching && promotion ? (
          <PromoBanner
            title={promotion.title}
            ctaLabel={promotion.ctaLabel}
            onPress={() => router.push(SHOPS_HREF)}
          />
        ) : null}

        {!isSearching ? (
          <View style={styles.section}>
            <SectionHeader title={t('categories')} />
            <View style={styles.categoriesRow}>
              {categories.map((category) => (
                <CategoryPill
                  key={category.id}
                  label={category.label}
                  icon={category.icon}
                  color={category.color}
                  onPress={() => router.push(SHOPS_HREF)}
                  accessibilityHint="Opens laundries offering this service"
                />
              ))}
            </View>
          </View>
        ) : null}

        {laundriesLoading ? (
          <View style={styles.section}>
            <LoadingState message={t('loadingLaundries')} />
          </View>
        ) : laundriesError ? (
          <View style={styles.section}>
            <ErrorState message={t('unableToLoadLaundries')} retryLabel={t('retry')} onRetry={reloadLaundries} />
          </View>
        ) : hasNoResults ? (
          <View style={styles.section}>
            <EmptyState
              title={t('noLaundriesFound')}
              description={t('noLaundriesFoundDescription')}
            />
          </View>
        ) : (
          <>
            {visibleLaundries.length > 0 ? (
              <View style={styles.section}>
                <SectionHeader
                  title={t('nearbyLaundries')}
                  actionLabel={t('seeAll')}
                  onActionPress={() => console.log('See all laundries pressed')}
                  actionAccessibilityHint="Opens the full list of nearby laundries"
                />
                <View style={styles.laundryList}>
                  {visibleLaundries.map((laundry) => (
                    <LaundryCard key={laundry.id} laundry={laundry} onPress={handleLaundryPress} />
                  ))}
                </View>
              </View>
            ) : null}

            {visibleServices.length > 0 ? (
              <View style={[styles.section, styles.lastSection]}>
                <SectionHeader title={t('popularServices')} />
                <View style={styles.servicesRow}>
                  {visibleServices.map((service) => (
                    <Chip key={service.id} label={service.title} />
                  ))}
                </View>
              </View>
            ) : null}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: ColorScheme, typography: ReturnType<typeof useTypography>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      paddingHorizontal: Spacing.xl,
      paddingTop: Spacing.md,
      paddingBottom: Spacing.huge,
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: Spacing.sm,
    },
    locationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xxs,
    },
    bellButton: {
      width: 36,
      height: 36,
      borderRadius: Radius.circle,
      backgroundColor: `${colors.primary}1A`,
      alignItems: 'center',
      justifyContent: 'center',
    },
    notificationBadge: {
      position: 'absolute',
      top: -4,
      right: -4,
    },
    locationText: {
      fontSize: typography.caption.fontSize,
      fontFamily: typography.caption.fontFamily,
      color: colors.textMuted,
    },
    greeting: {
      fontSize: typography.headline.fontSize,
      lineHeight: typography.headline.lineHeight,
      fontWeight: typography.headline.fontWeight,
      fontFamily: typography.headline.fontFamily,
      color: colors.text,
      marginBottom: Spacing.xxs,
    },
    subtitle: {
      fontSize: typography.body.fontSize,
      lineHeight: typography.body.lineHeight,
      fontWeight: typography.body.fontWeight,
      fontFamily: typography.body.fontFamily,
      color: colors.textMuted,
      marginBottom: Spacing.xl,
    },
    search: {
      marginBottom: Spacing.xl,
    },
    section: {
      marginTop: Spacing.xxl,
    },
    lastSection: {
      marginBottom: Spacing.xl,
    },
    categoriesRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    laundryList: {
      gap: Spacing.md,
    },
    servicesRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.sm,
    },
  });
