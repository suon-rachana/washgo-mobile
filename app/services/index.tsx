import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { CharacterCounter, SectionHeader } from '@/src/components/common';
import { FavoriteHeaderButton } from '@/src/components/laundry';
import { AppScreen } from '@/src/components/layout';
import { ServiceCard, ServiceSummary } from '@/src/components/services';
import { Button, EmptyState, Input } from '@/src/components/ui';
import { laundries, services } from '@/src/data/mock';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useTypography } from '@/src/hooks/useTypography';
import { useTranslation } from '@/src/i18n';
import { ColorScheme, Spacing } from '@/src/theme';
import type { Service } from '@/src/types/service';
import { matchesSearch } from '@/src/utils/search';

const INSTRUCTIONS_MAX_LENGTH = 200;

export default function ChooseServicesScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const typography = useTypography();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);
  const { laundryId } = useLocalSearchParams<{ laundryId?: string }>();
  const laundry = laundries.find((item) => item.id === laundryId);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [instructions, setInstructions] = useState('');

  const filteredServices = useMemo(
    () =>
      services.filter((service) =>
        matchesSearch(searchQuery, [service.title, service.description, service.badge])
      ),
    [searchQuery]
  );

  const selectedServices = useMemo(
    () => services.filter((service) => selectedIds.includes(service.id)),
    [selectedIds]
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
