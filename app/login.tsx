import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button, Input } from "@/src/components/ui";
import { isSupabaseDataSource } from "@/src/config/dataSource";
import { useThemeColors } from "@/src/hooks/useThemeColors";
import { useTypography } from "@/src/hooks/useTypography";
import { useTranslation } from "@/src/i18n";
import { useAuthStore } from "@/src/store/auth";
import { ColorScheme, Spacing } from "@/src/theme";
import { authErrorTranslationKey } from "@/src/utils/authErrorMessages";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[0-9\s-]{8,}$/;

interface FormErrors {
  identifier?: string;
  password?: string;
}

export default function LoginScreen() {
  const router = useRouter();
  const colors = useThemeColors();
  const typography = useTypography();
  const { t } = useTranslation();

  const styles = useMemo(
    () => createStyles(colors, typography),
    [colors, typography],
  );

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const [errors, setErrors] = useState<FormErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const signIn = useAuthStore((state) => state.signIn);
  const clearError = useAuthStore((state) => state.clearError);

  const validate = (): boolean => {
    const nextErrors: FormErrors = {};
    const trimmedIdentifier = identifier.trim();

    if (!trimmedIdentifier) {
      nextErrors.identifier = "Enter your phone number or email";
    } else if (isSupabaseDataSource) {
      if (!EMAIL_PATTERN.test(trimmedIdentifier)) {
        nextErrors.identifier = "Enter a valid email address";
      }
    } else if (
      !EMAIL_PATTERN.test(trimmedIdentifier) &&
      !PHONE_PATTERN.test(trimmedIdentifier)
    ) {
      nextErrors.identifier = "Enter a valid phone number or email";
    }

    if (!password) {
      nextErrors.password = "Enter your password";
    } else if (password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleContinue = async () => {
    if (isSubmitting) {
      return;
    }

    if (!validate()) {
      return;
    }

    clearError();
    setFormError(null);
    setIsSubmitting(true);

    try {
      if (!isSupabaseDataSource) {
        router.replace("/(tabs)/home");
        return;
      }

      const success = await signIn({
        email: identifier.trim().toLowerCase(),
        password,
      });

      if (!success) {
        const errorCode = useAuthStore.getState().error;

        setFormError(
          t(
            errorCode
              ? authErrorTranslationKey(errorCode)
              : "somethingWentWrong",
          ),
        );

        return;
      }

      const { session, user, isAuthenticated } = useAuthStore.getState();

      if (!session || !user || !isAuthenticated) {
        setFormError(t("somethingWentWrong"));
        return;
      }

      router.replace("/(tabs)/home");
    } catch (error) {
      console.error("[WashGo] Login failed:", error);
      setFormError(t("somethingWentWrong"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleIdentifierChange = (value: string) => {
    setIdentifier(value);

    if (errors.identifier) {
      setErrors((current) => ({
        ...current,
        identifier: undefined,
      }));
    }

    if (formError) {
      setFormError(null);
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);

    if (errors.password) {
      setErrors((current) => ({
        ...current,
        password: undefined,
      }));
    }

    if (formError) {
      setFormError(null);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>Welcome back</Text>

            <Text style={styles.subtitle}>
              Log in to schedule your next pickup.
            </Text>

            {!isSupabaseDataSource ? (
              <Text style={styles.demoBadge}>{t("demoMode")}</Text>
            ) : null}
          </View>

          <View style={styles.form}>
            <Input
              label={isSupabaseDataSource ? "Email" : "Phone or Email"}
              placeholder="you@example.com"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              value={identifier}
              onChangeText={handleIdentifierChange}
              error={errors.identifier}
              editable={!isSubmitting}
            />

            <Input
              label="Password"
              placeholder="Enter your password"
              secureTextEntry
              value={password}
              onChangeText={handlePasswordChange}
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
            title={isSubmitting ? t("signingIn") : "Continue"}
            fullWidth
            loading={isSubmitting}
            disabled={isSubmitting}
            onPress={handleContinue}
            style={styles.continueButton}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don&apos;t have an account? </Text>

            <TouchableOpacity
              onPress={() => router.replace("/register")}
              hitSlop={8}
              accessibilityRole="link"
              accessibilityLabel="Register"
              accessibilityHint="Opens the account registration screen"
              disabled={isSubmitting}
            >
              <Text style={styles.footerLink}>Register</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (
  colors: ColorScheme,
  typography: ReturnType<typeof useTypography>,
) =>
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
      justifyContent: "center",
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
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
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
