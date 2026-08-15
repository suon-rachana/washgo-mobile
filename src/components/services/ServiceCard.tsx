import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Badge, Card } from '@/src/components/ui';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useTypography } from '@/src/hooks/useTypography';
import { ColorScheme, Radius, Shadows, Spacing } from '@/src/theme';
import type { Service } from '@/src/types/service';
import { formatServicePrice } from '@/src/utils/formatServicePrice';

export interface ServiceCardProps {
  service: Service;
  selected?: boolean;
  onToggle?: (service: Service) => void;
}

export function ServiceCard({ service, selected = false, onToggle }: ServiceCardProps) {
  const colors = useThemeColors();
  const typography = useTypography();
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);
  const isDisabled = !!service.comingSoon;
  const tint = service.color ?? colors.primary;

  return (
    <Card
      variant="elevated"
      padding="md"
      disabled={isDisabled}
      onPress={isDisabled ? undefined : () => onToggle?.(service)}
      accessibilityLabel={`${service.title}, ${formatServicePrice(service)}${isDisabled ? ', coming soon' : ''}`}
      accessibilityHint={
        isDisabled
          ? undefined
          : selected
            ? 'Removes this service from your order'
            : 'Adds this service to your order'
      }
      accessibilityState={{ selected }}
      style={selected && styles.selected}
    >
      <View style={styles.row}>
        <View style={[styles.iconCircle, { backgroundColor: `${tint}1A` }]}>
          <Ionicons name={service.icon} size={24} color={tint} />
        </View>

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={1}>
              {service.title}
            </Text>
            {isDisabled ? (
              <Badge label="Coming Soon" variant="neutral" />
            ) : service.badge ? (
              <Badge label={service.badge} variant="accent" />
            ) : null}
          </View>

          <Text style={styles.description} numberOfLines={2}>
            {service.description}
          </Text>

          <Text style={styles.price}>{formatServicePrice(service)}</Text>
        </View>

        <View style={[styles.checkbox, selected && styles.checkboxSelected]}>
          {selected ? <Ionicons name="checkmark" size={16} color={colors.onPrimary} /> : null}
        </View>
      </View>
    </Card>
  );
}

const createStyles = (colors: ColorScheme, typography: ReturnType<typeof useTypography>) =>
  StyleSheet.create({
    selected: {
      borderWidth: 2,
      borderColor: colors.primary,
      backgroundColor: colors.elevatedSurface,
      ...Shadows.lg,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: Spacing.md,
    },
    iconCircle: {
      width: 48,
      height: 48,
      borderRadius: Radius.circle,
      alignItems: 'center',
      justifyContent: 'center',
    },
    content: {
      flex: 1,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xs,
      marginBottom: Spacing.xxs,
    },
    title: {
      flexShrink: 1,
      fontSize: typography.subtitle.fontSize,
      lineHeight: typography.subtitle.lineHeight,
      fontWeight: typography.subtitle.fontWeight,
      fontFamily: typography.subtitle.fontFamily,
      color: colors.text,
    },
    description: {
      fontSize: typography.caption.fontSize,
      lineHeight: typography.caption.lineHeight,
      fontFamily: typography.caption.fontFamily,
      color: colors.textMuted,
      marginBottom: Spacing.xs,
    },
    price: {
      fontSize: typography.bodyMedium.fontSize,
      fontWeight: typography.bodyMedium.fontWeight,
      fontFamily: typography.bodyMedium.fontFamily,
      color: colors.primary,
    },
    checkbox: {
      width: 24,
      height: 24,
      borderRadius: Radius.circle,
      borderWidth: 2,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: Spacing.xxs,
    },
    checkboxSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
  });
