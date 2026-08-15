import { Ionicons } from '@expo/vector-icons';
import { ComponentProps, useMemo } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useTypography } from '@/src/hooks/useTypography';
import { ColorScheme, Spacing } from '@/src/theme';

export interface MenuRowProps {
  icon: ComponentProps<typeof Ionicons>['name'];
  label: string;
  onPress: () => void;
  danger?: boolean;
  showDivider?: boolean;
  accessibilityHint?: string;
}

// Shared tappable row (icon + label + chevron) for menu-style lists —
// used by the Profile screen and the "Add Payment Method" option list.
export function MenuRow({
  icon,
  label,
  onPress,
  danger = false,
  showDivider = false,
  accessibilityHint,
}: MenuRowProps) {
  const colors = useThemeColors();
  const typography = useTypography();
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      style={({ pressed }) => [styles.row, showDivider && styles.rowDivider, pressed && styles.rowPressed]}
    >
      <Ionicons name={icon} size={20} color={danger ? colors.danger : colors.primary} />
      <Text style={[styles.label, danger && styles.labelDanger]}>{label}</Text>
      {!danger ? <Ionicons name="chevron-forward" size={18} color={colors.textMuted} /> : null}
    </Pressable>
  );
}

const createStyles = (colors: ColorScheme, typography: ReturnType<typeof useTypography>) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.md,
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
    },
    rowDivider: {
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    rowPressed: {
      opacity: 0.7,
    },
    label: {
      flex: 1,
      fontSize: typography.body.fontSize,
      fontFamily: typography.body.fontFamily,
      color: colors.text,
    },
    labelDanger: {
      color: colors.danger,
      fontWeight: typography.bodyMedium.fontWeight,
      fontFamily: typography.bodyMedium.fontFamily,
    },
  });
