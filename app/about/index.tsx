import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '@/src/components/layout';
import { Card } from '@/src/components/ui';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useTypography } from '@/src/hooks/useTypography';
import { ColorScheme, Radius, Spacing } from '@/src/theme';

const LOGO_SIZE = 96;

export default function AboutScreen() {
  const colors = useThemeColors();
  const typography = useTypography();
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);

  return (
    <AppScreen title="About WashGo">
        <View style={styles.logoSection}>
          <View style={styles.logoCircle}>
            <Ionicons name="shirt-outline" size={44} color={colors.primary} />
          </View>
          <Text style={styles.wordmark}>WashGo</Text>
          <Text style={styles.tagline}>Your laundry, delivered.</Text>
        </View>

        <Card variant="outlined" style={styles.card}>
          <Text style={styles.description}>
            WashGo connects busy people in Siem Reap with trusted local laundry partners for
            convenient pickup and delivery — schedule a pickup, track your order in real time, and
            get fresh, folded laundry brought back to your door.
          </Text>
        </Card>

        <Card variant="outlined" padding="none" style={styles.card}>
          <View style={[styles.infoRow, styles.infoRowDivider]}>
            <Text style={styles.infoLabel}>Version</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Built for</Text>
            <Text style={styles.infoValue}>Siem Reap, Cambodia</Text>
          </View>
        </Card>

        <Card variant="outlined" style={styles.card}>
          <Text style={styles.noteTitle}>Team &amp; Acknowledgments</Text>
          <Text style={styles.noteText}>
            WashGo was designed and built as an academic thesis project. Team credits and
            acknowledgments will be added here.
          </Text>
        </Card>
    </AppScreen>
  );
}

const createStyles = (colors: ColorScheme, typography: ReturnType<typeof useTypography>) =>
  StyleSheet.create({
    logoSection: {
      alignItems: 'center',
      marginBottom: Spacing.xxl,
    },
    logoCircle: {
      width: LOGO_SIZE,
      height: LOGO_SIZE,
      borderRadius: Radius.circle,
      backgroundColor: `${colors.primary}1A`,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: Spacing.md,
    },
    wordmark: {
      fontSize: typography.title.fontSize,
      lineHeight: typography.title.lineHeight,
      fontWeight: typography.title.fontWeight,
      fontFamily: typography.title.fontFamily,
      color: colors.text,
      marginBottom: Spacing.xxs,
    },
    tagline: {
      fontSize: typography.body.fontSize,
      fontFamily: typography.body.fontFamily,
      color: colors.textMuted,
    },
    card: {
      marginBottom: Spacing.xl,
    },
    description: {
      fontSize: typography.body.fontSize,
      lineHeight: typography.body.lineHeight,
      fontFamily: typography.body.fontFamily,
      color: colors.textMuted,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
    },
    infoRowDivider: {
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    infoLabel: {
      fontSize: typography.body.fontSize,
      fontFamily: typography.body.fontFamily,
      color: colors.text,
    },
    infoValue: {
      fontSize: typography.bodyMedium.fontSize,
      fontWeight: typography.bodyMedium.fontWeight,
      fontFamily: typography.bodyMedium.fontFamily,
      color: colors.textMuted,
    },
    noteTitle: {
      fontSize: typography.bodyMedium.fontSize,
      fontWeight: typography.bodyMedium.fontWeight,
      fontFamily: typography.bodyMedium.fontFamily,
      color: colors.text,
      marginBottom: Spacing.xs,
    },
    noteText: {
      fontSize: typography.body.fontSize,
      lineHeight: typography.body.lineHeight,
      fontFamily: typography.body.fontFamily,
      color: colors.textMuted,
    },
  });
