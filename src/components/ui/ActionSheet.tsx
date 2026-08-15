import { Ionicons } from '@expo/vector-icons';
import { useMemo, type ComponentProps } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useTypography } from '@/src/hooks/useTypography';
import { ColorScheme, Radius, Shadows, Spacing } from '@/src/theme';

export interface ActionSheetOption {
  label: string;
  onPress: () => void;
  icon?: ComponentProps<typeof Ionicons>['name'];
  destructive?: boolean;
}

export interface ActionSheetProps {
  visible: boolean;
  onClose: () => void;
  options: ActionSheetOption[];
  cancelLabel: string;
  title?: string;
}

// No bottom-sheet library exists in the project yet, so this is a small,
// reusable one built on RN's built-in Modal — a native ActionSheet/Alert
// couldn't cleanly support more than ~3 options across both platforms.
export function ActionSheet({ visible, onClose, options, cancelLabel, title }: ActionSheetProps) {
  const colors = useThemeColors();
  const typography = useTypography();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);

  const handleOptionPress = (option: ActionSheetOption) => {
    onClose();
    option.onPress();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityRole="button" accessibilityLabel={cancelLabel}>
        <Pressable
          style={[styles.sheet, { paddingBottom: insets.bottom + Spacing.md }]}
          onPress={(event) => event.stopPropagation()}
        >
          {title ? <Text style={styles.title}>{title}</Text> : null}

          <View style={styles.optionList}>
            {options.map((option, index) => (
              <Pressable
                key={option.label}
                onPress={() => handleOptionPress(option)}
                accessibilityRole="button"
                accessibilityLabel={option.label}
                style={({ pressed }) => [
                  styles.option,
                  index < options.length - 1 && styles.optionDivider,
                  pressed && styles.optionPressed,
                ]}
              >
                {option.icon ? (
                  <Ionicons
                    name={option.icon}
                    size={20}
                    color={option.destructive ? colors.danger : colors.primary}
                    style={styles.optionIcon}
                  />
                ) : null}
                <Text style={[styles.optionLabel, option.destructive && styles.optionLabelDestructive]}>
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel={cancelLabel} style={styles.cancelButton}>
            <Text style={styles.cancelLabel}>{cancelLabel}</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const createStyles = (colors: ColorScheme, typography: ReturnType<typeof useTypography>) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(15, 23, 42, 0.5)',
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: Radius.xl,
      borderTopRightRadius: Radius.xl,
      paddingTop: Spacing.lg,
      paddingHorizontal: Spacing.xl,
      ...Shadows.lg,
    },
    title: {
      fontSize: typography.label.fontSize,
      fontWeight: typography.label.fontWeight,
      letterSpacing: typography.label.letterSpacing,
      fontFamily: typography.label.fontFamily,
      color: colors.textMuted,
      textTransform: 'uppercase',
      textAlign: 'center',
      marginBottom: Spacing.md,
    },
    optionList: {
      borderRadius: Radius.lg,
      overflow: 'hidden',
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: Spacing.md,
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 52,
      paddingHorizontal: Spacing.lg,
    },
    optionDivider: {
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    optionPressed: {
      backgroundColor: colors.elevatedSurface,
    },
    optionIcon: {
      marginRight: Spacing.xs,
    },
    optionLabel: {
      fontSize: typography.bodyMedium.fontSize,
      fontWeight: typography.bodyMedium.fontWeight,
      fontFamily: typography.bodyMedium.fontFamily,
      color: colors.primary,
    },
    optionLabelDestructive: {
      color: colors.danger,
    },
    cancelButton: {
      minHeight: 52,
      borderRadius: Radius.lg,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cancelLabel: {
      fontSize: typography.bodyMedium.fontSize,
      fontWeight: typography.subtitle.fontWeight,
      fontFamily: typography.bodyMedium.fontFamily,
      color: colors.text,
    },
  });
