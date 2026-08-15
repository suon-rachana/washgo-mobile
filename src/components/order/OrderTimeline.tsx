import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useTypography } from '@/src/hooks/useTypography';
import { ColorScheme, Radius, Spacing } from '@/src/theme';

export interface OrderTimelineStep {
  id: string;
  label: string;
}

export interface OrderTimelineProps {
  steps: OrderTimelineStep[];
  currentStepId: string;
}

export function OrderTimeline({ steps, currentStepId }: OrderTimelineProps) {
  const colors = useThemeColors();
  const typography = useTypography();
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);
  const currentIndex = steps.findIndex((step) => step.id === currentStepId);

  return (
    <View>
      {steps.map((step, index) => {
        const isCompleted = currentIndex >= 0 && index < currentIndex;
        const isCurrent = index === currentIndex;
        const isLast = index === steps.length - 1;

        return (
          <View key={step.id} style={styles.row}>
            <View style={styles.indicatorColumn}>
              <View style={[styles.dot, isCompleted && styles.dotCompleted, isCurrent && styles.dotCurrent]}>
                {isCompleted ? <Ionicons name="checkmark" size={12} color={colors.onPrimary} /> : null}
                {isCurrent ? <View style={styles.dotCurrentInner} /> : null}
              </View>
              {!isLast ? <View style={[styles.line, isCompleted && styles.lineCompleted]} /> : null}
            </View>

            <View style={styles.labelWrap}>
              <Text style={[styles.label, (isCompleted || isCurrent) && styles.labelActive]}>
                {step.label}
              </Text>
              {isCurrent ? <Text style={styles.currentCaption}>In progress</Text> : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const DOT_SIZE = 22;
const LINE_HEIGHT = Spacing.xl;

const createStyles = (colors: ColorScheme, typography: ReturnType<typeof useTypography>) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
    },
    indicatorColumn: {
      alignItems: 'center',
      width: DOT_SIZE,
      marginRight: Spacing.md,
    },
    dot: {
      width: DOT_SIZE,
      height: DOT_SIZE,
      borderRadius: Radius.circle,
      borderWidth: 2,
      borderColor: colors.border,
      backgroundColor: colors.elevatedSurface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    dotCompleted: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    dotCurrent: {
      borderColor: colors.primary,
    },
    dotCurrentInner: {
      width: 10,
      height: 10,
      borderRadius: Radius.circle,
      backgroundColor: colors.primary,
    },
    line: {
      width: 2,
      height: LINE_HEIGHT,
      backgroundColor: colors.border,
    },
    lineCompleted: {
      backgroundColor: colors.primary,
    },
    labelWrap: {
      flex: 1,
      paddingBottom: Spacing.md,
    },
    label: {
      fontSize: typography.body.fontSize,
      lineHeight: typography.body.lineHeight,
      fontFamily: typography.body.fontFamily,
      color: colors.textMuted,
    },
    labelActive: {
      fontWeight: typography.bodyMedium.fontWeight,
      fontFamily: typography.bodyMedium.fontFamily,
      color: colors.text,
    },
    currentCaption: {
      fontSize: typography.caption.fontSize,
      fontFamily: typography.caption.fontFamily,
      color: colors.primary,
      marginTop: Spacing.xxs,
    },
  });
