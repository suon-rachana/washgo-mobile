import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter, type Href } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/src/components/ui';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useTypography } from '@/src/hooks/useTypography';
import { ColorScheme, Radius, Spacing } from '@/src/theme';
import { resetToHome } from '@/src/utils/resetToTab';

export default function PickupSuccessScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const typography = useTypography();
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);
  const { orderId } = useLocalSearchParams<{ orderId?: string }>();

  const handleTrackOrder = () => {
    // `/tracking` is an index route; see the Href-cast note in app/(tabs)/home.tsx —
    // the local typed-routes generator doesn't collapse index files to their parent path.
    router.push({
      pathname: '/tracking',
      params: { ...(orderId ? { orderId } : {}) },
    } as unknown as Href);
  };

  const handleBackToHome = () => {
    // Ends the booking flow — clears the entire pushed stack (Laundry
    // Details → ... → Success) rather than just swapping this one screen.
    // See src/utils/resetToTab.ts for why a plain replace() isn't enough.
    resetToHome();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Ionicons name="checkmark" size={40} color={colors.onSuccess} />
        </View>

        <Text style={styles.title}>Pickup Requested</Text>
        <Text style={styles.message}>Your rider will be assigned shortly.</Text>

        {orderId ? <Text style={styles.orderId}>Order {orderId}</Text> : null}
      </View>

      <View style={styles.footer}>
        <Button title="Track Order" fullWidth onPress={handleTrackOrder} />
        <Button title="Back to Home" variant="outline" fullWidth onPress={handleBackToHome} />
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colors: ColorScheme, typography: ReturnType<typeof useTypography>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: Spacing.xl,
    },
    iconCircle: {
      width: 80,
      height: 80,
      borderRadius: Radius.circle,
      backgroundColor: colors.success,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: Spacing.xl,
    },
    title: {
      fontSize: typography.headline.fontSize,
      lineHeight: typography.headline.lineHeight,
      fontWeight: typography.headline.fontWeight,
      fontFamily: typography.headline.fontFamily,
      color: colors.text,
      marginBottom: Spacing.xs,
      textAlign: 'center',
    },
    message: {
      fontSize: typography.body.fontSize,
      lineHeight: typography.body.lineHeight,
      fontFamily: typography.body.fontFamily,
      color: colors.textMuted,
      textAlign: 'center',
      marginBottom: Spacing.md,
    },
    orderId: {
      fontSize: typography.bodyMedium.fontSize,
      fontWeight: typography.bodyMedium.fontWeight,
      fontFamily: typography.bodyMedium.fontFamily,
      color: colors.primary,
    },
    footer: {
      paddingHorizontal: Spacing.xl,
      paddingTop: Spacing.md,
      paddingBottom: Spacing.md,
      gap: Spacing.sm,
    },
  });
