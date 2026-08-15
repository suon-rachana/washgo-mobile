import { Stack } from 'expo-router';
import { useMemo, type ReactElement, type ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
  type RefreshControlProps,
} from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { useThemeColors } from '@/src/hooks/useThemeColors';
import { ColorScheme, Spacing } from '@/src/theme';

export interface AppScreenProps {
  /** Native header title. Omit to leave the header title unset (e.g. tab roots that set it elsewhere). */
  title?: string;
  /** Optional single action rendered on the right side of the native header (e.g. a favorite toggle). */
  headerRight?: () => ReactNode;
  /** Defaults to true — set false only for screens that intentionally keep their existing in-page header. */
  headerShown?: boolean;
  /** Wraps children in a ScrollView. Set false for screens that manage their own scrolling list (e.g. FlatList). */
  scroll?: boolean;
  keyboardAvoiding?: boolean;
  /** Safe-area edges to apply. The native header already accounts for the top inset, so only 'bottom' applies by default. */
  edges?: readonly Edge[];
  contentContainerStyle?: StyleProp<ViewStyle>;
  /** Sticky, non-scrolling footer (e.g. a primary CTA button) rendered below the content. */
  footer?: ReactNode;
  /** Forwarded to the internal ScrollView — only used when `scroll` is true. */
  refreshControl?: ReactElement<RefreshControlProps>;
  children: ReactNode;
}

// The one reusable page shell every customer screen should render through:
// native header configuration (title + optional right action), safe area,
// consistent content padding, optional scrolling, and an optional sticky
// footer — so no screen hand-rolls its own header/SafeArea/ScrollView
// boilerplate.
export function AppScreen({
  title,
  headerRight,
  headerShown = true,
  scroll = true,
  keyboardAvoiding = false,
  edges = ['bottom'],
  contentContainerStyle,
  footer,
  refreshControl,
  children,
}: AppScreenProps) {
  const colors = useThemeColors();
  const styles = useMemo(() => createStyles(colors), [colors]);

  const content = scroll ? (
    <ScrollView
      contentContainerStyle={[styles.content, contentContainerStyle]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      refreshControl={refreshControl}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.flex, styles.content, contentContainerStyle]}>{children}</View>
  );

  return (
    <SafeAreaView style={styles.container} edges={edges}>
      <Stack.Screen
        options={{
          headerShown,
          ...(title !== undefined ? { headerTitle: title } : {}),
          ...(headerRight ? { headerRight } : {}),
        }}
      />
      {keyboardAvoiding ? (
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {content}
        </KeyboardAvoidingView>
      ) : (
        content
      )}
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </SafeAreaView>
  );
}

const createStyles = (colors: ColorScheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    flex: {
      flex: 1,
    },
    content: {
      paddingHorizontal: Spacing.xl,
      paddingTop: Spacing.lg,
      paddingBottom: Spacing.xl,
    },
    footer: {
      paddingHorizontal: Spacing.xl,
      paddingTop: Spacing.md,
      paddingBottom: Spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.surface,
      gap: Spacing.sm,
    },
  });
