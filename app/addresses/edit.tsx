import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AddressForm, type AddressFormValues } from '@/src/components/profile';
import { AppScreen } from '@/src/components/layout';
import { ErrorState, LoadingState } from '@/src/components/ui';
import { isSupabaseDataSource } from '@/src/config/dataSource';
import { addresses as mockAddresses } from '@/src/data/mock';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useTypography } from '@/src/hooks/useTypography';
import { useTranslation } from '@/src/i18n';
import { addressService } from '@/src/services/addressService';
import type { ServiceErrorCode } from '@/src/services/errors';
import { ColorScheme, Spacing } from '@/src/theme';
import type { AddressRow } from '@/src/types/database';
import { combineAddressLine } from '@/src/utils/addressLine';

export default function EditAddressScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const typography = useTypography();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);
  const { id } = useLocalSearchParams<{ id?: string }>();

  const mockAddress = isSupabaseDataSource ? undefined : mockAddresses.find((item) => item.id === id);
  const [supabaseAddress, setSupabaseAddress] = useState<AddressRow | null>(null);
  const [isLoading, setIsLoading] = useState(isSupabaseDataSource);
  const [loadError, setLoadError] = useState<ServiceErrorCode | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseDataSource || !id) return;

    let cancelled = false;
    setIsLoading(true);
    setLoadError(null);
    addressService.get(id).then(({ data, error }) => {
      if (cancelled) return;
      setIsLoading(false);
      if (error) {
        setLoadError(error);
        return;
      }
      setSupabaseAddress(data);
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleSave = async (values: AddressFormValues) => {
    if (isSaving) return;

    if (!isSupabaseDataSource) {
      // Mock only — nothing to persist to. Log so the submitted values are
      // visible during development, then return to the address list.
      console.log(`Address ${id} updated (mock):`, values);
      router.back();
      return;
    }

    if (!id) return;
    setIsSaving(true);
    setSaveErrorMessage(null);
    const { error } = await addressService.update(id, {
      label: values.label,
      address_line: combineAddressLine(values.street, values.city, values.province),
      delivery_instructions: values.notes || null,
    });
    setIsSaving(false);

    if (error) {
      setSaveErrorMessage(error === 'not_authenticated' ? t('sessionExpired') : t('unableToUpdateAddress'));
      return;
    }
    router.back();
  };

  const notFound = isSupabaseDataSource ? !isLoading && !loadError && !supabaseAddress : !mockAddress;

  return (
    <AppScreen title="Edit Address">
      {isSupabaseDataSource && isLoading ? (
        <LoadingState message={t('loadingAccount')} />
      ) : isSupabaseDataSource && loadError ? (
        <ErrorState
          message={loadError === 'not_authenticated' ? t('sessionExpired') : t('unableToLoadAddresses')}
          retryLabel={t('retry')}
          onRetry={() => router.replace({ pathname: '/addresses/edit', params: { id } })}
        />
      ) : notFound ? (
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>This address could not be found.</Text>
        </View>
      ) : (
        <>
          {saveErrorMessage ? (
            <Text style={styles.errorText} accessibilityLiveRegion="polite">
              {saveErrorMessage}
            </Text>
          ) : null}
          <AddressForm
            initialValues={
              isSupabaseDataSource && supabaseAddress
                ? {
                    label: supabaseAddress.label,
                    street: supabaseAddress.address_line,
                    city: '',
                    province: '',
                    notes: supabaseAddress.delivery_instructions ?? '',
                  }
                : mockAddress
                  ? {
                      label: mockAddress.label,
                      street: mockAddress.street,
                      city: mockAddress.city,
                      province: mockAddress.province,
                      notes: mockAddress.notes,
                    }
                  : undefined
            }
            submitLabel="Save Changes"
            onSubmit={handleSave}
            loading={isSaving}
          />
        </>
      )}
    </AppScreen>
  );
}

const createStyles = (colors: ColorScheme, typography: ReturnType<typeof useTypography>) =>
  StyleSheet.create({
    errorText: {
      fontSize: typography.body.fontSize,
      lineHeight: typography.body.lineHeight,
      fontFamily: typography.body.fontFamily,
      color: colors.danger,
      marginBottom: Spacing.md,
    },
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
  });
