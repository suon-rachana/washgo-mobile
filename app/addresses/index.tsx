import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Alert, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { Badge, Button, Card, EmptyState, ErrorState, LoadingState } from '@/src/components/ui';
import { isSupabaseDataSource } from '@/src/config/dataSource';
import { addresses as mockAddresses } from '@/src/data/mock';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useTypography } from '@/src/hooks/useTypography';
import { useTranslation, type TranslationKey } from '@/src/i18n';
import { AppScreen } from '@/src/components/layout';
import { addressService } from '@/src/services/addressService';
import type { ServiceErrorCode } from '@/src/services/errors';
import { ColorScheme, Radius, Spacing } from '@/src/theme';
import { fromMockAddress, fromSupabaseAddress, type DisplayAddress } from '@/src/types/address';

interface AddressCardProps {
  address: DisplayAddress;
  onEdit: () => void;
  onDelete: () => void;
  onSetDefault: () => void;
  colors: ColorScheme;
  styles: ReturnType<typeof createStyles>;
  t: (key: TranslationKey) => string;
}

function AddressCard({ address, onEdit, onDelete, onSetDefault, colors, styles, t }: AddressCardProps) {
  return (
    <Card variant="elevated">
      <View style={styles.cardHeader}>
        <View style={styles.cardIcon}>
          <Ionicons name={address.icon} size={20} color={colors.primary} />
        </View>
        <View style={styles.cardTextWrap}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardLabel}>{address.label}</Text>
            {address.isDefault ? <Badge label={t('default')} variant="primary" /> : null}
          </View>
          <Text style={styles.cardDetail}>{address.detail}</Text>
        </View>
      </View>

      {!address.isDefault ? (
        <Pressable
          onPress={onSetDefault}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`${t('setAsDefault')} ${address.label}`}
          style={styles.setDefaultRow}
        >
          <Text style={styles.setDefaultText}>{t('setAsDefault')}</Text>
        </Pressable>
      ) : null}

      <View style={styles.cardActions}>
        <Button
          title={t('editAddress')}
          variant="outline"
          onPress={onEdit}
          accessibilityLabel={`${t('editAddress')} ${address.label}`}
          style={styles.actionButton}
        />
        <Button
          title={t('deleteAddress')}
          variant="outline"
          onPress={onDelete}
          accessibilityLabel={`${t('deleteAddress')} ${address.label}`}
          accessibilityHint="Asks for confirmation before removing this address"
          style={styles.actionButton}
        />
      </View>
    </Card>
  );
}

