import { Ionicons } from '@expo/vector-icons';
import { ComponentProps, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useTypography } from '@/src/hooks/useTypography';
import { ColorScheme, Radius, Spacing } from '@/src/theme';
import { Button } from './Button';

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: ComponentProps<typeof Ionicons>['name'];
  actionLabel?: string;
  onActionPress?: () => void;
}

export function EmptyState({
  title,
  description,
  icon = 'search-outline',
  actionLabel,
  onActionPress,
}: EmptyStateProps) {
  const colors = useThemeColors();
  const typography = useTypography();
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Ionicons name={icon} size={26} color={colors.textMuted} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {actionLabel && onActionPress ? (
        <Button title={actionLabel} variant="accent" onPress={onActionPress} style={styles.action} />
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
    title: {
      fontSize: typography.subtitle.fontSize,
      lineHeight: typography.subtitle.lineHeight,
      fontWeight: typography.subtitle.fontWeight,
      fontFamily: typography.subtitle.fontFamily,
      color: colors.text,
      marginBottom: Spacing.xxs,
      textAlign: 'center',
    },
    description: {
      fontSize: typography.body.fontSize,
      lineHeight: typography.body.lineHeight,
      fontFamily: typography.body.fontFamily,
      color: colors.textMuted,
      textAlign: 'center',
    },
    action: {
      marginTop: Spacing.lg,
    },
  });
