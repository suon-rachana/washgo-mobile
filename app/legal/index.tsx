import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { SectionHeader } from '@/src/components/common';
import { AppScreen } from '@/src/components/layout';
import { Card } from '@/src/components/ui';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useTypography } from '@/src/hooks/useTypography';
import { useTranslation } from '@/src/i18n';
import { ColorScheme, Spacing } from '@/src/theme';

export default function LegalScreen() {
  const colors = useThemeColors();
  const typography = useTypography();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);

  return (
    <AppScreen title={t('termsAndPrivacy')}>
        <Card variant="outlined" style={styles.noticeCard}>
          <View style={styles.noticeRow}>
            <Ionicons name="information-circle-outline" size={18} color={colors.textMuted} />
            <Text style={styles.noticeText}>
              WashGo is an academic thesis project. This page is placeholder content for
              presentation purposes and is not a real legal agreement.
            </Text>
          </View>
        </Card>

        <View style={styles.section}>
          <SectionHeader title="Terms of Service" />
          <Card variant="outlined">
            <Text style={styles.paragraph}>
              By using the WashGo prototype, you agree that all orders, payments, and account data
              shown in the app are simulated for demonstration purposes only. No real laundry
              service is scheduled or delivered, and no real payment is processed.
            </Text>
          </Card>
        </View>

        <View style={[styles.section, styles.lastSection]}>
          <SectionHeader title="Privacy Policy" />
          <Card variant="outlined">
            <Text style={styles.paragraph}>
              The prototype does not send your information to a server or store it outside your
              device session. Profile details, addresses, and payment preferences you enter reset
              the next time the app restarts.
            </Text>
          </Card>
        </View>
    </AppScreen>
  );
}

const createStyles = (colors: ColorScheme, typography: ReturnType<typeof useTypography>) =>
  StyleSheet.create({
    noticeCard: {
      marginBottom: Spacing.xl,
    },
    noticeRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: Spacing.sm,
    },
    noticeText: {
      flex: 1,
      fontSize: typography.caption.fontSize,
      lineHeight: typography.caption.lineHeight,
      fontFamily: typography.caption.fontFamily,
      color: colors.textMuted,
    },
    section: {
      marginBottom: Spacing.xxl,
    },
    lastSection: {
      marginBottom: Spacing.xl,
    },
    paragraph: {
      fontSize: typography.body.fontSize,
      lineHeight: typography.body.lineHeight,
      fontFamily: typography.body.fontFamily,
      color: colors.textMuted,
    },
  });
