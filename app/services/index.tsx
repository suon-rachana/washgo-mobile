import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { CharacterCounter, SectionHeader } from '@/src/components/common';
import { FavoriteHeaderButton } from '@/src/components/laundry';
import { AppScreen } from '@/src/components/layout';
import { ServiceCard, ServiceSummary } from '@/src/components/services';
import { Button, EmptyState, ErrorState, Input, LoadingState } from '@/src/components/ui';
import { isSupabaseDataSource } from '@/src/config/dataSource';
import { laundries, services as mockCatalogServices } from '@/src/data/mock';
import { useLaundry } from '@/src/hooks/useLaundry';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useTypography } from '@/src/hooks/useTypography';
import { useTranslation } from '@/src/i18n';
import { Colors, ColorScheme, Spacing } from '@/src/theme';
import type { LaundryService, LaundryServicePricingUnit } from '@/src/types/laundry';
import type { Service, ServicePriceType } from '@/src/types/service';
import { matchesSearch } from '@/src/utils/search';

const INSTRUCTIONS_MAX_LENGTH = 200;

const PRICING_UNIT_TO_PRICE_TYPE: Record<LaundryServicePricingUnit, ServicePriceType> = {
  per_kg: 'kg',
  per_item: 'item',
  flat: 'fixed',
};

const PRICING_UNIT_DESCRIPTION: Record<LaundryServicePricingUnit, string> = {
  per_kg: 'Priced per kilogram of laundry.',
  per_item: 'Priced per item.',
  flat: 'One flat rate for this service.',
};

// Real laundry_services rows are simpler than the mock Service catalog (no
// icon/badge/coming-soon concept yet) — mapped here so ServiceCard/
// ServiceSummary can render either source without a second set of components.
function mapLaundryServiceToService(laundryService: LaundryService): Service {
  const pricingUnit = laundryService.pricingUnit ?? 'per_item';
  return {
    id: laundryService.id,
    title: laundryService.label,
    description: laundryService.description || PRICING_UNIT_DESCRIPTION[pricingUnit],
    icon: 'shirt-outline',
    price: laundryService.price,
    priceType: PRICING_UNIT_TO_PRICE_TYPE[pricingUnit],
    color: Colors.primary,
  };
}

