import { Ionicons } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppScreen } from '@/src/components/layout';
import { Badge, Button, Card } from '@/src/components/ui';
import { DEFAULT_PAYMENT_METHOD_ID, paymentMethods, type PaymentMethod } from '@/src/data/mock';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useTypography } from '@/src/hooks/useTypography';
import { useTranslation, type TranslationKey } from '@/src/i18n';
import { ColorScheme, Radius, Spacing } from '@/src/theme';

// Neither the local typed-routes generator nor a running dev server is
// available right now to pick up this brand-new route, so the literal string
// fails the type check even though it's the correct runtime href. Cast once here.
const ADD_PAYMENT_METHOD_HREF = '/payment-methods/add' as Href;

interface PaymentMethodCardProps {
  method: PaymentMethod;
  isDefault: boolean;
  onSetDefault: () => void;
  colors: ColorScheme;
  styles: ReturnType<typeof createStyles>;
  t: (key: TranslationKey) => string;
}

function PaymentMethodCard({ method, isDefault, onSetDefault, colors, styles, t }: PaymentMethodCardProps) {
  return (
    <Card variant="elevated">
      <View style={styles.cardHeader}>
        <View style={styles.cardIcon}>
          <Ionicons name={method.icon} size={20} color={colors.primary} />
        </View>
        <View style={styles.cardTextWrap}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardLabel}>{method.label}</Text>
            {isDefault ? <Badge label={t('default')} variant="primary" /> : null}
            {method.comingSoon ? <Badge label={t('comingSoon')} variant="warning" /> : null}
          </View>
          <Text style={styles.cardDescription}>{method.description}</Text>
        </View>
      </View>

      {!isDefault ? (
        <Pressable
          onPress={onSetDefault}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`${t('setAsDefault')} ${method.label}`}
          style={styles.setDefaultRow}
        >
          <Text style={styles.setDefaultText}>{t('setAsDefault')}</Text>
        </Pressable>
      ) : null}
    </Card>
  );
}

export default function PaymentMethodsScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const typography = useTypography();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);
  const [defaultMethodId, setDefaultMethodId] = useState(DEFAULT_PAYMENT_METHOD_ID);

  const handleAdd = () => {
    router.push(ADD_PAYMENT_METHOD_HREF);
  };

  return (
    <AppScreen title={t('paymentMethods')}>
      <View style={styles.list}>
        {paymentMethods.map((method) => (
          <PaymentMethodCard
            key={method.id}
            method={method}
            isDefault={defaultMethodId === method.id}
            onSetDefault={() => setDefaultMethodId(method.id)}
            colors={colors}
            styles={styles}
            t={t}
          />
        ))}
      </View>

      <Button
        title="Add Payment Method"
        fullWidth
        icon={<Ionicons name="add" size={16} color={colors.onPrimary} />}
        onPress={handleAdd}
        accessibilityLabel="Add payment method"
        style={styles.addButton}
      />
    </AppScreen>
  );
}

const createStyles = (colors: ColorScheme, typography: ReturnType<typeof useTypography>) =>
  StyleSheet.create({
    list: {
      gap: Spacing.md,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    cardIcon: {
      width: 40,
      height: 40,
      borderRadius: Radius.circle,
      backgroundColor: `${colors.primary}1A`,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: Spacing.md,
    },
    cardTextWrap: {
      flex: 1,
    },
    cardTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.xs,
      marginBottom: Spacing.xxs,
    },
    cardLabel: {
      fontSize: typography.subtitle.fontSize,
      lineHeight: typography.subtitle.lineHeight,
      fontWeight: typography.subtitle.fontWeight,
      fontFamily: typography.subtitle.fontFamily,
      color: colors.text,
    },
    cardDescription: {
      fontSize: typography.body.fontSize,
      lineHeight: typography.body.lineHeight,
      fontFamily: typography.body.fontFamily,
      color: colors.textMuted,
    },
    setDefaultRow: {
      alignSelf: 'flex-start',
      marginTop: Spacing.md,
    },
    setDefaultText: {
      fontSize: typography.bodyMedium.fontSize,
      fontWeight: typography.bodyMedium.fontWeight,
      fontFamily: typography.bodyMedium.fontFamily,
      color: colors.primary,
    },
    addButton: {
      marginTop: Spacing.xl,
    },
  });
