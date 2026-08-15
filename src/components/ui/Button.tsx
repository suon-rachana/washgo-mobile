import React from 'react';
import {
  ActivityIndicator,
  GestureResponderEvent,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';

import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useTypography } from '@/src/hooks/useTypography';
import { ColorScheme, Radius, Spacing, Typography } from '@/src/theme';

export type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'danger';

export interface ButtonProps {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  // Overrides the accessible name — use when `title` alone is ambiguous out of
  // context (e.g. a card's "Call" button becomes "Call rider").
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

// Blue is the brand color and covers most actions. Accent (yellow) is reserved for
// high-priority, revenue-driving CTAs (Book Now, Checkout, Pay Now, promo banners, etc.) —
// use it sparingly, not as the default button color.
const variantContainer = (colors: ColorScheme): Record<ButtonVariant, ViewStyle> => ({
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.primary },
  accent: { backgroundColor: colors.accent },
  outline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.primary },
  ghost: { backgroundColor: 'transparent' },
  danger: { backgroundColor: colors.danger },
});

const variantTextColor = (colors: ColorScheme): Record<ButtonVariant, string> => ({
  primary: colors.onPrimary,
  secondary: colors.onPrimary,
  accent: colors.onAccent,
  outline: colors.primary,
  ghost: colors.primary,
  danger: colors.onDanger,
});

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  icon,
  fullWidth = false,
  style,
  testID,
  accessibilityLabel,
  accessibilityHint,
}: ButtonProps) {
  const colors = useThemeColors();
  const typography = useTypography();
  const isDisabled = disabled || loading;
  const textColor = variantTextColor(colors)[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        variantContainer(colors)[variant],
        fullWidth && styles.fullWidth,
        pressed && !isDisabled && (variant === 'accent' ? { backgroundColor: colors.accentPressed } : styles.pressed),
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <View style={styles.content}>
          {icon ? <View style={styles.icon}>{icon}</View> : null}
          <Text
            style={[
              styles.text,
              {
                color: textColor,
                lineHeight: typography.button.lineHeight,
                fontFamily: typography.button.fontFamily,
              },
            ]}
          >
            {title}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: Spacing.xs,
  },
  text: {
    fontSize: Typography.button.fontSize,
    lineHeight: Typography.button.lineHeight,
    fontWeight: Typography.button.fontWeight,
    letterSpacing: Typography.button.letterSpacing,
  },
});
