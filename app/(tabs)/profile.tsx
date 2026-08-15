import { Ionicons } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';
import { useMemo } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { NotificationBadge } from '@/src/components/notification';
import { Avatar, SettingsRow } from '@/src/components/profile';
import { Badge, Button, Card } from '@/src/components/ui';
import { isSupabaseDataSource } from '@/src/config/dataSource';
import { mockUser } from '@/src/data/mock';
import { useNotifications } from '@/src/hooks/useNotifications';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useTypography } from '@/src/hooks/useTypography';
import { useTranslation } from '@/src/i18n';
import { useAuthStore } from '@/src/store/auth';
import { useSettingsStore } from '@/src/store/settingsStore';
import { ColorScheme, Spacing } from '@/src/theme';

// These routes are index routes (or, for `/(tabs)/orders`, a route inside a
// group); the local typed-routes generator doesn't collapse these to a plain
// path, so the literal string fails the type check even though it's the
// correct runtime href. Cast once here for each.
const PERSONAL_INFORMATION_HREF = '/personal-information' as Href;
const ADDRESSES_HREF = '/addresses' as Href;
const PAYMENT_METHODS_HREF = '/payment-methods' as Href;
const FAVORITES_HREF = '/favorites' as Href;
const NOTIFICATIONS_HREF = '/notifications' as Href;
const LANGUAGE_HREF = '/language' as Href;
const SETTINGS_HREF = '/settings' as Href;
const HELP_CENTER_HREF = '/help-center' as Href;
const LEGAL_HREF = '/legal' as Href;
const ABOUT_HREF = '/about' as Href;

