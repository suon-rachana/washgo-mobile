import { Ionicons } from '@expo/vector-icons';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '@/src/components/layout';
import { Button, ErrorState, Input, LoadingState } from '@/src/components/ui';
import { isSupabaseDataSource } from '@/src/config/dataSource';
import { mockUser } from '@/src/data/mock';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useTypography } from '@/src/hooks/useTypography';
import { useTranslation } from '@/src/i18n';
import { profileService } from '@/src/services/profileService';
import type { ServiceErrorCode } from '@/src/services/errors';
import { useAuthStore } from '@/src/store/auth';
import { ColorScheme, Spacing } from '@/src/theme';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[0-9\s-]{8,}$/;

interface FormErrors {
  fullName?: string;
  phone?: string;
  email?: string;
}

export default function PersonalInformationScreen() {
  const colors = useThemeColors();
  const typography = useTypography();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);

  const [fullName, setFullName] = useState(isSupabaseDataSource ? '' : mockUser.fullName);
  const [phone, setPhone] = useState(isSupabaseDataSource ? '' : mockUser.phone);
  const [email, setEmail] = useState(isSupabaseDataSource ? '' : mockUser.email);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showSaved, setShowSaved] = useState(false);
  const savedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isLoading, setIsLoading] = useState(isSupabaseDataSource);
  const [loadError, setLoadError] = useState<ServiceErrorCode | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<ServiceErrorCode | null>(null);

  const loadProfile = useCallback(async () => {
    if (!isSupabaseDataSource) return;

    setIsLoading(true);
    setLoadError(null);
    const { data, error } = await profileService.fetchCurrentProfile();
    setIsLoading(false);

    if (error) {
      setLoadError(error);
      return;
    }
    setFullName(data?.full_name ?? '');
    setPhone(data?.phone ?? '');
    setEmail(data?.email ?? '');
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    return () => {
      if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current);
    };
  }, []);

  const validate = () => {
    const nextErrors: FormErrors = {};

    if (!fullName.trim()) {
      nextErrors.fullName = t('requiredField');
    }

    if (!phone.trim()) {
      nextErrors.phone = t('requiredField');
    } else if (!PHONE_PATTERN.test(phone.trim())) {
      nextErrors.phone = 'Enter a valid phone number';
    }

    // Email is read-only once Supabase Auth owns it — nothing to validate.
    if (!isSupabaseDataSource) {
      if (!email.trim()) {
        nextErrors.email = t('requiredField');
      } else if (!EMAIL_PATTERN.test(email.trim())) {
        nextErrors.email = t('invalidEmail');
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const showSavedBanner = () => {
    setShowSaved(true);
    if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current);
    savedTimeoutRef.current = setTimeout(() => setShowSaved(false), 2500);
  };

  const handleSave = async () => {
    if (!validate()) return;

    if (!isSupabaseDataSource) {
      showSavedBanner();
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    const [{ error: nameError }, { error: phoneError }] = await Promise.all([
      profileService.updateFullName(fullName.trim()),
      profileService.updatePhone(phone.trim()),
    ]);
    setIsSaving(false);

    const error = nameError ?? phoneError;
    if (error) {
      setSaveError(error);
      return;
    }

    await useAuthStore.getState().refreshProfile();
    showSavedBanner();
  };

  const saveErrorMessage =
    saveError === 'not_authenticated' ? t('sessionExpired') : saveError ? t('unableToSaveChanges') : null;

  return (
    <AppScreen title={t('personalInformation')} keyboardAvoiding>
      {isLoading ? (
        <LoadingState message={t('loadingAccount')} />
      ) : loadError ? (
        <ErrorState
          message={loadError === 'not_authenticated' ? t('sessionExpired') : t('unableToLoadProfile')}
          retryLabel={t('retry')}
          onRetry={loadProfile}
        />
      ) : (
        <>
          <View style={styles.form}>
            <Input
              label={t('fullName')}
              autoCapitalize="words"
              value={fullName}
              onChangeText={setFullName}
              error={errors.fullName}
              editable={!isSaving}
            />
            <Input
              label={t('phoneNumber')}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              error={errors.phone}
              editable={!isSaving}
            />
            <Input
              label={t('emailAddress')}
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              error={errors.email}
              editable={!isSupabaseDataSource && !isSaving}
            />
          </View>

          {saveErrorMessage ? (
            <View style={styles.saveErrorBanner} accessibilityLiveRegion="polite">
              <Ionicons name="alert-circle" size={18} color={colors.danger} />
              <Text style={styles.saveErrorText}>{saveErrorMessage}</Text>
            </View>
          ) : null}

          {showSaved ? (
            <View style={styles.savedBanner} accessibilityLiveRegion="polite">
              <Ionicons name="checkmark-circle" size={18} color={colors.success} />
              <Text style={styles.savedText}>{t('changesSaved')}</Text>
            </View>
          ) : null}

          <Button
            title={t('saveChanges')}
            fullWidth
            loading={isSaving}
            disabled={isSaving}
            onPress={handleSave}
            style={styles.saveButton}
          />
        </>
      )}
    </AppScreen>
  );
}

const createStyles = (colors: ColorScheme, typography: ReturnType<typeof useTypography>) =>
  StyleSheet.create({
    form: {
      gap: Spacing.md,
      marginBottom: Spacing.md,
    },
    saveErrorBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xs,
      marginBottom: Spacing.md,
    },
    saveErrorText: {
      fontSize: typography.body.fontSize,
      fontFamily: typography.body.fontFamily,
      color: colors.danger,
      flexShrink: 1,
    },
    savedBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xs,
      marginBottom: Spacing.md,
    },
    savedText: {
      fontSize: typography.body.fontSize,
      fontFamily: typography.body.fontFamily,
      color: colors.success,
    },
    saveButton: {
      marginTop: Spacing.sm,
    },
  });
