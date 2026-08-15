import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button, Card } from '@/src/components/ui';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useTypography } from '@/src/hooks/useTypography';
import { ColorScheme, Radius, Spacing } from '@/src/theme';

export interface RiderCardProps {
  name: string;
  rating: number;
  vehicle: string;
  plate: string;
  onCall?: () => void;
  onMessage?: () => void;
}

export function RiderCard({ name, rating, vehicle, plate, onCall, onMessage }: RiderCardProps) {
  const colors = useThemeColors();
  const typography = useTypography();
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);

  return (
    <Card variant="elevated">
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={22} color={colors.primary} />
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{name}</Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={13} color={colors.warning} />
            <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.vehicleRow}>
        <Ionicons name="bicycle-outline" size={16} color={colors.textMuted} />
        <Text style={styles.vehicleText}>{vehicle}</Text>
        <Text style={styles.dot}>•</Text>
        <Text style={styles.plateText}>{plate}</Text>
      </View>

      <View style={styles.actions}>
        <Button
          title="Call"
          variant="outline"
          icon={<Ionicons name="call-outline" size={16} color={colors.primary} />}
          onPress={onCall ?? (() => {})}
          accessibilityLabel="Call rider"
          accessibilityHint="Calls the rider assigned to your order"
          style={styles.actionButton}
        />
        <Button
          title="Message"
          variant="outline"
          icon={<Ionicons name="chatbubble-outline" size={16} color={colors.primary} />}
          onPress={onMessage ?? (() => {})}
          accessibilityLabel="Message rider"
          accessibilityHint="Opens a message to the rider assigned to your order"
          style={styles.actionButton}
        />
      </View>
    </Card>
  );
}

const createStyles = (colors: ColorScheme, typography: ReturnType<typeof useTypography>) =>
  StyleSheet.create({
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: Spacing.md,
    },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: Radius.circle,
      backgroundColor: `${colors.primary}1A`,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: Spacing.md,
    },
    info: {
      flex: 1,
    },
    name: {
      fontSize: typography.bodyMedium.fontSize,
      fontWeight: typography.bodyMedium.fontWeight,
      fontFamily: typography.bodyMedium.fontFamily,
      color: colors.text,
      marginBottom: Spacing.xxs,
    },
    ratingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xxs,
    },
    ratingText: {
      fontSize: typography.caption.fontSize,
      fontFamily: typography.caption.fontFamily,
      color: colors.textMuted,
    },
    vehicleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xxs,
      marginBottom: Spacing.md,
    },
    vehicleText: {
      fontSize: typography.caption.fontSize,
      fontFamily: typography.caption.fontFamily,
      color: colors.textMuted,
    },
    dot: {
      fontSize: typography.caption.fontSize,
      fontFamily: typography.caption.fontFamily,
      color: colors.textMuted,
      marginHorizontal: Spacing.xxs,
    },
    plateText: {
      fontSize: typography.caption.fontSize,
      fontFamily: typography.caption.fontFamily,
      color: colors.textMuted,
    },
    actions: {
      flexDirection: 'row',
      gap: Spacing.sm,
    },
    actionButton: {
      flex: 1,
    },
  });