export default function SavedAddressesScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const typography = useTypography();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);

  const [addresses, setAddresses] = useState<DisplayAddress[]>(
    isSupabaseDataSource ? [] : mockAddresses.map(fromMockAddress)
  );
  const [isLoading, setIsLoading] = useState(isSupabaseDataSource);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<ServiceErrorCode | null>(null);

  const loadAddresses = useCallback(async (isRefresh = false) => {
    if (!isSupabaseDataSource) return;

    if (isRefresh) setIsRefreshing(true);
    else setIsLoading(true);
    setLoadError(null);

    const { data, error } = await addressService.list();

    if (isRefresh) setIsRefreshing(false);
    else setIsLoading(false);

    if (error) {
      setLoadError(error);
      return;
    }
    setAddresses(data.map(fromSupabaseAddress));
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAddresses();
    }, [loadAddresses])
  );

  const handleEdit = (address: DisplayAddress) => {
    router.push({ pathname: '/addresses/edit', params: { id: address.id } });
  };

  const handleSetDefault = async (address: DisplayAddress) => {
    if (!isSupabaseDataSource) {
      setAddresses((prev) => prev.map((item) => ({ ...item, isDefault: item.id === address.id })));
      return;
    }

    const previous = addresses;
    setAddresses((prev) => prev.map((item) => ({ ...item, isDefault: item.id === address.id })));
    const { error } = await addressService.setDefault(address.id);
    if (error) {
      setAddresses(previous);
      Alert.alert(t('unableToUpdateAddress'), undefined, [{ text: t('cancel'), style: 'cancel' }]);
      return;
    }

    // Optimistic update above is what the user sees immediately; reconcile
    // quietly with Supabase afterward so the list can't drift from the
    // server's actual is_default state.
    loadAddresses(true);
  };

  const handleDelete = (address: DisplayAddress) => {
    Alert.alert(t('deleteAddress'), `Remove "${address.label}" from your saved addresses?`, [
      { text: t('cancel'), style: 'cancel' },
      {
        text: t('deleteAddress'),
        style: 'destructive',
        onPress: async () => {
          if (!isSupabaseDataSource) {
            setAddresses((prev) => {
              const remaining = prev.filter((item) => item.id !== address.id);
              // Deleting the default address must not leave the list without one —
              // promote the next remaining address so the UI never shows zero defaults.
              if (address.isDefault && remaining.length > 0 && !remaining.some((item) => item.isDefault)) {
                return remaining.map((item, index) => ({ ...item, isDefault: index === 0 }));
              }
              return remaining;
            });
            return;
          }

          const { error } = await addressService.remove(address.id);
          if (error) {
            Alert.alert(t('unableToDeleteAddress'), undefined, [{ text: t('cancel'), style: 'cancel' }]);
            return;
          }

          // Remove it from view immediately rather than waiting on a refetch.
          const remaining = addresses.filter((item) => item.id !== address.id);
          setAddresses(remaining);

          // Deleting the default address promotes the next-oldest remaining
          // one — same documented rule as mock mode above.
          if (address.isDefault && remaining.length > 0) {
            await addressService.setDefault(remaining[0].id);
          }

          loadAddresses(true);
        },
      },
    ]);
  };

  const handleAdd = () => {
    router.push('/addresses/add');
  };

  return (
    <AppScreen
      title={t('savedAddresses')}
      refreshControl={
        isSupabaseDataSource ? (
          <RefreshControl refreshing={isRefreshing} onRefresh={() => loadAddresses(true)} tintColor={colors.primary} />
        ) : undefined
      }
    >
      {isLoading ? (
        <LoadingState message={t('loadingAccount')} />
      ) : loadError ? (
        <ErrorState
          message={loadError === 'not_authenticated' ? t('sessionExpired') : t('unableToLoadAddresses')}
          retryLabel={t('retry')}
          onRetry={() => loadAddresses()}
        />
      ) : addresses.length === 0 ? (
        <EmptyState
          icon="location-outline"
          title={t('savedAddresses')}
          description="You haven't saved any addresses yet."
          actionLabel={t('addAddress')}
          onActionPress={handleAdd}
        />
      ) : (
        <>
          <View style={styles.list}>
            {addresses.map((address) => (
              <AddressCard
                key={address.id}
                address={address}
                onEdit={() => handleEdit(address)}
                onDelete={() => handleDelete(address)}
                onSetDefault={() => handleSetDefault(address)}
                colors={colors}
                styles={styles}
                t={t}
              />
            ))}
          </View>

          <Button
            title={t('addAddress')}
            fullWidth
            icon={<Ionicons name="add" size={16} color={colors.onPrimary} />}
            onPress={handleAdd}
            accessibilityLabel={t('addAddress')}
            style={styles.addButton}
          />
        </>
      )}
    </AppScreen>
  );
}

const createStyles = (colors: ColorScheme, typography: ReturnType<typeof useTypography>) =>
  StyleSheet.create({
    list: {
      gap: Spacing.md,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: Spacing.md,
    },
    cardIcon: {
      width: 40,
      height: 40,
      borderRadius: Radius.circle,
      backgroundColor: `${colors.primary}1A`,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: Spacing.md,
    },
    cardTextWrap: {
      flex: 1,
    },
    cardTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xs,
      marginBottom: Spacing.xxs,
    },
    cardLabel: {
      fontSize: typography.subtitle.fontSize,
      lineHeight: typography.subtitle.lineHeight,
      fontWeight: typography.subtitle.fontWeight,
      fontFamily: typography.subtitle.fontFamily,
      color: colors.text,
    },
    cardDetail: {
      fontSize: typography.body.fontSize,
      lineHeight: typography.body.lineHeight,
      fontFamily: typography.body.fontFamily,
      color: colors.textMuted,
    },
    setDefaultRow: {
      alignSelf: 'flex-start',
      marginBottom: Spacing.md,
    },
    setDefaultText: {
      fontSize: typography.bodyMedium.fontSize,
      fontWeight: typography.bodyMedium.fontWeight,
      fontFamily: typography.bodyMedium.fontFamily,
      color: colors.primary,
    },
    cardActions: {
      flexDirection: 'row',
      gap: Spacing.sm,
    },
    actionButton: {
      flex: 1,
    },
    addButton: {
      marginTop: Spacing.xl,
    },
  });
