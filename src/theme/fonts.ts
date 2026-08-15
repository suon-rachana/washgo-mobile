import type { Language } from '@/src/store/settingsStore';

/**
 * Font-family resolution for WashGo's two supported locales.
 *
 * English keeps using the platform's default system font (San Francisco on
 * iOS, Roboto on Android) — it is never overridden, so English screens look
 * exactly as they did before Khmer support was added.
 *
 * Khmer uses the static Battambang family, loaded once via expo-font in
 * app/_layout.tsx (see BATTAMBANG_FONTS below) and referenced everywhere else
 * purely by family-name string. Battambang only ships Regular and Bold
 * weights upstream, so medium/semibold fall back to the nearest available
 * weight rather than a separate file.
 */

export type FontWeightKey = 'regular' | 'medium' | 'semibold' | 'bold';

export const LatinFontFamily: Record<FontWeightKey, string | undefined> = {
  regular: undefined,
  medium: undefined,
  semibold: undefined,
  bold: undefined,
};

export const KhmerFontFamily: Record<FontWeightKey, string> = {
  regular: 'Battambang-Regular',
  medium: 'Battambang-Regular',
  semibold: 'Battambang-Bold',
  bold: 'Battambang-Bold',
};

// Passed directly to expo-font's useFonts() — the single place the static
// Battambang font files are read from disk. Family-name keys must match
// KhmerFontFamily's values exactly.
export const BATTAMBANG_FONTS: Record<string, number> = {
  'Battambang-Regular': require('../../assets/fonts/Battambang-Regular.ttf'),
  'Battambang-Bold': require('../../assets/fonts/Battambang-Bold.ttf'),
};

// The one place "which font family for this language + weight" is decided —
// every component should call this (directly or via useTypography()) rather
// than branching on language itself.
export function getFontFamily(language: Language, weight: FontWeightKey): string | undefined {
  return language === 'km' ? KhmerFontFamily[weight] : LatinFontFamily[weight];
}
