import { useMemo } from 'react';

import { useSettingsStore } from '@/src/store/settingsStore';
import { getTypography, type TypographyVariant, type TypographyVariantKey } from '@/src/theme';

// Locale-aware counterpart to the static `Typography` export — resolves to
// Battambang families + taller Khmer line heights when the active
// language is Khmer, and to the unchanged English tokens otherwise. Mirrors
// useThemeColors()'s pattern so components read it the same way.
export function useTypography(): Record<TypographyVariantKey, TypographyVariant> {
  const language = useSettingsStore((state) => state.language);
  return useMemo(() => getTypography(language), [language]);
}
