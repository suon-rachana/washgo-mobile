import { Ionicons } from '@expo/vector-icons';
import { ComponentProps, ReactNode, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { AppScreen } from '@/src/components/layout';
import { Card } from '@/src/components/ui';
import { useThemeColors } from '@/src/hooks/useThemeColors';
import { useTypography } from '@/src/hooks/useTypography';
import { useTranslation } from '@/src/i18n';
import { useSettingsStore } from '@/src/store/settingsStore';
import { ColorScheme, Radius, Spacing } from '@/src/theme';

interface SettingRowProps {
  icon: ComponentProps<typeof Ionicons>['name'];
  label: string;
  description?: string;
  right?: ReactNode;
  selected?: boolean;
  onPress?: () => void;
  showDivider?: boolean;
  colors: ColorScheme;
  styles: ReturnType<typeof createStyles>;
}

function SettingRow({
  icon,
  label,
  description,
  right,
  selected,
  onPress,
  showDivider = false,
  colors,
  styles,
}: SettingRowProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? (selected !== undefined ? 'radio' : 'button') : undefined}
      accessibilityLabel={onPress ? label : undefined}
      accessibilityState={onPress && selected !== undefined ? { selected } : undefined}
      style={[styles.row, showDivider && styles.rowDivider]}
    >
      <View style={styles.rowIcon}>
        <Ionicons name={icon} size={18} color={colors.primary} />
      </View>
      <View style={styles.rowText}>
        <Text style={styles.rowLabel}>{label}</Text>
        {description ? <Text style={styles.rowDescription}>{description}</Text> : null}
      </View>
      {right}
      {selected !== undefined ? (
        <Ionicons
          name={selected ? 'checkmark-circle' : 'ellipse-outline'}
          size={20}
          color={selected ? colors.primary : colors.border}
        />
      ) : null}
      {onPress && selected === undefined ? (
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      ) : null}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const colors = useThemeColors();
  const typography = useTypography();
  const styles = useMemo(() => createStyles(colors, typography), [colors, typography]);
  const { t } = useTranslation();
  const [pushEnabled, setPushEnabled] = useState(true);

  const themeMode = useSettingsStore((state) => state.themeMode);
  const setThemeMode = useSettingsStore((state) => state.setThemeMode);
  const language = useSettingsStore((state) => state.language);
  const setLanguage = useSettingsStore((state) => state.setLanguage);

  return (
    <AppScreen title={t('settings')}>
        <Text style={styles.sectionLabel}>{t('theme')}</Text>
        <Card variant="outlined" padding="none" style={styles.card}>
          <SettingRow
            icon="sunny-outline"
            label={t('lightMode')}
            showDivider
            selected={themeMode === 'light'}
            onPress={() => setThemeMode('light')}
            colors={colors}
            styles={styles}
          />
          <SettingRow
            icon="moon-outline"
            label={t('darkMode')}
            selected={themeMode === 'dark'}
            onPress={() => setThemeMode('dark')}
            colors={colors}
            styles={styles}
          />
        </Card>

        <Text style={styles.sectionLabel}>{t('language')}</Text>
        <Card variant="outlined" padding="none" style={styles.card}>
          <SettingRow
            icon="language-outline"
            label={t('english')}
            showDivider
            selected={language === 'en'}
            onPress={() => setLanguage('en')}
            colors={colors}
            styles={styles}
          />
          <SettingRow
            icon="language-outline"
            label={t('khmer')}
            selected={language === 'km'}
            onPress={() => setLanguage('km')}
            colors={colors}
            styles={styles}
          />
        </Card>

        <Card variant="outlined" padding="none" style={styles.card}>
          <SettingRow
            icon="notifications-outline"
            label={t('pushNotifications')}
            showDivider
            colors={colors}
            styles={styles}
            right={
              <Switch
                value={pushEnabled}
                onValueChange={setPushEnabled}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={colors.card}
                accessibilityRole="switch"
                accessibilityLabel={t('pushNotifications')}
                accessibilityState={{ checked: pushEnabled }}
              />
            }
          />
          <SettingRow
            icon="cash-outline"
            label={t('currency')}
            right={<Text style={styles.rowValue}>USD</Text>}
            colors={colors}
            styles={styles}
          />
        </Card>

        <Card variant="outlined" padding="none" style={styles.card}>
          <SettingRow
            icon="information-circle-outline"
            label={t('appVersion')}
            right={<Text style={styles.rowValue}>1.0.0</Text>}
            colors={colors}
            styles={styles}
          />
        </Card>
    </AppScreen>
  );
}

const createStyles = (colors: ColorScheme, typography: ReturnType<typeof useTypography>) =>
  StyleSheet.create({
    sectionLabel: {
      fontSize: typography.label.fontSize,
      fontWeight: typography.label.fontWeight,
      letterSpacing: typography.label.letterSpacing,
      fontFamily: typography.label.fontFamily,
      color: colors.textMuted,
      marginBottom: Spacing.xs,
      textTransform: 'uppercase',
    },
    card: {
      marginBottom: Spacing.xl,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.md,
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
    },
    rowDivider: {
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    rowIcon: {
      width: 32,
      height: 32,
      borderRadius: Radius.circle,
      backgroundColor: `${colors.primary}1A`,
      alignItems: 'center',
      justifyContent: 'center',
    },
    rowText: {
      flex: 1,
    },
    rowLabel: {
      fontSize: typography.body.fontSize,
      fontFamily: typography.body.fontFamily,
      color: colors.text,
    },
    rowDescription: {
      fontSize: typography.caption.fontSize,
      fontFamily: typography.caption.fontFamily,
      color: colors.textMuted,
      marginTop: Spacing.xxs,
    },
    rowValue: {
      fontSize: typography.bodyMedium.fontSize,
      fontWeight: typography.bodyMedium.fontWeight,
      fontFamily: typography.bodyMedium.fontFamily,
      color: colors.textMuted,
    },
  });
