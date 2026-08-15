import { useRouter, type Href } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OrderSummaryCard } from '@/src/components/order';
import { Chip, EmptyState } from '@/src/components/ui';
import { activeOrders, pastOrders, type OrderSummary } from '@/src/data/mock';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useTranslation } from '@/src/i18n';
import { ColorScheme, Spacing } from '@/src/theme';

type OrdersFilter = 'active' | 'history';

// `/(tabs)/laundries` is a route inside a group; see the Href-cast note in
// app/profile.tsx — the local typed-routes generator doesn't collapse it to a plain path.
const LAUNDRIES_HREF = '/(tabs)/laundries' as Href;

export default function OrdersScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [filter, setFilter] = useState<OrdersFilter>('active');
  const [refreshing, setRefreshing] = useState(false);

  const visibleOrders: OrderSummary[] = filter === 'active' ? activeOrders : pastOrders;

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    // No backend yet — mock the refresh gesture so the screen still feels live.
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  const handleTrackPress = useCallback(
    (order: OrderSummary) => {
      router.push({
        pathname: '/tracking',
        params: { orderId: order.id },
      } as unknown as Href);
    },
    [router]
  );

  const handleViewDetails = useCallback(
    (order: OrderSummary) => {
      router.push({
        pathname: '/order-details',
        params: { orderId: order.id },
      } as unknown as Href);
    },
    [router]
  );

  const handleBookLaundry = useCallback(() => {
    router.push(LAUNDRIES_HREF);
  }, [router]);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.tabRow}>
        <Chip
          label={t('active')}
          selected={filter === 'active'}
          onPress={() => setFilter('active')}
          accessibilityHint="Shows your active orders"
        />
        <Chip
          label={t('history')}
          selected={filter === 'history'}
          onPress={() => setFilter('history')}
          accessibilityHint="Shows your completed and cancelled orders"
        />
      </View>

      <FlatList
        data={visibleOrders}
        keyExtractor={(order) => order.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => (
          <OrderSummaryCard
            order={item}
            onTrackPress={item.status === 'active' ? () => handleTrackPress(item) : undefined}
            onViewDetails={() => handleViewDetails(item)}
          />
        )}
        ListEmptyComponent={
          filter === 'active' ? (
            <EmptyState
              icon="receipt-outline"
              title={t('noActiveOrders')}
              description={t('noActiveOrdersDescription')}
              actionLabel={t('bookLaundry')}
              onActionPress={handleBookLaundry}
            />
          ) : (
            <EmptyState
              icon="time-outline"
              title={t('noOrderHistory')}
              description={t('noOrderHistoryDescription')}
            />
          )
        }
      />
    </SafeAreaView>
  );
}

const createStyles = (colors: ColorScheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    tabRow: {
      flexDirection: 'row',
      gap: Spacing.sm,
      paddingHorizontal: Spacing.xl,
      paddingTop: Spacing.lg,
      marginBottom: Spacing.lg,
    },
    listContent: {
      flexGrow: 1,
      paddingHorizontal: Spacing.xl,
      paddingBottom: Spacing.xl,
    },
    separator: {
      height: Spacing.lg,
    },
  });
