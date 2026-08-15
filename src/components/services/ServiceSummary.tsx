import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/src/components/ui';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useTypography } from '@/src/hooks/useTypography';
import { ColorScheme, Spacing } from '@/src/theme';
import type { Service } from '@/src/types/service';
import { formatServicePrice } from '@/src/utils/formatServicePrice';

export interface ServiceSummaryProps {
  selectedServices: Service[];
}

export function ServiceSummary({ selectedServices }: ServiceSummaryProps) {
  const colors = useThemeColors();
  const typography = useTypography();
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);

  if (selectedServices.length === 0) {
    return (
      <Card variant="outlined" padding="lg">
        <Text style={styles.emptyText}>Select at least one service to continue.</Text>
      </Card>
    );
  }

  const total = selectedServices.reduce((sum, service) => sum + service.price, 0);

  return (
    <Card variant="outlined" padding="lg">
      <Text style={styles.summaryTitle}>Selected Services</Text>

      <View style={styles.list}>
        {selectedServices.map((service) => (
          <View key={service.id} style={styles.row}>
            <Text style={styles.rowLabel} numberOfLines={1}>
              {service.title}
            </Text>
            <Text style={styles.rowValue}>{formatServicePrice(service)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Estimated Total</Text>
        <Text style={styles.totalValue}>From ${total.toFixed(2)}</Text>
      </View>
    </Card>
  );
}

const createStyles = (colors: ColorScheme, typography: ReturnType<typeof useTypography>) =>
  StyleSheet.create({
    emptyText: {
      fontSize: typography.body.fontSize,
      lineHeight: typography.body.lineHeight,
      fontFamily: typography.body.fontFamily,
      color: colors.textMuted,
      textAlign: 'center',
    },
    summaryTitle: {
      fontSize: typography.subtitle.fontSize,
      lineHeight: typography.subtitle.lineHeight,
      fontWeight: typography.subtitle.fontWeight,
      fontFamily: typography.subtitle.fontFamily,
      color: colors.text,
      marginBottom: Spacing.md,
    },
    list: {
      gap: Spacing.sm,
      marginBottom: Spacing.md,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: Spacing.sm,
    },
    rowLabel: {
      flex: 1,
      fontSize: typography.body.fontSize,
      fontFamily: typography.body.fontFamily,
      color: colors.text,
    },
    rowValue: {
      fontSize: typography.caption.fontSize,
      fontFamily: typography.caption.fontFamily,
      color: colors.textMuted,
    },
    totalRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: Spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    totalLabel: {
      fontSize: typography.bodyMedium.fontSize,
      fontWeight: typography.bodyMedium.fontWeight,
      fontFamily: typography.bodyMedium.fontFamily,
      color: colors.text,
    },
    totalValue: {
      fontSize: typography.subtitle.fontSize,
      fontWeight: typography.subtitle.fontWeight,
      fontFamily: typography.subtitle.fontFamily,
      color: colors.primary,
    },
  });
