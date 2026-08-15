import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useTypography } from '@/src/hooks/useTypography';
import { ColorScheme, Radius, Spacing, Typography } from '@/src/theme';

export type BadgeVariant = 'neutral' | 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'danger';

export interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

const variantStyle = (colors: ColorScheme): Record<BadgeVariant, { backgroundColor: string; color: string }> => ({
  // colors.border (not colors.background) so the badge reads clearly against
  // white/elevated cards instead of nearly disappearing into the surface.
  neutral: { backgroundColor: colors.border, color: colors.textMuted },
  primary: { backgroundColor: colors.primary, color: colors.onPrimary },
  secondary: { backgroundColor: colors.secondary, color: colors.onSecondary },
  accent: { backgroundColor: colors.accent, color: colors.onAccent },
  success: { backgroundColor: colors.success, color: colors.onSuccess },
  warning: { backgroundColor: colors.warning, color: colors.onWarning },
  danger: { backgroundColor: colors.danger, color: colors.onDanger },
});

export function Badge({ label, variant = 'neutral', icon, style }: BadgeProps) {
  const colors = useThemeColors();
  const typography = useTypography();
  const { backgroundColor, color } = variantStyle(colors)[variant];

  return (
    <View style={[styles.base, { backgroundColor }, style]}>
      {icon ? <View style={styles.icon}>{icon}</View> : null}
      <Text
        style={[
          styles.text,
          { color, lineHeight: typography.label.lineHeight, fontFamily: typography.label.fontFamily },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: Radius.pill,
    paddingVertical: Spacing.xxs,
    paddingHorizontal: Spacing.sm,
  },
  icon: {
    marginRight: Spacing.xxs,
  },
  text: {
    fontSize: Typography.label.fontSize,
    lineHeight: Typography.label.lineHeight,
    fontWeight: Typography.label.fontWeight,
    letterSpacing: Typography.label.letterSpacing,
  },
});
