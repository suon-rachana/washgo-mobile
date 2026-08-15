import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useTypography } from '@/src/hooks/useTypography';
import { ColorScheme, Radius, Spacing } from '@/src/theme';
import { Button } from './Button';

export interface ErrorStateProps {
  message: string;
  retryLabel?: string;
  onRetry?: () => void;
}

// Reusable inline error state for screens/sections whose backend call
// failed. `message` must already be localized — callers pass the result of
// t('unableToLoadAddresses'), etc., not a raw error object.
export function ErrorState({ message, retryLabel, onRetry }: ErrorStateProps) {
  const colors = useThemeColors();
  const typography = useTypography();
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);

  return (
    <View style={styles.container} accessibilityRole="alert">
      <View style={styles.iconCircle}>
        <Ionicons name="alert-circle-outline" size={26} color={colors.danger} />
      </View>
      <Text style={styles.message}>{message}</Text>
      {retryLabel && onRetry ? (
        <Button title={retryLabel} variant="outline" onPress={onRetry} style={styles.retry} />
      ) : null}
    </View>
  );
}

const createStyles = (colors: ColorScheme, typography: ReturnType<typeof useTypography>) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      paddingVertical: Spacing.xxl,
      paddingHorizontal: Spacing.xl,
    },
    iconCircle: {
      width: 56,
      height: 56,
      borderRadius: Radius.circle,
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: Spacing.md,
    },
    message: {
      fontSize: typography.body.fontSize,
      lineHeight: typography.body.lineHeight,
      fontFamily: typography.body.fontFamily,
      color: colors.textMuted,
      textAlign: 'center',
    },
    retry: {
      marginTop: Spacing.lg,
    },
  });
