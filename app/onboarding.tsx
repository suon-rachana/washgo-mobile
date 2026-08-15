import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ComponentProps, useMemo, useRef, useState } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/src/components/ui';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useTypography } from '@/src/hooks/useTypography';
import { ColorScheme, Radius, Spacing } from '@/src/theme';

interface Slide {
  icon: ComponentProps<typeof Ionicons>['name'];
  title: string;
  description: string;
}

const SLIDES: Slide[] = [
  {
    icon: 'calendar-outline',
    title: 'Schedule pickup',
    description: 'Pick a time that works for you. We collect your laundry right from your door.',
  },
  {
    icon: 'sparkles-outline',
    title: 'We clean your clothes',
    description: 'Trusted laundry partners wash, dry, and fold every item with care.',
  },
  {
    icon: 'bicycle-outline',
    title: 'Delivered back to you',
    description: 'Fresh, folded laundry brought straight back to your doorstep.',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const typography = useTypography();
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);
  const { width } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const isLastSlide = activeIndex === SLIDES.length - 1;

  const goToLogin = () => router.replace('/login');

  const handleNext = () => {
    if (isLastSlide) {
      goToLogin();
      return;
    }
    const nextIndex = activeIndex + 1;
    scrollRef.current?.scrollTo({ x: nextIndex * width, animated: true });
    setActiveIndex(nextIndex);
  };

  const handleMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / width);
    setActiveIndex(index);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <TouchableOpacity
        style={styles.skip}
        onPress={goToLogin}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel="Skip"
        accessibilityHint="Skips to the login screen"
      >
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        style={styles.scroll}>
        {SLIDES.map((slide) => (
          <View key={slide.title} style={[styles.slide, { width }]}>
            <View style={styles.iconCircle}>
              <Ionicons name={slide.icon} size={64} color={colors.primary} />
            </View>
            <Text style={styles.title}>{slide.title}</Text>
            <Text style={styles.description}>{slide.description}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((slide, index) => (
            <View
              key={slide.title}
              style={[styles.dot, index === activeIndex ? styles.dotActive : styles.dotInactive]}
            />
          ))}
        </View>

        <Button title={isLastSlide ? 'Get Started' : 'Next'} fullWidth onPress={handleNext} />
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
    skip: {
      alignSelf: 'flex-end',
      paddingHorizontal: Spacing.xl,
      paddingTop: Spacing.sm,
    },
    skipText: {
      fontSize: typography.bodyMedium.fontSize,
      fontWeight: typography.bodyMedium.fontWeight,
      fontFamily: typography.bodyMedium.fontFamily,
      color: colors.textMuted,
    },
    scroll: {
      flex: 1,
    },
    slide: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: Spacing.xxl,
    },
    iconCircle: {
      width: 160,
      height: 160,
      borderRadius: Radius.circle,
      backgroundColor: `${colors.primary}1A`,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: Spacing.xxl,
    },
    title: {
      fontSize: typography.title.fontSize,
      lineHeight: typography.title.lineHeight,
      fontWeight: typography.title.fontWeight,
      fontFamily: typography.title.fontFamily,
      color: colors.text,
      textAlign: 'center',
      marginBottom: Spacing.sm,
    },
    description: {
      fontSize: typography.body.fontSize,
      lineHeight: typography.body.lineHeight,
      fontWeight: typography.body.fontWeight,
      fontFamily: typography.body.fontFamily,
      color: colors.textMuted,
      textAlign: 'center',
    },
    footer: {
      paddingHorizontal: Spacing.xl,
      paddingBottom: Spacing.md,
    },
    dots: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: Spacing.xl,
      gap: Spacing.xxs,
    },
    dot: {
      height: 8,
      borderRadius: Radius.pill,
    },
    dotActive: {
      width: 20,
      backgroundColor: colors.primary,
    },
    dotInactive: {
      width: 8,
      backgroundColor: colors.border,
    },
  });
