import { GestureResponderEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import { useMemo } from 'react';

import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useTypography } from '@/src/hooks/useTypography';
import { ColorScheme, Radius, Shadows, Spacing } from '@/src/theme';

export interface PromoBannerProps {
  title: string;
  ctaLabel: string;
  onPress?: (event: GestureResponderEvent) => void;
}

export function PromoBanner({ title, ctaLabel, onPress }: PromoBannerProps) {
  const colors = useThemeColors();
  const typography = useTypography();
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);

  return (
    <View style={styles.container}>
      <View style={styles.glowSecondary} />
      <View style={styles.glowAccent} />

      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Pressable
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel={ctaLabel}
          style={({ pressed }) => [styles.cta, pressed && styles.ctaPressed]}
        >
          <Text style={styles.ctaText}>{ctaLabel}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const createStyles = (colors: ColorScheme, typography: ReturnType<typeof useTypography>) =>
  StyleSheet.create({
    container: {
      borderRadius: Radius.lg,
      backgroundColor: colors.primary,
      padding: Spacing.xl,
      overflow: 'hidden',
    },
    glowSecondary: {
      position: 'absolute',
      top: -40,
      right: -30,
      width: 140,
      height: 140,
      borderRadius: Radius.circle,
      backgroundColor: colors.secondary,
      opacity: 0.35,
    },
    glowAccent: {
      position: 'absolute',
      bottom: -50,
      left: -20,
      width: 120,
      height: 120,
      borderRadius: Radius.circle,
      backgroundColor: colors.accent,
      opacity: 0.18,
    },
    content: {
      alignItems: 'flex-start',
      gap: Spacing.lg,
    },
    title: {
      fontSize: typography.title.fontSize,
      lineHeight: typography.title.lineHeight,
      fontWeight: typography.title.fontWeight,
      fontFamily: typography.title.fontFamily,
      color: colors.onPrimary,
      maxWidth: '80%',
    },
    cta: {
      backgroundColor: colors.accent,
      borderRadius: Radius.pill,
      paddingVertical: Spacing.sm,
      paddingHorizontal: Spacing.lg,
      ...Shadows.sm,
    },
    ctaPressed: {
      backgroundColor: colors.accentPressed,
    },
    ctaText: {
      fontSize: typography.button.fontSize,
      fontWeight: typography.button.fontWeight,
      fontFamily: typography.button.fontFamily,
      color: colors.onAccent,
    },
  });