export default function ProfileScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const typography = useTypography();
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);
  const { t } = useTranslation();

  const themeMode = useSettingsStore((state) => state.themeMode);
  const toggleThemeMode = useSettingsStore((state) => state.toggleThemeMode);
  const language = useSettingsStore((state) => state.language);

  const { unreadCount: unreadNotificationCount } = useNotifications();

  const authProfile = useAuthStore((state) => state.profile);
  const authUser = useAuthStore((state) => state.user);
  const signOutFromSupabase = useAuthStore((state) => state.signOut);

  // Supabase mode must never fall back to the mock user — a missing
  // `profiles` row (fetch error, trigger lag, RLS denial) should read as
  // "no data yet", not silently resurrect the prototype's fake identity.
  // `user_metadata.full_name` is Supabase Auth's own copy of the name (set
  // at sign-up), so it's a real fallback, not a mock one.
  const metadataFullName = authUser?.user_metadata?.full_name;
  const displayName = isSupabaseDataSource
    ? authProfile?.full_name?.trim() ||
      (typeof metadataFullName === 'string' ? metadataFullName.trim() : '') ||
      'WashGo User'
    : mockUser.fullName;
  const displayPhone = isSupabaseDataSource ? authProfile?.phone?.trim() || '' : mockUser.phone;
  const displayEmail = isSupabaseDataSource
    ? authProfile?.email?.trim() || authUser?.email || ''
    : mockUser.email;

  const handleEditProfile = () => router.push(PERSONAL_INFORMATION_HREF);

  const handleContactSupport = () => {
    Alert.alert(t('contactSupport'), t('contactSupportDetails'), [{ text: t('cancel'), style: 'cancel' }]);
  };

  const handleLogout = () => {
    Alert.alert(t('logOutConfirmTitle'), t('logOutConfirmMessage'), [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('logout'),
        style: 'destructive',
        onPress: async () => {
          if (isSupabaseDataSource) {
            await signOutFromSupabase();
          }
          // Pop every pushed screen back to the root of the stack before
          // replacing it with login — `replace` alone would only swap the
          // current entry, leaving earlier authenticated screens reachable
          // via back-swipe.
          router.dismissAll();
          router.replace('/login');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card variant="elevated" style={styles.profileCard}>
          <Avatar name={displayName} />
          <Text style={styles.name}>{displayName}</Text>
          {displayPhone ? <Text style={styles.contactLine}>{displayPhone}</Text> : null}
          {displayEmail ? <Text style={styles.contactLine}>{displayEmail}</Text> : null}
          <Badge label={t('regularMember')} variant="secondary" style={styles.memberBadge} />
          <Button
            title={t('editProfile')}
            variant="outline"
            onPress={handleEditProfile}
            accessibilityHint="Opens personal information for editing"
            style={styles.editButton}
          />
        </Card>

        <Text style={styles.sectionLabel}>{t('account')}</Text>
        <Card variant="outlined" padding="none" style={styles.card}>
          <SettingsRow
            icon={<Ionicons name="person-outline" size={18} color={colors.primary} />}
            title={t('personalInformation')}
            onPress={handleEditProfile}
            showDivider
          />
          <SettingsRow
            icon={<Ionicons name="location-outline" size={18} color={colors.primary} />}
            title={t('savedAddresses')}
            onPress={() => router.push(ADDRESSES_HREF)}
            showDivider
          />
          <SettingsRow
            icon={<Ionicons name="card-outline" size={18} color={colors.primary} />}
            title={t('paymentMethods')}
            onPress={() => router.push(PAYMENT_METHODS_HREF)}
            showDivider
          />
          <SettingsRow
            icon={<Ionicons name="heart-outline" size={18} color={colors.primary} />}
            title={t('favoriteLaundries')}
            onPress={() => router.push(FAVORITES_HREF)}
            showDivider
          />
          <SettingsRow
            icon={<Ionicons name="notifications-outline" size={18} color={colors.primary} />}
            title={t('notifications')}
            onPress={() => router.push(NOTIFICATIONS_HREF)}
            rightElement={
              unreadNotificationCount > 0 ? (
                <NotificationBadge count={unreadNotificationCount} ringColor={colors.card} />
              ) : (
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              )
            }
          />
        </Card>

        <Text style={styles.sectionLabel}>{t('preferences')}</Text>
        <Card variant="outlined" padding="none" style={styles.card}>
          <SettingsRow
            icon={<Ionicons name="language-outline" size={18} color={colors.primary} />}
            title={t('language')}
            value={language === 'en' ? t('english') : t('khmer')}
            onPress={() => router.push(LANGUAGE_HREF)}
            showDivider
          />
          <SettingsRow
            icon={<Ionicons name="moon-outline" size={18} color={colors.primary} />}
            title={t('appearance')}
            value={themeMode === 'dark' ? t('dark') : t('light')}
            showDivider
            rightElement={
              <Switch
                value={themeMode === 'dark'}
                onValueChange={toggleThemeMode}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.card}
                accessibilityRole="switch"
                accessibilityLabel={t('appearance')}
                accessibilityState={{ checked: themeMode === 'dark' }}
              />
            }
          />
          <SettingsRow
            icon={<Ionicons name="settings-outline" size={18} color={colors.primary} />}
            title={t('settings')}
            onPress={() => router.push(SETTINGS_HREF)}
          />
        </Card>

        <Text style={styles.sectionLabel}>{t('support')}</Text>
        <Card variant="outlined" padding="none" style={styles.card}>
          <SettingsRow
            icon={<Ionicons name="help-circle-outline" size={18} color={colors.primary} />}
            title={t('helpCenter')}
            onPress={() => router.push(HELP_CENTER_HREF)}
            showDivider
          />
          <SettingsRow
            icon={<Ionicons name="chatbubbles-outline" size={18} color={colors.primary} />}
            title={t('contactSupport')}
            onPress={handleContactSupport}
            showChevron={false}
            showDivider
          />
          <SettingsRow
            icon={<Ionicons name="document-text-outline" size={18} color={colors.primary} />}
            title={t('termsAndPrivacy')}
            onPress={() => router.push(LEGAL_HREF)}
            showDivider
          />
          <SettingsRow
            icon={<Ionicons name="information-circle-outline" size={18} color={colors.primary} />}
            title={t('aboutWashGo')}
            onPress={() => router.push(ABOUT_HREF)}
          />
        </Card>

        <Card variant="outlined" padding="none" style={styles.card}>
          <SettingsRow
            icon={<Ionicons name="log-out-outline" size={18} color={colors.danger} />}
            title={t('logout')}
            onPress={handleLogout}
            destructive
            showChevron={false}
            accessibilityHint="Signs you out of your account"
          />
        </Card>
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
      paddingTop: Spacing.lg,
      paddingBottom: Spacing.xl,
    },
    profileCard: {
      alignItems: 'center',
      marginBottom: Spacing.xl,
    },
    name: {
      fontSize: typography.title.fontSize,
      lineHeight: typography.title.lineHeight,
      fontWeight: typography.title.fontWeight,
      fontFamily: typography.title.fontFamily,
      color: colors.text,
      marginTop: Spacing.md,
      marginBottom: Spacing.xxs,
    },
    contactLine: {
      fontSize: typography.body.fontSize,
      fontFamily: typography.body.fontFamily,
      color: colors.textMuted,
    },
    memberBadge: {
      marginTop: Spacing.sm,
    },
    editButton: {
      marginTop: Spacing.md,
      alignSelf: 'stretch',
    },
    sectionLabel: {
      fontSize: typography.label.fontSize,
      fontWeight: typography.label.fontWeight,
      letterSpacing: typography.label.letterSpacing,
      fontFamily: typography.label.fontFamily,
      color: colors.textMuted,
      marginBottom: Spacing.xs,
      textTransform: 'uppercase',
    },
    card: {
      marginBottom: Spacing.xl,
    },
  });
