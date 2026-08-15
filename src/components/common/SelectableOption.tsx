import { Ionicons } from '@expo/vector-icons';
import { ComponentProps, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/src/components/ui';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useTypography } from '@/src/hooks/useTypography';
import { ColorScheme, Radius, Shadows, Spacing } from '@/src/theme';

export interface SelectableOptionProps {
  title: string;
  detail?: string;
  selected: boolean;
  onPress: () => void;
  fullWidth?: boolean;
  icon?: ComponentProps<typeof Ionicons>['name'];
  // Full accessible name for screen readers, e.g. "Select payment method Cash
  // on Delivery" — falls back to `title` alone when not provided.
  accessibilityLabel?: string;
}

// Shared radio-style selectable row — used for pickup address/size/date/time
// choices and for payment method selection, so the "selected" treatment
// (blue border, tinted fill, stronger shadow, filled radio dot) stays
// identical everywhere it appears instead of being redefined per screen.
export function SelectableOption({
  title,
  detail,
  selected,
  onPress,
  fullWidth = true,
  icon,
  accessibilityLabel,
}: SelectableOptionProps) {
  const colors = useThemeColors();
  const typography = useTypography();
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);

  return (
    <Card
      variant="outlined"
      padding="md"
      onPress={onPress}
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ selected }}
      style={[selected && styles.optionSelected, !fullWidth && styles.optionFlex]}
    >
      <View style={styles.optionRow}>
        {icon ? (
          <View style={[styles.optionIcon, selected && styles.optionIconSelected]}>
            <Ionicons name={icon} size={18} color={selected ? colors.onPrimary : colors.primary} />
          </View>
        ) : null}

        <View style={styles.optionText}>
          <Text style={styles.optionTitle}>{title}</Text>
          {detail ? <Text style={styles.optionDetail}>{detail}</Text> : null}
        </View>

        <View style={[styles.radio, selected && styles.radioSelected]}>
          {selected ? <View style={styles.radioDot} /> : null}
        </View>
      </View>
    </Card>
  );
}

const createStyles = (colors: ColorScheme, typography: ReturnType<typeof useTypography>) =>
  StyleSheet.create({
    optionFlex: {
      flex: 1,
    },
    optionSelected: {
      borderWidth: 2,
      borderColor: colors.primary,
      backgroundColor: colors.elevatedSurface,
      ...Shadows.lg,
    },
    optionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
    },
    optionIcon: {
      width: 36,
      height: 36,
      borderRadius: Radius.circle,
      backgroundColor: `${colors.primary}1A`,
      alignItems: 'center',
      justifyContent: 'center',
    },
    optionIconSelected: {
      backgroundColor: colors.primary,
    },
    optionText: {
      flex: 1,
    },
    optionTitle: {
      fontSize: typography.bodyMedium.fontSize,
      fontWeight: typography.bodyMedium.fontWeight,
      fontFamily: typography.bodyMedium.fontFamily,
      color: colors.text,
    },
    optionDetail: {
      fontSize: typography.caption.fontSize,
      fontFamily: typography.caption.fontFamily,
      color: colors.textMuted,
      marginTop: Spacing.xxs,
    },
    radio: {
      width: 20,
      height: 20,
      borderRadius: Radius.circle,
      borderWidth: 2,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    radioSelected: {
      borderColor: colors.primary,
    },
    radioDot: {
      width: 10,
      height: 10,
      borderRadius: Radius.circle,
      backgroundColor: colors.primary,
    },
  });
