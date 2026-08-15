import React, { useMemo } from 'react';
import { GestureResponderEvent, Pressable, StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useTypography } from '@/src/hooks/useTypography';
import { ColorScheme, Radius, Spacing } from '@/src/theme';

export interface ChipProps {
  label: string;
  selected?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityHint?: string;
}

export function Chip({
  label,
  selected = false,
  disabled = false,
  icon,
  onPress,
  style,
  testID,
  accessibilityHint,
}: ChipProps) {
  const colors = useThemeColors();
  const typography = useTypography();
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);

  const content = (
    <View
      style={[
        styles.base,
        selected ? styles.selected : styles.unselected,
        disabled && styles.disabled,
        style,
      ]}
    >
      {icon ? <View style={styles.icon}>{icon}</View> : null}
      <Text style={[styles.text, selected ? styles.selectedText : styles.unselectedText]}>{label}</Text>
    </View>
  );

  if (!onPress) {
    return content;
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled, selected }}
      style={({ pressed }) => [pressed && !disabled && styles.pressed]}
    >
      {content}
    </Pressable>
  );
}

const createStyles = (colors: ColorScheme, typography: ReturnType<typeof useTypography>) =>
  StyleSheet.create({
    base: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      borderRadius: Radius.pill,
      borderWidth: 1,
      paddingVertical: Spacing.xs,
      paddingHorizontal: Spacing.md,
    },
    unselected: {
      backgroundColor: colors.card,
      borderColor: colors.border,
    },
    selected: {
      backgroundColor: colors.accent,
      borderColor: colors.accent,
    },
    pressed: {
      opacity: 0.85,
    },
    disabled: {
      opacity: 0.5,
    },
    icon: {
      marginRight: Spacing.xxs,
    },
    text: {
      fontSize: typography.label.fontSize,
      lineHeight: typography.label.lineHeight,
      fontWeight: typography.label.fontWeight,
      letterSpacing: typography.label.letterSpacing,
      fontFamily: typography.label.fontFamily,
    },
    unselectedText: {
      color: colors.text,
    },
    selectedText: {
      color: colors.onAccent,
    },
  });
