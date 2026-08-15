import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Badge, Card } from '@/src/components/ui';
import type { Laundry } from '@/src/data/mock';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useTypography } from '@/src/hooks/useTypography';
import { ColorScheme, Spacing } from '@/src/theme';

export interface LaundryCardProps {
  laundry: Laundry;
  onPress?: (laundry: Laundry) => void;
}

export function LaundryCard({ laundry, onPress }: LaundryCardProps) {
  const colors = useThemeColors();
  const typography = useTypography();
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);

  return (
    <Card
      variant="elevated"
      padding="md"
      onPress={onPress ? () => onPress(laundry) : undefined}
      accessibilityLabel={`${laundry.name}, ${laundry.isOpen ? 'open' : 'closed'}, ${laundry.rating.toFixed(1)} stars, ${laundry.distanceKm.toFixed(1)} kilometers away`}
      accessibilityHint="Opens laundry details"
      style={styles.card}
    >
      <View style={styles.header}>
        <Text style={styles.name} numberOfLines={1}>
          {laundry.name}
        </Text>
        <Badge label={laundry.isOpen ? 'Open' : 'Closed'} variant={laundry.isOpen ? 'success' : 'neutral'} />
      </View>

      <View style={styles.metaRow}>
        <Ionicons name="star" size={14} color={colors.warning} />
        <Text style={styles.metaText}>{laundry.rating.toFixed(1)}</Text>

        <Text style={styles.dot}>•</Text>
        <Ionicons name="location-outline" size={14} color={colors.textMuted} />
        <Text style={styles.metaText}>{laundry.distanceKm.toFixed(1)} km</Text>

        <Text style={styles.dot}>•</Text>
        <Ionicons name="time-outline" size={14} color={colors.textMuted} />
        <Text style={styles.metaText}>{laundry.etaMinutes} min</Text>
      </View>

      <Text style={styles.price}>
        From {laundry.currency}
        {laundry.startingPrice.toFixed(2)}
      </Text>
    </Card>
  );
}

const createStyles = (colors: ColorScheme, typography: ReturnType<typeof useTypography>) =>
  StyleSheet.create({
    card: {
      width: '100%',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      marginBottom: Spacing.xs,
      gap: Spacing.sm,
    },
    name: {
      flex: 1,
      fontSize: typography.subtitle.fontSize,
      lineHeight: typography.subtitle.lineHeight,
      fontWeight: typography.subtitle.fontWeight,
      fontFamily: typography.subtitle.fontFamily,
      color: colors.text,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xxs,
      marginBottom: Spacing.sm,
    },
    metaText: {
      fontSize: typography.caption.fontSize,
      fontFamily: typography.caption.fontFamily,
      color: colors.textMuted,
    },
    dot: {
      fontSize: typography.caption.fontSize,
      fontFamily: typography.caption.fontFamily,
      color: colors.textMuted,
      marginHorizontal: Spacing.xxs,
    },
    price: {
      fontSize: typography.bodyMedium.fontSize,
      fontWeight: typography.bodyMedium.fontWeight,
      fontFamily: typography.bodyMedium.fontFamily,
      color: colors.primary,
    },
  });