export default function ChooseServicesScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const typography = useTypography();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);
  const { laundryId } = useLocalSearchParams<{ laundryId?: string }>();

  // Mock mode: laundry.services carries this laundry's own price list but
  // the mock catalog screen has always shown the full generic catalog
  // instead (see the git history) — left unchanged here to avoid altering
  // established mock-mode behavior. Supabase mode fixes this for real: the
  // whole point of laundry_services is that each shop has its own list.
  const mockLaundry = laundries.find((item) => item.id === laundryId);
  const { laundry: supabaseLaundry, loading, error, reload } = useLaundry(isSupabaseDataSource ? laundryId : undefined);
  const laundry = isSupabaseDataSource ? supabaseLaundry : mockLaundry;

  const catalogServices = useMemo<Service[]>(
    () => (isSupabaseDataSource ? (supabaseLaundry?.services ?? []).map(mapLaundryServiceToService) : mockCatalogServices),
    [supabaseLaundry]
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [instructions, setInstructions] = useState('');

  const filteredServices = useMemo(
    () =>
      catalogServices.filter((service) =>
        matchesSearch(searchQuery, [service.title, service.description, service.badge])
      ),
    [catalogServices, searchQuery]
  );

  const selectedServices = useMemo(
    () => catalogServices.filter((service) => selectedIds.includes(service.id)),
    [catalogServices, selectedIds]
  );

  const handleToggle = (service: Service) => {
    setSelectedIds((prev) =>
      prev.includes(service.id) ? prev.filter((id) => id !== service.id) : [...prev, service.id]
    );
  };

  const continueLabel =
    selectedIds.length === 0
      ? 'Select a service'
      : selectedIds.length === 1
        ? 'Continue'
        : `Continue (${selectedIds.length})`;

  const handleContinue = () => {
    // `/pickup` is an index route; see the Href-cast note in app/(tabs)/home.tsx —
    // the local typed-routes generator doesn't collapse index files to their parent path.
    router.push({
      pathname: '/pickup',
      params: {
        ...(laundryId ? { laundryId } : {}),
        serviceIds: selectedIds.join(','),
      },
    } as unknown as Href);
  };

  // Supabase mode needs a specific laundry to know which services to show —
  // unlike mock mode there's no generic catalog fallback (see the comment
  // above catalogServices).
  if (isSupabaseDataSource && !laundryId) {
    return (
      <AppScreen title={t('chooseServices')}>
        <EmptyState
          icon="storefront-outline"
          title="No laundry selected"
          description="Go back and choose a laundry first."
        />
      </AppScreen>
    );
  }

  if (isSupabaseDataSource && loading) {
    return (
      <AppScreen title={t('chooseServices')}>
        <LoadingState message={t('loadingLaundries')} />
      </AppScreen>
    );
  }

  if (isSupabaseDataSource && error) {
    return (
      <AppScreen title={t('chooseServices')}>
        <ErrorState message={t('unableToLoadLaundries')} retryLabel={t('retry')} onRetry={reload} />
      </AppScreen>
    );
  }

  return (
    <AppScreen
      title={t('chooseServices')}
      headerRight={laundry ? () => <FavoriteHeaderButton laundryId={laundry.id} /> : undefined}
      keyboardAvoiding
      footer={
        <Button
          title={continueLabel}
          fullWidth
          disabled={selectedIds.length === 0}
          onPress={handleContinue}
          accessibilityHint="Continues to pickup details"
        />
      }
    >
      <SectionHeader title={t('chooseYourService')} />
      {laundry ? <Text style={styles.laundryName}>{laundry.name}</Text> : null}

      <Input
        placeholder="Search services..."
        icon={<Ionicons name="search" size={18} color={colors.textMuted} />}
        value={searchQuery}
        onChangeText={setSearchQuery}
        accessibilityRole="search"
        accessibilityLabel="Search services"
        containerStyle={styles.search}
      />

      <Text style={styles.countText}>
        {filteredServices.length} {filteredServices.length === 1 ? 'service' : 'services'} available
      </Text>

      <View style={styles.serviceList}>
        {filteredServices.length === 0 ? (
          <EmptyState title="No services found" description="Try a different search term." />
        ) : (
          filteredServices.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              selected={selectedIds.includes(service.id)}
              onToggle={handleToggle}
            />
          ))
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Special Instructions</Text>
        <Input
          placeholder="Any special requests?"
          multiline
          numberOfLines={4}
          maxLength={INSTRUCTIONS_MAX_LENGTH}
          value={instructions}
          onChangeText={setInstructions}
          accessibilityLabel="Special instructions"
        />
        <CharacterCounter current={instructions.length} max={INSTRUCTIONS_MAX_LENGTH} style={styles.counter} />
      </View>

      <View style={[styles.section, styles.lastSection]}>
        <ServiceSummary selectedServices={selectedServices} />
      </View>
    </AppScreen>
  );
}

const createStyles = (colors: ColorScheme, typography: ReturnType<typeof useTypography>) =>
  StyleSheet.create({
    laundryName: {
      fontSize: typography.bodyMedium.fontSize,
      fontWeight: typography.bodyMedium.fontWeight,
      fontFamily: typography.bodyMedium.fontFamily,
      color: colors.textMuted,
      marginBottom: Spacing.lg,
    },
    search: {
      marginBottom: Spacing.sm,
    },
    countText: {
      fontSize: typography.caption.fontSize,
      fontFamily: typography.caption.fontFamily,
      color: colors.textMuted,
      marginBottom: Spacing.md,
    },
    serviceList: {
      gap: Spacing.md,
      marginBottom: Spacing.xl,
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
    counter: {
      alignSelf: 'flex-end',
      marginTop: Spacing.xxs,
    },
  });
