import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '@/src/components/layout';
import { Button, Card, EmptyState, Input } from '@/src/components/ui';
import { faqs, type Faq } from '@/src/data/mock';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useTypography } from '@/src/hooks/useTypography';
import { useTranslation } from '@/src/i18n';
import { ColorScheme, Spacing } from '@/src/theme';
import { matchesSearch } from '@/src/utils/search';

interface FaqRowProps {
  faq: Faq;
  expanded: boolean;
  onToggle: () => void;
  colors: ColorScheme;
  styles: ReturnType<typeof createStyles>;
}

function FaqRow({ faq, expanded, onToggle, colors, styles }: FaqRowProps) {
  return (
    <Card
      variant="outlined"
      onPress={onToggle}
      accessibilityLabel={faq.question}
      accessibilityHint={expanded ? 'Collapses this answer' : 'Expands this answer'}
      accessibilityState={{ expanded }}
    >
      <View style={styles.questionRow}>
        <Text style={styles.question} numberOfLines={2}>
          {faq.question}
        </Text>
        <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textMuted} />
      </View>
      {expanded ? <Text style={styles.answer}>{faq.answer}</Text> : null}
    </Card>
  );
}

export default function HelpCenterScreen() {
  const colors = useThemeColors();
  const typography = useTypography();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const visibleFaqs = useMemo(
    () => faqs.filter((faq) => matchesSearch(searchQuery, [faq.question, faq.answer])),
    [searchQuery]
  );

  const handleCallSupport = () => {
    Alert.alert('Call Support', 'Call +855 12 345 678 (mock support line).', [{ text: t('cancel'), style: 'cancel' }]);
  };

  const handleMessageSupport = () => {
    Alert.alert('Message Support', 'Email support@washgo.example (mock support inbox).', [
      { text: t('cancel'), style: 'cancel' },
    ]);
  };

  return (
    <AppScreen title={t('helpCenter')}>
      <Input
        placeholder="Search help..."
        icon={<Ionicons name="search" size={18} color={colors.textMuted} />}
        value={searchQuery}
        onChangeText={setSearchQuery}
        accessibilityRole="search"
        accessibilityLabel="Search help"
        containerStyle={styles.search}
      />

      <Text style={styles.sectionTitle}>{t('frequentlyAskedQuestions')}</Text>
      <View style={styles.faqList}>
        {visibleFaqs.length === 0 ? (
          <EmptyState title="No results found" description="Try a different search term." />
        ) : (
          visibleFaqs.map((faq) => (
            <FaqRow
              key={faq.id}
              faq={faq}
              expanded={expandedId === faq.id}
              onToggle={() => setExpandedId((current) => (current === faq.id ? null : faq.id))}
              colors={colors}
              styles={styles}
            />
          ))
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('contactSupport')}</Text>
        <Card variant="outlined">
          <Text style={styles.contactDescription}>
            Our team is available every day from 8 AM to 8 PM.
          </Text>
          <View style={styles.contactActions}>
            <Button
              title="Call Support"
              variant="outline"
              icon={<Ionicons name="call-outline" size={16} color={colors.primary} />}
              onPress={handleCallSupport}
              accessibilityHint="Shows the WashGo support phone number"
              style={styles.contactButton}
            />
            <Button
              title="Message Support"
              variant="outline"
              icon={<Ionicons name="chatbubble-outline" size={16} color={colors.primary} />}
              onPress={handleMessageSupport}
              accessibilityHint="Shows the WashGo support email address"
              style={styles.contactButton}
            />
          </View>
        </Card>
      </View>
    </AppScreen>
  );
}

const createStyles = (colors: ColorScheme, typography: ReturnType<typeof useTypography>) =>
  StyleSheet.create({
    search: {
      marginBottom: Spacing.xl,
    },
    faqList: {
      gap: Spacing.md,
      marginBottom: Spacing.xl,
    },
    questionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: Spacing.sm,
    },
    question: {
      flex: 1,
      fontSize: typography.bodyMedium.fontSize,
      fontWeight: typography.bodyMedium.fontWeight,
      fontFamily: typography.bodyMedium.fontFamily,
      color: colors.text,
    },
    answer: {
      fontSize: typography.body.fontSize,
      lineHeight: typography.body.lineHeight,
      fontFamily: typography.body.fontFamily,
      color: colors.textMuted,
      marginTop: Spacing.sm,
    },
    section: {
      marginTop: Spacing.md,
    },
    sectionTitle: {
      fontSize: typography.subtitle.fontSize,
      lineHeight: typography.subtitle.lineHeight,
      fontWeight: typography.subtitle.fontWeight,
      fontFamily: typography.subtitle.fontFamily,
      color: colors.text,
      marginBottom: Spacing.md,
    },
    contactDescription: {
      fontSize: typography.body.fontSize,
      lineHeight: typography.body.lineHeight,
      fontFamily: typography.body.fontFamily,
      color: colors.textMuted,
      marginBottom: Spacing.md,
    },
    contactActions: {
      flexDirection: 'row',
      gap: Spacing.sm,
    },
    contactButton: {
      flex: 1,
    },
  });
