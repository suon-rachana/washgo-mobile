import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { LaundryCard } from '@/src/components/laundry/LaundryCard';
import { Chip, EmptyState, ErrorState, LoadingState, Input } from '@/src/components/ui';
import { useLaundries } from '@/src/hooks/useLaundries';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useTranslation } from '@/src/i18n';
import { Spacing } from '@/src/theme';
import type { Laundry } from '@/src/types/laundry';
import { matchesSearch } from '@/src/utils/search';

type LaundryFilter = 'all' | 'open' | 'nearest' | 'topRated';

const FILTERS: { id: LaundryFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'open', label: 'Open Now' },
  { id: 'nearest', label: 'Nearest' },
  { id: 'topRated', label: 'Top Rated' },
];

// Shared body (search + filters + list) for both the pushed `/shops` screen and
// the "Laundries" tab — the two differ only in their surrounding header/back button.
export function LaundryBrowser() {
  const router = useRouter();
  const colors = useThemeColors();
  const { t } = useTranslation();
  const { laundries, loading, error, reload } = useLaundries();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<LaundryFilter>('all');

  const visibleLaundries = useMemo(() => {
    let list = laundries.filter((laundry) =>
      matchesSearch(searchQuery, [
        laundry.name,
        `${laundry.distanceKm.toFixed(1)} km`,
        laundry.isOpen ? 'open' : 'closed',
      ])
    );

    if (activeFilter === 'open') {
      list = list.filter((laundry) => laundry.isOpen);
    } else if (activeFilter === 'nearest') {
      list = [...list].sort((a, b) => a.distanceKm - b.distanceKm);
    } else if (activeFilter === 'topRated') {
      list = [...list].sort((a, b) => b.rating - a.rating);
    }

    return list;
  }, [laundries, searchQuery, activeFilter]);

  const handlePress = (laundry: Laundry) => {
    router.push({ pathname: '/laundry/[id]', params: { id: laundry.id } });
  };

  return (
    <>
      <Input
        placeholder="Search laundries..."
        icon={<Ionicons name="search" size={18} color={colors.textMuted} />}
        value={searchQuery}
        onChangeText={setSearchQuery}
        accessibilityRole="search"
        accessibilityLabel="Search laundries"
        containerStyle={styles.search}
      />

      <View style={styles.filterRow}>
        {FILTERS.map((filter) => (
          <Chip
            key={filter.id}
            label={filter.label}
            selected={activeFilter === filter.id}
            onPress={() => setActiveFilter(filter.id)}
          />
        ))}
      </View>

      {loading ? (
        <LoadingState message={t('loadingLaundries')} />
      ) : error ? (
        <ErrorState message={t('unableToLoadLaundries')} retryLabel={t('retry')} onRetry={reload} />
      ) : (
        <View style={styles.list}>
          {visibleLaundries.length === 0 ? (
            <EmptyState title="No laundries found" description="Try adjusting your search." />
          ) : (
            visibleLaundries.map((laundry) => (
              <LaundryCard key={laundry.id} laundry={laundry} onPress={handlePress} />
            ))
          )}
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  search: {
    marginBottom: Spacing.md,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  list: {
    gap: Spacing.md,
  },
});
