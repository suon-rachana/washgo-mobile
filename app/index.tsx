import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/src/components/ui';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useTypography } from '@/src/hooks/useTypography';
import { ColorScheme, Radius, Shadows, Spacing } from '@/src/theme';

export default function SplashScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const typography = useTypography();
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.center}>
        <View style={styles.visual}>
          <View style={styles.circle}>
            <Ionicons name="shirt-outline" size={72} color={colors.primary} />
          </View>
          <View style={styles.badge}>
            <Ionicons name="bicycle-outline" size={26} color={colors.onSecondary} />
          </View>
        </View>

        <Text style={styles.wordmark}>WashGo</Text>
        <Text style={styles.tagline}>Your laundry, delivered.</Text>
      </View>

      <View style={styles.footer}>
        <Button title="Get Started" fullWidth onPress={() => router.replace('/onboarding')} />
      </View>
    </SafeAreaView>
  );
}

const CIRCLE_SIZE = 176;
const BADGE_SIZE = 56;

const createStyles = (colors: ColorScheme, typography: ReturnType<typeof useTypography>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: Spacing.xl,
    },
    visual: {
      width: CIRCLE_SIZE,
      height: CIRCLE_SIZE,
      marginBottom: Spacing.xxl,
    },
    circle: {
      width: CIRCLE_SIZE,
      height: CIRCLE_SIZE,
      borderRadius: Radius.circle,
      backgroundColor: `${colors.primary}1A`,
      alignItems: 'center',
      justifyContent: 'center',
    },
    badge: {
      position: 'absolute',
      right: 0,
      bottom: 0,
      width: BADGE_SIZE,
      height: BADGE_SIZE,
      borderRadius: Radius.circle,
      backgroundColor: colors.secondary,
      borderWidth: 3,
      borderColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
      ...Shadows.sm,
    },
    wordmark: {
      fontSize: typography.display.fontSize,
      lineHeight: typography.display.lineHeight,
      fontWeight: typography.display.fontWeight,
      fontFamily: typography.display.fontFamily,
      color: colors.text,
      marginBottom: Spacing.xs,
    },
    tagline: {
      fontSize: typography.body.fontSize,
      lineHeight: typography.body.lineHeight,
      fontWeight: typography.body.fontWeight,
      fontFamily: typography.body.fontFamily,
      color: colors.textMuted,
    },
    footer: {
      paddingHorizontal: Spacing.xl,
      paddingBottom: Spacing.md,
    },
  });
