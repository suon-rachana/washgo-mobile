import { useMemo } from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';

import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useTypography } from '@/src/hooks/useTypography';
import { ColorScheme, Radius } from '@/src/theme';

export interface NotificationBadgeProps {
  count: number;
  /** Ring color around the badge — defaults to the page background so the
   * badge reads as a "cutout" over an icon; pass the surface color (e.g. a
   * Card's background) when used inline instead of overlaid on an icon. */
  ringColor?: string;
  style?: StyleProp<ViewStyle>;
}

const BADGE_SIZE = 18;

// Small unread-count pill — reused wherever a notification entry point needs
// a badge (Home bell, Profile menu row). Renders nothing when count is 0.
export function NotificationBadge({ count, ringColor, style }: NotificationBadgeProps) {
  const colors = useThemeColors();
  const typography = useTypography();
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);

  if (count <= 0) return null;

  const label = count > 9 ? '9+' : String(count);

  return (
    <View
      style={[styles.badge, { borderColor: ringColor ?? colors.background }, style]}
      pointerEvents="none"
      accessibilityLabel={`${count} unread notification${count === 1 ? '' : 's'}`}
    >
      <Text style={styles.text} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const createStyles = (colors: ColorScheme, typography: ReturnType<typeof useTypography>) =>
  StyleSheet.create({
    badge: {
      minWidth: BADGE_SIZE,
      height: BADGE_SIZE,
      borderRadius: Radius.pill,
      backgroundColor: colors.danger,
      borderWidth: 1.5,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 4,
    },
    // Always renders Latin digits ("1".."9+"), never Khmer script — fontFamily
    // wired anyway so nothing in the app silently skips the centralized hook.
    text: {
      fontSize: 10,
      lineHeight: 12,
      fontWeight: typography.label.fontWeight,
      fontFamily: typography.label.fontFamily,
      color: colors.onDanger,
    },
  });
