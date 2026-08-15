import { useCallback } from 'react';

import { useSettingsStore } from '@/src/store/settingsStore';
import { resolveTranslation, type TranslationKey, type TranslationParams } from './translations';

// Khmer uses the bundled static Battambang weights (see src/theme/fonts.ts);
// English keeps the platform's default system font.
export function useTranslation() {
  const language = useSettingsStore((state) => state.language);

  const t = useCallback(
    (key: TranslationKey, params?: TranslationParams) => resolveTranslation(language, key, params),
    [language]
  );

  return { t, language };
}
