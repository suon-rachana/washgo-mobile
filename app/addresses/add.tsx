import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { AddressForm, type AddressFormValues } from '@/src/components/profile';
import { AppScreen } from '@/src/components/layout';
import { isSupabaseDataSource } from '@/src/config/dataSource';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useTypography } from '@/src/hooks/useTypography';
import { useTranslation } from '@/src/i18n';
import { addressService } from '@/src/services/addressService';
import { ColorScheme, Spacing } from '@/src/theme';
import { combineAddressLine } from '@/src/utils/addressLine';

export default function AddAddressScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const typography = useTypography();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSave = async (values: AddressFormValues) => {
    if (isSaving) return;

    if (!isSupabaseDataSource) {
      // Mock only — nothing to persist to. Log so the submitted values are
      // visible during development, then return to the address list.
      console.log('Address saved (mock):', values);
      router.back();
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    const { error } = await addressService.add({
      label: values.label,
      address_line: combineAddressLine(values.street, values.city, values.province),
      delivery_instructions: values.notes || null,
    });
    setIsSaving(false);

    if (error) {
      setErrorMessage(error === 'not_authenticated' ? t('sessionExpired') : t('unableToAddAddress'));
      return;
    }
    router.back();
  };

  return (
    <AppScreen title="Add Address">
      {errorMessage ? (
        <Text style={styles.errorText} accessibilityLiveRegion="polite">
          {errorMessage}
        </Text>
      ) : null}
      <AddressForm submitLabel="Save Address" onSubmit={handleSave} loading={isSaving} />
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
  });
