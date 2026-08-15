import React, { useMemo, useState } from "react";
import {
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from "react-native";

import { useThemeColors } from "@/src/hooks/useThemeColors";
import { useTypography } from "@/src/hooks/useTypography";
import { ColorScheme, Radius, Spacing } from "@/src/theme";

export type InputVariant = "outline" | "filled";

export interface InputProps extends Omit<TextInputProps, "style"> {
  label?: string;
  error?: string;
  disabled?: boolean;
  variant?: InputVariant;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
}

export function Input({
  label,
  error,
  disabled = false,
  variant = "outline",
  icon,
  fullWidth = true,
  containerStyle,
  onFocus,
  onBlur,
  ...textInputProps
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const colors = useThemeColors();
  const typography = useTypography();
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);
  const isMultiline = !!textInputProps.multiline;

  return (
    <View style={[fullWidth && styles.fullWidth, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <View
        style={[
          styles.field,
          isMultiline && styles.fieldMultiline,
          variant === "filled" ? styles.filled : styles.outline,
          isFocused && styles.focused,
          !!error && styles.errorBorder,
          disabled && styles.disabled,
        ]}
      >
        {icon ? <View style={styles.icon}>{icon}</View> : null}
        <TextInput
          editable={!disabled}
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          textAlignVertical={isMultiline ? "top" : "center"}
          // Falls back to the visible `label` (plus any validation error) so
          // every labeled field has an accessible name by default; callers
          // (e.g. search bars) can still override via an explicit
          // accessibilityLabel prop below.
          accessibilityLabel={error && label ? `${label}, ${error}` : label}
          accessibilityState={{ disabled }}
          onFocus={(event) => {
            setIsFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setIsFocused(false);
            onBlur?.(event);
          }}
          {...textInputProps}
        />
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const createStyles = (colors: ColorScheme, typography: ReturnType<typeof useTypography>) =>
  StyleSheet.create({
    fullWidth: {
      alignSelf: "stretch",
    },
    label: {
      fontSize: typography.label.fontSize,
      lineHeight: typography.label.lineHeight,
      fontWeight: typography.label.fontWeight,
      letterSpacing: typography.label.letterSpacing,
      fontFamily: typography.label.fontFamily,
      color: colors.text,
      marginBottom: Spacing.xxs,
    },
    field: {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: Radius.md,
      borderWidth: 1,
      minHeight: 48,
      paddingHorizontal: Spacing.md,
    },
    fieldMultiline: {
      // Multiline text should start at the top of the field, not sit
      // centered — matters once Khmer's taller line height makes wrapped
      // text noticeably longer than English at the same width.
      alignItems: "flex-start",
    },
    outline: {
      backgroundColor: colors.inputBackground,
      borderColor: colors.border,
    },
    filled: {
      backgroundColor: colors.inputBackground,
      borderColor: "transparent",
    },
    focused: {
      borderColor: colors.primary,
    },
    errorBorder: {
      borderColor: colors.danger,
    },
    disabled: {
      opacity: 0.5,
    },
    icon: {
      marginRight: Spacing.xs,
    },
    input: {
      flex: 1,
      fontSize: typography.body.fontSize,
      lineHeight: typography.body.lineHeight,
      fontWeight: typography.body.fontWeight,
      fontFamily: typography.body.fontFamily,
      color: colors.text,
      paddingVertical: Spacing.sm,
    },
    error: {
      fontSize: typography.caption.fontSize,
      lineHeight: typography.caption.lineHeight,
      fontFamily: typography.caption.fontFamily,
      color: colors.danger,
      marginTop: Spacing.xxs,
    },
  });
