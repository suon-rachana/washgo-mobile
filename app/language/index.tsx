import { StyleSheet, View } from 'react-native';

import { SelectableOption } from '@/src/components/common';
import { AppScreen } from '@/src/components/layout';
import { useTranslation } from '@/src/i18n';
import { useSettingsStore, type Language } from '@/src/store/settingsStore';
import { Spacing } from '@/src/theme';

// Each language's own name is shown in its own script regardless of the active
// app locale (standard language-picker convention) — not run through t().
const LANGUAGE_OPTIONS: { id: Language; label: string }[] = [
  { id: 'en', label: 'English' },
  { id: 'km', label: 'Khmer / ភាសាខ្មែរ' },
];

export default function LanguageScreen() {
  const { t } = useTranslation();
  const language = useSettingsStore((state) => state.language);
  const setLanguage = useSettingsStore((state) => state.setLanguage);

  return (
    <AppScreen title={t('language')}>
      <View style={styles.optionList}>
        {LANGUAGE_OPTIONS.map((option) => (
          <SelectableOption
            key={option.id}
            title={option.label}
            selected={language === option.id}
            onPress={() => setLanguage(option.id)}
            accessibilityLabel={`Select ${option.label}`}
          />
        ))}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  optionList: {
    gap: Spacing.md,
  },
});
