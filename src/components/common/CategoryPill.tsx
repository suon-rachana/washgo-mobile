import { Ionicons } from '@expo/vector-icons';
import { ComponentProps, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useTypography } from '@/src/hooks/useTypography';
import { ColorScheme, Radius, Spacing } from '@/src/theme';

export type CategoryPillColor = 'primary' | 'accent';

export interface CategoryPillProps {
  label: string;
  icon: ComponentProps<typeof Ionicons>['name'];
  color?: CategoryPillColor;
  onPress?: () => void;
  accessibilityHint?: string;
}

export function CategoryPill({ label, icon, color = 'primary', onPress, accessibilityHint }: CategoryPillProps) {
  const colors = useThemeColors();
  const typography = useTypography();
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);
  const tint = color === 'accent' ? colors.accent : colors.primary;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      style={({ pressed }) => [styles.container, pressed && styles.pressed]}
    >
      <View style={[styles.iconCircle, { backgroundColor: `${tint}1A` }]}>
        <Ionicons name={icon} size={24} color={tint} />
      </View>
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const createStyles = (colors: ColorScheme, typography: ReturnType<typeof useTypography>) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      width: 76,
    },
    pressed: {
      opacity: 0.7,
    },
    iconCircle: {
      width: 56,
      height: 56,
      borderRadius: Radius.circle,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: Spacing.xs,
    },
    label: {
      fontSize: typography.caption.fontSize,
      lineHeight: typography.caption.lineHeight,
      fontFamily: typography.caption.fontFamily,
      color: colors.text,
      textAlign: 'center',
    },
  });
