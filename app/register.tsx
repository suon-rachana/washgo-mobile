import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, Input } from '@/src/components/ui';
import { isSupabaseDataSource } from '@/src/config/dataSource';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useTypography } from '@/src/hooks/useTypography';
import { useTranslation } from '@/src/i18n';
import { useAuthStore } from '@/src/store/auth';
import { ColorScheme, Spacing } from '@/src/theme';
import { authErrorTranslationKey } from '@/src/utils/authErrorMessages';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[0-9\s-]{8,}$/;

interface FormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  password?: string;
}

export default function RegisterScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const typography = useTypography();
  const { t } = useTranslation();
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const signUp = useAuthStore((state) => state.signUp);

  const validate = () => {
    const nextErrors: FormErrors = {};

    if (!fullName.trim()) {
      nextErrors.fullName = 'Enter your full name';
    } else if (fullName.trim().length < 2) {
      nextErrors.fullName = 'Name must be at least 2 characters';
    }

    // Email is only required to create a real Supabase account — the
    // prototype's mock/demo sign-up flow doesn't need one.
    if (isSupabaseDataSource) {
      if (!email.trim()) {
        nextErrors.email = 'Enter your email';
      } else if (!EMAIL_PATTERN.test(email.trim())) {
        nextErrors.email = 'Enter a valid email';
      }
    }

    if (!phone.trim()) {
      nextErrors.phone = 'Enter your phone number';
    } else if (!PHONE_PATTERN.test(phone.trim())) {
      nextErrors.phone = 'Enter a valid phone number';
    }

    if (!password) {
      nextErrors.password = 'Create a password';
    } else if (password.length < 6) {
      nextErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleContinue = async () => {
    if (isSubmitting || !validate()) return;

    if (!isSupabaseDataSource) {
      router.replace('/(tabs)/home');
      return;
    }

    setFormError(null);
    setIsSubmitting(true);
    const success = await signUp({
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      password,
    });
    setIsSubmitting(false);

    if (success) {
      router.replace('/(tabs)/home');
    } else {
      const errorCode = useAuthStore.getState().error;
      setFormError(t(errorCode ? authErrorTranslationKey(errorCode) : 'somethingWentWrong'));
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.title}>Create your account</Text>
            <Text style={styles.subtitle}>Sign up to get your laundry picked up in minutes.</Text>
            {!isSupabaseDataSource ? <Text style={styles.demoBadge}>{t('demoMode')}</Text> : null}
          </View>

          <View style={styles.form}>
            <Input
              label="Full Name"
              placeholder="Jane Doe"
              autoCapitalize="words"
              value={fullName}
              onChangeText={setFullName}
              error={errors.fullName}
              editable={!isSubmitting}
            />
            {isSupabaseDataSource ? (
              <Input
                label="Email"
                placeholder="you@example.com"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                error={errors.email}
                editable={!isSubmitting}
              />
            ) : null}
            <Input
              label="Phone Number"
              placeholder="012 345 678"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              error={errors.phone}
              editable={!isSubmitting}
            />
            <Input
              label="Password"
              placeholder="Create a password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              error={errors.password}
              editable={!isSubmitting}
            />
          </View>

          {formError ? (
            <Text style={styles.formError} accessibilityLiveRegion="polite">
              {formError}
            </Text>
          ) : null}

          <Button
            title={isSubmitting ? t('creatingAccount') : 'Continue'}
            fullWidth
            loading={isSubmitting}
            disabled={isSubmitting}
            onPress={handleContinue}
            style={styles.continueButton}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity
              onPress={() => router.replace('/login')}
              hitSlop={8}
              accessibilityRole="link"
              accessibilityLabel="Login"
              accessibilityHint="Opens the login screen"
              disabled={isSubmitting}
            >
              <Text style={styles.footerLink}>Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (colors: ColorScheme, typography: ReturnType<typeof useTypography>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    flex: {
      flex: 1,
    },
    content: {
      flexGrow: 1,
      justifyContent: 'center',
      paddingHorizontal: Spacing.xl,
    },
    header: {
      marginBottom: Spacing.xxl,
    },
    title: {
      fontSize: typography.headline.fontSize,
      lineHeight: typography.headline.lineHeight,
      fontWeight: typography.headline.fontWeight,
      fontFamily: typography.headline.fontFamily,
      color: colors.text,
      marginBottom: Spacing.xs,
    },
    subtitle: {
      fontSize: typography.body.fontSize,
      lineHeight: typography.body.lineHeight,
      fontWeight: typography.body.fontWeight,
      fontFamily: typography.body.fontFamily,
      color: colors.textMuted,
    },
    demoBadge: {
      fontSize: typography.caption.fontSize,
      lineHeight: typography.caption.lineHeight,
      fontFamily: typography.caption.fontFamily,
      color: colors.primary,
      marginTop: Spacing.xxs,
    },
    form: {
      gap: Spacing.md,
      marginBottom: Spacing.xl,
    },
    formError: {
      fontSize: typography.body.fontSize,
      lineHeight: typography.body.lineHeight,
      fontFamily: typography.body.fontFamily,
      color: colors.danger,
      marginBottom: Spacing.md,
    },
    continueButton: {
      marginBottom: Spacing.xl,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    footerText: {
      fontSize: typography.bodyMedium.fontSize,
      fontFamily: typography.bodyMedium.fontFamily,
      color: colors.textMuted,
    },
    footerLink: {
      fontSize: typography.bodyMedium.fontSize,
      fontWeight: typography.bodyMedium.fontWeight,
      fontFamily: typography.bodyMedium.fontFamily,
      color: colors.primary,
    },
  });
