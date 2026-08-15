import { Ionicons } from '@expo/vector-icons';
import { ReactNode, useMemo } from 'react';
import { AccessibilityRole, GestureResponderEvent, Pressable, StyleSheet, Text, View } from 'react-native';

import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useTypography } from '@/src/hooks/useTypography';
import { ColorScheme, Radius, Spacing } from '@/src/theme';

export interface SettingsRowProps {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  value?: string;
  onPress?: (event: GestureResponderEvent) => void;
  rightElement?: ReactNode;
  destructive?: boolean;
  showChevron?: boolean;
  showDivider?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: AccessibilityRole;
}

// Shared tappable row (icon + title/subtitle + value/right element) for grouped
// settings-style lists — used across the Profile screen's Account, Preferences,
// and Support sections so row layout/spacing/dark-mode handling live in one place.
export function SettingsRow({
  icon,
  title,
  subtitle,
  value,
  onPress,
  rightElement,
  destructive = false,
  showChevron = true,
  showDivider = false,
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole,
}: SettingsRowProps) {
  const colors = useThemeColors();
  const typography = useTypography();
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? accessibilityRole ?? 'button' : undefined}
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityHint={accessibilityHint}
      style={({ pressed }) => [
        styles.row,
        showDivider && styles.rowDivider,
        pressed && !!onPress && styles.rowPressed,
      ]}
    >
      <View style={[styles.iconCircle, destructive && styles.iconCircleDestructive]}>{icon}</View>

      <View style={styles.textWrap}>
        <Text style={[styles.title, destructive && styles.titleDestructive]} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {value ? (
        <Text style={styles.value} numberOfLines={1}>
          {value}
        </Text>
      ) : null}

      {rightElement}

      {showChevron && !!onPress && !destructive && !rightElement ? (
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      ) : null}
    </Pressable>
  );
}

const createStyles = (colors: ColorScheme, typography: ReturnType<typeof useTypography>) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.md,
      minHeight: 44,
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
    iconCircle: {
      width: 32,
      height: 32,
      borderRadius: Radius.circle,
      backgroundColor: `${colors.primary}1A`,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconCircleDestructive: {
      backgroundColor: `${colors.danger}1A`,
    },
    textWrap: {
      flex: 1,
    },
    title: {
      fontSize: typography.body.fontSize,
      fontFamily: typography.body.fontFamily,
      color: colors.text,
    },
    titleDestructive: {
      color: colors.danger,
      fontWeight: typography.bodyMedium.fontWeight,
    },
    subtitle: {
      fontSize: typography.caption.fontSize,
      fontFamily: typography.caption.fontFamily,
      color: colors.textMuted,
      marginTop: Spacing.xxs,
    },
    value: {
      fontSize: typography.bodyMedium.fontSize,
      fontFamily: typography.bodyMedium.fontFamily,
      color: colors.textMuted,
    },
  });
